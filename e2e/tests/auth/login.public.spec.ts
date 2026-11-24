import { test, expect } from "../../fixtures";
import { clearOtp, seedKnownOtp } from "../../support/db";
import { env } from "../../support/env";

test.describe("admin login (signed out)", () => {
  test("redirects an unauthenticated visit to /admin to the login page", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("shows validation messages when the form is empty", async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.continueButton.click();
    await expect(loginPage.page.getByText("Enter a valid email address")).toBeVisible();
    await expect(loginPage.page.getByText("Enter your password")).toBeVisible();
  });

  test("rejects a wrong password and stays on the credentials step", async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.submitCredentials(env.adminEmail, "definitely-wrong-password");
    await expect(loginPage.alert).toContainText(/invalid credentials/i);
    await expect(loginPage.otp).toBeHidden();
  });

  test("moves to the code step with correct credentials and can go back", async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.submitCredentials(env.adminEmail, env.adminPassword);
    await expect(loginPage.otp).toBeVisible();
    await expect(loginPage.page.getByText(env.adminEmail)).toBeVisible();
    await loginPage.backButton.click();
    await expect(loginPage.identifier).toBeVisible();
  });

  test("validates the code format before calling the API", async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.submitCredentials(env.adminEmail, env.adminPassword);
    await expect(loginPage.otp).toBeVisible();
    await loginPage.submitOtp("12ab");
    await expect(loginPage.page.getByText("Enter the 6-digit code", { exact: true })).toBeVisible();
  });

  test("rejects a wrong code", async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.submitCredentials(env.adminEmail, env.adminPassword);
    await expect(loginPage.otp).toBeVisible();
    seedKnownOtp(env.adminEmail);
    await loginPage.submitOtp("000000");
    await expect(loginPage.alert).toBeVisible();
    await expect(loginPage.otp).toBeVisible();
  });

  test("signs in with the right code and keeps tokens out of JavaScript", async ({ page, loginPage, dashboardPage }) => {
    await loginPage.signInAsAdmin();
    await expect(dashboardPage.heading).toBeVisible();

    const cookies = await page.context().cookies();
    const session = cookies.filter((c) => c.name.startsWith("fb_admin_"));
    expect(session.map((c) => c.name).sort()).toEqual(["fb_admin_access", "fb_admin_refresh"]);
    for (const cookie of session) {
      expect(cookie.httpOnly).toBe(true);
      expect(cookie.sameSite).toBe("Lax");
    }
    const visibleToScripts = await page.evaluate(() => document.cookie);
    expect(visibleToScripts).not.toContain("fb_admin_");
  });

  test("rejects a malformed email before calling the API", async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.identifier.fill("not-an-email");
    await loginPage.password.fill("whatever1");
    await loginPage.continueButton.click();
    await expect(loginPage.page.getByText("Enter a valid email address")).toBeVisible();
    await expect(loginPage.otp).toBeHidden();
  });
});

test.describe("admin login form behaviour", () => {
  test("has the admin title and the logo as its favicon", async ({ loginPage, page }) => {
    await loginPage.goto();
    await expect(page).toHaveTitle("Admin sign in | True Drinks");
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute("href", /\/icon\.svg/);
  });

  test("shows and hides the password", async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.password.fill("secret-value");
    await expect(loginPage.password).toHaveAttribute("type", "password");
    await loginPage.passwordToggle.click();
    await expect(loginPage.password).toHaveAttribute("type", "text");
    await loginPage.passwordToggle.click();
    await expect(loginPage.password).toHaveAttribute("type", "password");
  });

  test("clears an error as soon as you edit a field", async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.submitCredentials(env.adminEmail, "definitely-wrong-password");
    await expect(loginPage.alert).toContainText(/invalid credentials/i);
    await loginPage.password.fill("another-attempt");
    await expect(loginPage.alert).toBeHidden();
  });

  test("a wrong code error clears when you type again", async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.submitCredentials(env.adminEmail, env.adminPassword);
    await expect(loginPage.otp).toBeVisible();
    seedKnownOtp(env.adminEmail);
    await loginPage.submitOtp("000000");
    await expect(loginPage.alert).toBeVisible();
    await loginPage.codeStep.boxes.last().press("Backspace");
    await expect(loginPage.alert).toBeHidden();
    await expect(page.getByText("Step 2 of 2")).toBeVisible();
  });

  test("resend code waits for the countdown, then sends a new code", async ({ loginPage, page }) => {
    await page.clock.install();
    await loginPage.goto();
    await loginPage.submitCredentials(env.adminEmail, env.adminPassword);
    await expect(loginPage.otp).toBeVisible();

    await expect(loginPage.resendButton).toBeDisabled();
    await expect(loginPage.resendButton).toContainText("Resend code in");
    await page.clock.fastForward(61_000);
    await expect(loginPage.resendButton).toBeEnabled();

    clearOtp(env.adminEmail); // the API enforces its own 60 second gap on real time
    await loginPage.resendButton.click();
    await expect(page.locator("form [role=status]")).toContainText(`A new code was sent to ${env.adminEmail}`);
    await expect(loginPage.resendButton).toBeDisabled();
  });
});

test.describe("auth layout", () => {
  test("splits the screen into two equal halves with the brand on the form side", async ({ loginPage }) => {
    await loginPage.goto();
    const form = await loginPage.page.locator("main > section").boundingBox();
    const show = await loginPage.slideshow.boundingBox();
    expect(form && show).toBeTruthy();
    expect(Math.abs(form!.width - show!.width)).toBeLessThan(2);
    await expect(loginPage.page.getByText("True Drinks")).toBeVisible();
  });

  test("does not offer Google sign in on the admin side", async ({ loginPage }) => {
    await loginPage.goto();
    await expect(loginPage.page.getByRole("button", { name: /google/i })).toHaveCount(0);
  });

  test("shows the step and the email the code was sent to", async ({ loginPage }) => {
    await loginPage.goto();
    await expect(loginPage.page.getByText("Step 1 of 2")).toBeVisible();
    await loginPage.submitCredentials(env.adminEmail, env.adminPassword);
    await expect(loginPage.page.getByText("Step 2 of 2")).toBeVisible();
    await expect(loginPage.otpBoxes).toHaveCount(6);
    await expect(loginPage.page.getByText(env.adminEmail)).toBeVisible();
  });

  test("code boxes advance, accept paste and delete backwards", async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.submitCredentials(env.adminEmail, env.adminPassword);
    await loginPage.otpBoxes.first().click();
    await loginPage.page.keyboard.type("123");
    await expect(loginPage.otpBoxes.nth(2)).toHaveValue("3");
    await expect(loginPage.otpBoxes.nth(3)).toBeFocused();
    await loginPage.page.keyboard.press("Backspace");
    await expect(loginPage.otpBoxes.nth(2)).toHaveValue("");
    await loginPage.page.keyboard.press("Backspace");
    await expect(loginPage.otpBoxes.nth(1)).toHaveValue("");
    await expect(loginPage.otpBoxes.nth(1)).toBeFocused();

    // Paste fills every box at once.
    await loginPage.page.evaluate(() => {
      const el = document.activeElement as HTMLInputElement;
      const data = new DataTransfer();
      data.setData("text", "987654");
      el.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true }));
    });
    for (let i = 0; i < 6; i++) {
      await expect(loginPage.otpBoxes.nth(i)).toHaveValue("987654"[i]);
    }
  });

  test("slideshow can be driven by its progress bars and arrows", async ({ loginPage }) => {
    await loginPage.goto();
    const active = loginPage.slideshow.locator('[data-active="true"]');
    await expect(active).toHaveCount(1);
    await expect(active).toContainText("Crafted spirits");
    await loginPage.slideshow.getByRole("button", { name: /Show slide 3/ }).click();
    await expect(active).toContainText("Fine wines");
    await loginPage.slideshow.getByRole("button", { name: "Next slide" }).click({ force: true });
    await expect(active).toContainText("Mixers and more");
    await loginPage.slideshow.getByRole("button", { name: "Previous slide" }).click({ force: true });
    await expect(active).toContainText("Fine wines");
    await loginPage.slideshow.getByRole("button", { name: "Next slide" }).click({ force: true });
    await loginPage.slideshow.getByRole("button", { name: "Next slide" }).click({ force: true });
    await expect(active).toContainText("Crafted spirits"); // wraps around
  });

  test("slideshow shows photo backgrounds that actually load", async ({ loginPage }) => {
    await loginPage.goto();
    const photos = loginPage.slideshow.locator("img");
    await expect(photos).toHaveCount(5);
    await expect.poll(() => photos.first().evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    // Served resized by Next, not the multi megabyte original.
    expect(await photos.first().getAttribute("src")).toContain("/_next/image");
  });

  test("slideshow advances on its own and pauses while hovered", async ({ loginPage, page }) => {
    await page.clock.install();
    await loginPage.goto();
    const active = loginPage.slideshow.locator('[data-active="true"]');
    await expect(active).toContainText("Crafted spirits");

    await page.clock.runFor(5_300);
    await expect(active).toContainText("Cold beers and ciders");

    await loginPage.slideshow.hover();
    await expect(loginPage.slideshow).toHaveAttribute("data-paused", "true");
    await page.clock.runFor(12_000);
    await expect(active).toContainText("Cold beers and ciders");

    await page.mouse.move(5, 5);
    await expect(loginPage.slideshow).toHaveAttribute("data-paused", "false");
    await page.clock.runFor(5_300);
    await expect(active).toContainText("Fine wines");
  });

  test("slideshow resumes after a click and pauses for keyboard focus", async ({ loginPage, page }) => {
    await page.clock.install();
    await loginPage.goto();
    const active = loginPage.slideshow.locator('[data-active="true"]');
    await loginPage.slideshow.getByRole("button", { name: /Show slide 2/ }).click();
    await page.mouse.move(5, 5);
    await page.clock.runFor(5_300);
    await expect(active).toContainText("Fine wines"); // a mouse click must not leave it paused

    await loginPage.slideshow.getByRole("button", { name: /Show slide 3/ }).focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(loginPage.slideshow).toHaveAttribute("data-paused", "true");
    await page.clock.runFor(12_000);
    await expect(active).toContainText("Fine wines");
  });

  test("slideshow stays still when reduced motion is requested", async ({ loginPage, page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.clock.install();
    await loginPage.goto();
    await page.clock.runFor(12_000);
    await expect(loginPage.slideshow.locator('[data-active="true"]')).toContainText("Crafted spirits");
  });

  test("hides the slideshow on small screens", async ({ loginPage }) => {
    await loginPage.page.setViewportSize({ width: 600, height: 800 });
    await loginPage.goto();
    await expect(loginPage.slideshow).toBeHidden();
    await expect(loginPage.identifier).toBeVisible();
  });
});

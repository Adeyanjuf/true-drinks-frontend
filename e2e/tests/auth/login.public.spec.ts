import { test, expect } from "../../fixtures";
import { seedKnownOtp } from "../../support/db";
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

  test("slideshow can be driven by its dots", async ({ loginPage }) => {
    await loginPage.goto();
    const active = loginPage.slideshow.locator('[data-active="true"]');
    await expect(active).toHaveCount(1);
    await loginPage.slideshow.getByRole("button", { name: /Show slide 3/ }).click();
    await expect(active).toContainText("Cold beers and ciders");
  });

  test("hides the slideshow on small screens", async ({ loginPage }) => {
    await loginPage.page.setViewportSize({ width: 600, height: 800 });
    await loginPage.goto();
    await expect(loginPage.slideshow).toBeHidden();
    await expect(loginPage.identifier).toBeVisible();
  });
});

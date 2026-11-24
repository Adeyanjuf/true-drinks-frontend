import { test, expect } from "../../fixtures";
import { clearOtp, seedKnownOtp } from "../../support/db";
import { env } from "../../support/env";

test.describe("customer sign in", () => {
  test("has the brand title, a Google option and links to the other auth pages", async ({ page, customerAuth }) => {
    await customerAuth.gotoLogin();
    await expect(page).toHaveTitle("True Drinks");
    await expect(customerAuth.googleButton).toHaveText("Continue with Google");
    await page.getByRole("link", { name: "Create an account" }).click();
    await expect(page).toHaveURL(/\/register$/);
    await customerAuth.gotoLogin();
    await page.getByRole("link", { name: "Forgot password?" }).click();
    await expect(page).toHaveURL(/\/forgot-password$/);
  });

  test("shows validation messages when the form is empty", async ({ page, customerAuth }) => {
    await customerAuth.gotoLogin();
    await customerAuth.continueButton.click();
    await expect(page.getByText("Enter a valid email address")).toBeVisible();
    await expect(page.getByText("Enter your password")).toBeVisible();
  });

  test("shows and hides the password", async ({ customerAuth }) => {
    await customerAuth.gotoLogin();
    await customerAuth.password.fill("secret-value");
    await expect(customerAuth.password).toHaveAttribute("type", "password");
    await customerAuth.passwordToggle.click();
    await expect(customerAuth.password).toHaveAttribute("type", "text");
    await expect(customerAuth.passwordToggle).toHaveAccessibleName("Hide password");
    await customerAuth.passwordToggle.click();
    await expect(customerAuth.password).toHaveAttribute("type", "password");
  });

  test("rejects a wrong password, then clears the message as soon as you edit", async ({ customer, customerAuth }) => {
    await customerAuth.gotoLogin();
    await customerAuth.submitCredentials(customer.email, "definitely-wrong-password");
    await expect(customerAuth.alert).toContainText(/invalid credentials/i);
    await customerAuth.code.boxes.first().waitFor({ state: "hidden" });
    await customerAuth.password.fill("something-else");
    await expect(customerAuth.alert).toBeHidden();
  });

  test("the message can be dismissed", async ({ customer, customerAuth, page }) => {
    await customerAuth.gotoLogin();
    await customerAuth.submitCredentials(customer.email, "definitely-wrong-password");
    await expect(customerAuth.alert).toBeVisible();
    await page.getByRole("button", { name: "Dismiss message" }).click();
    await expect(customerAuth.alert).toBeHidden();
  });

  test("moves to the code step, names the email, and can go back", async ({ customer, customerAuth, page }) => {
    clearOtp(customer.email);
    await customerAuth.gotoLogin();
    await customerAuth.submitCredentials(customer.email, customer.password);
    await customerAuth.code.expectVisible();
    await expect(page.getByText("Step 2 of 2")).toBeVisible();
    await expect(page.getByText(customer.email)).toBeVisible();
    await customerAuth.code.back.click();
    await expect(customerAuth.email).toHaveValue(customer.email);
  });

  test("validates the code format and clears errors when you type again", async ({ customer, customerAuth, page }) => {
    clearOtp(customer.email);
    await customerAuth.gotoLogin();
    await customerAuth.submitCredentials(customer.email, customer.password);
    await customerAuth.code.expectVisible();
    await customerAuth.code.submitCode("12ab");
    await expect(page.getByText("Enter the 6-digit code", { exact: true })).toBeVisible();

    seedKnownOtp(customer.email);
    await customerAuth.code.boxes.first().click();
    await page.keyboard.press("Control+A");
    await customerAuth.code.enter("000000");
    await customerAuth.code.submit.click();
    await expect(customerAuth.alert).toBeVisible();
    await customerAuth.code.boxes.last().press("Backspace");
    await expect(customerAuth.alert).toBeHidden();
  });

  test("resend code waits for the countdown, then sends a new code", async ({ customer, customerAuth, page }) => {
    await page.clock.install();
    clearOtp(customer.email);
    await customerAuth.gotoLogin();
    await customerAuth.submitCredentials(customer.email, customer.password);
    await customerAuth.code.expectVisible();

    await expect(customerAuth.code.resend).toBeDisabled();
    await expect(customerAuth.code.resend).toContainText("Resend code in");
    await page.clock.fastForward(61_000);
    await expect(customerAuth.code.resend).toBeEnabled();
    await expect(customerAuth.code.resend).toHaveText("Resend code");

    clearOtp(customer.email); // the API enforces its own 60 second gap on real time
    await customerAuth.code.resend.click();
    await expect(customerAuth.status).toContainText(`A new code was sent to ${customer.email}`);
    await expect(customerAuth.code.resend).toBeDisabled();
  });

  test("signs in with the right code and keeps tokens out of JavaScript", async ({ customer, customerAuth, page }) => {
    await customerAuth.signIn(customer);
    await expect(page.getByRole("heading", { name: `Welcome, ${customer.name}` })).toBeVisible();

    const session = (await page.context().cookies()).filter((c) => c.name.startsWith("fb_customer_"));
    expect(session.map((c) => c.name).sort()).toEqual(["fb_customer_access", "fb_customer_refresh", "fb_customer_user"]);
    for (const cookie of session) {
      expect(cookie.httpOnly).toBe(true);
      expect(cookie.sameSite).toBe("Lax");
    }
    expect(await page.evaluate(() => document.cookie)).toBe("");
  });

  test("an administrator cannot sign in on the customer page", async ({ customerAuth, page }) => {
    clearOtp(env.adminEmail);
    await customerAuth.gotoLogin();
    await customerAuth.submitCredentials(env.adminEmail, env.adminPassword);
    await customerAuth.code.expectVisible();
    seedKnownOtp(env.adminEmail);
    await customerAuth.code.submitCode(env.otp);
    await expect(customerAuth.alert).toContainText("Administrators sign in from the admin page");
    await expect(page).toHaveURL(/\/login$/);
    expect((await page.context().cookies()).some((c) => c.name.startsWith("fb_customer_access"))).toBe(false);
  });
});

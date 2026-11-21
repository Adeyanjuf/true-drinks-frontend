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
    await expect(loginPage.page.getByText("Enter your email or username")).toBeVisible();
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
});

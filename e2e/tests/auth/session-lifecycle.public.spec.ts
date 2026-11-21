import { test, expect } from "../../fixtures";

// These tests change the session (token rotation, revocation), so each one
// signs in on its own instead of sharing the saved admin session.
test.describe("admin session lifecycle", () => {
  test("renews an expired access token through the refresh token", async ({ page, context, loginPage, dashboardPage }) => {
    await loginPage.signInAsAdmin();
    const before = (await context.cookies()).find((c) => c.name === "fb_admin_refresh")!.value;

    // Simulate the access token expiring: the browser drops its cookie.
    await context.clearCookies({ name: "fb_admin_access" });
    await page.goto("/admin");

    await expect(dashboardPage.heading).toBeVisible();
    const cookies = await context.cookies();
    expect(cookies.find((c) => c.name === "fb_admin_access")).toBeTruthy();
    expect(cookies.find((c) => c.name === "fb_admin_refresh")!.value).not.toBe(before);
  });

  test("sends a forged session back to the login page", async ({ page, context }) => {
    await context.addCookies([
      { name: "fb_admin_refresh", value: "forged", domain: "localhost", path: "/", httpOnly: true },
    ]);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("signs out and blocks the dashboard afterwards", async ({ page, loginPage, dashboardPage }) => {
    await loginPage.signInAsAdmin();
    await dashboardPage.signOut.click();
    await expect(page).toHaveURL(/\/admin\/login$/);

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });
});

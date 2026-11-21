import { test, expect } from "../../fixtures";

test.describe("admin session (signed in)", () => {
  test("shows the dashboard shell", async ({ dashboardPage }) => {
    await dashboardPage.goto();
    await expect(dashboardPage.heading).toBeVisible();
    await expect(dashboardPage.nav.getByRole("link", { name: "Dashboard" })).toHaveAttribute("aria-current", "page");
  });

  test("keeps a signed in admin away from the login page", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page).toHaveURL(/\/admin$/);
  });
});

import { test, expect } from "../../fixtures";

// Runs with the saved admin session: a customer signing in on top must not disturb it.
test("an admin and a customer can be signed in in the same browser", async ({ customer, customerAuth, dashboardPage, page }) => {
  await dashboardPage.goto();
  await expect(dashboardPage.heading).toBeVisible();

  await customerAuth.signIn(customer);
  await expect(page.getByRole("heading", { name: `Welcome, ${customer.name}` })).toBeVisible();

  await dashboardPage.goto();
  await expect(dashboardPage.heading).toBeVisible();

  await page.goto("/");
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
  await dashboardPage.goto();
  await expect(dashboardPage.heading).toBeVisible();
});

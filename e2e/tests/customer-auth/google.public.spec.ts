import { test, expect } from "../../fixtures";

// Real Google consent cannot be automated, so these cover everything on our side:
// the redirect that starts the flow and the two pages Google sends people back to.
test.describe("Google sign in and sign up", () => {
  test("the start link is handed to the API's Google redirect", async ({ request }) => {
    const res = await request.get("/api/auth/google", { maxRedirects: 0 });
    expect(res.status()).toBe(307);
    expect(res.headers()["location"]).toMatch(/\/api\/auth\/google$/);
  });

  test("the callback page explains a missing code", async ({ page }) => {
    await page.goto("/auth/callback");
    await expect(page.getByRole("heading", { name: "Google sign in failed" })).toBeVisible();
    await expect(page.getByRole("alert").filter({ hasText: "incomplete" })).toBeVisible();
    await page.getByRole("link", { name: "Back to sign in" }).click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("the callback page shows the API error for an expired code", async ({ page }) => {
    await page.goto("/auth/callback?code=not-a-real-code");
    await expect(page.getByRole("heading", { name: "Google sign in failed" })).toBeVisible();
    await expect(page.locator("main [role=alert]")).toBeVisible();
    expect((await page.context().cookies()).some((c) => c.name.startsWith("fb_customer_access"))).toBe(false);
  });

  test("a successful exchange signs the customer in and goes home", async ({ page }) => {
    // Stubbed: the API only issues a code after a real Google consent.
    await page.route("**/api/auth/google-exchange", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ user: { name: "G" } }) }),
    );
    await page.goto("/auth/callback?code=stubbed");
    await expect(page).toHaveURL(/\/$/);
  });

  test("complete profile without a ticket is explained", async ({ page }) => {
    await page.goto("/auth/complete-profile");
    await expect(page.getByRole("heading", { name: "This link is not valid" })).toBeVisible();
    await page.getByRole("link", { name: "Back to sign up" }).click();
    await expect(page).toHaveURL(/\/register$/);
  });

  test("complete profile validates and shows username availability", async ({ customer, newCustomer, page }) => {
    await page.goto("/auth/complete-profile?ticket=stub");
    await expect(page.getByRole("heading", { name: "Almost there" })).toBeVisible();
    await page.getByLabel("Username").fill(customer.username);
    await expect(page.getByText("That username is taken")).toBeVisible();
    await page.getByLabel("Username").fill(newCustomer.username);
    await expect(page.getByText("Username is available")).toBeVisible();

    await page.getByLabel("Password", { exact: true }).fill("abcdefgh");
    await page.getByLabel("Confirm password").fill("mismatch1");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("The passwords do not match")).toBeVisible();
  });

  test("complete profile reports an expired ticket from the API", async ({ newCustomer, page }) => {
    await page.goto("/auth/complete-profile?ticket=expired-ticket");
    await page.getByLabel("Username").fill(newCustomer.username);
    await page.getByLabel("Password", { exact: true }).fill(newCustomer.password);
    await page.getByLabel("Confirm password").fill(newCustomer.password);
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.locator("form [role=alert]")).toBeVisible();
    await page.getByLabel("Username").press("x");
    await expect(page.locator("form [role=alert]")).toBeHidden();
  });
});

import { test, expect } from "../../fixtures";

// These change the session (rotation, sign out), so each signs in on its own.
test.describe("customer session", () => {
  test("the home page shows signed out options when there is no session", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Create account" })).toBeVisible();
  });

  test("signed in customers are sent away from sign in and sign up", async ({ customer, customerAuth, page }) => {
    await customerAuth.signIn(customer);
    await page.goto("/login");
    await expect(page).toHaveURL(/\/$/);
    await page.goto("/register");
    await expect(page).toHaveURL(/\/$/);
  });

  test("renews an expired access token through the refresh token", async ({ customer, customerAuth, page, context }) => {
    await customerAuth.signIn(customer);
    const before = (await context.cookies()).find((c) => c.name === "fb_customer_refresh")!.value;

    await context.clearCookies({ name: "fb_customer_access" });
    await page.goto("/");

    await expect(page.getByRole("heading", { name: `Welcome, ${customer.name}` })).toBeVisible();
    const cookies = await context.cookies();
    expect(cookies.find((c) => c.name === "fb_customer_access")).toBeTruthy();
    expect(cookies.find((c) => c.name === "fb_customer_refresh")!.value).not.toBe(before);
  });

  test("sends a forged session back to sign in", async ({ context, page }) => {
    await context.addCookies([
      { name: "fb_customer_refresh", value: "forged", domain: "localhost", path: "/", httpOnly: true },
    ]);
    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("signs out and shows the signed out home page", async ({ customer, customerAuth, page, context }) => {
    await customerAuth.signIn(customer);
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
    const names = (await context.cookies()).map((c) => c.name);
    expect(names.some((n) => n.startsWith("fb_customer_"))).toBe(false);
  });

  test("a customer cannot open the admin area", async ({ customer, customerAuth, page }) => {
    await customerAuth.signIn(customer);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });
});

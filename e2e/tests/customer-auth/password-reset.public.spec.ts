import { test, expect } from "../../fixtures";

// The API rate limits forgot password to 3 per 15 minutes and sends real email, so the
// happy paths stub the app's own route. The error paths hit the real API.
test.describe("forgot password", () => {
  test("validates the email", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(page.getByText("Enter a valid email address")).toBeVisible();
  });

  test("answers generically and clears the message when you edit", async ({ page }) => {
    await page.route("**/api/auth/forgot-password", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) }),
    );
    await page.goto("/forgot-password");
    await page.getByLabel("Email").fill("someone@example.invalid");
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(page.locator("form [role=status]")).toContainText(
      "If an account exists for someone@example.invalid, a reset link is on its way.",
    );
    await page.getByLabel("Email").press("x");
    await expect(page.locator("form [role=status]")).toBeHidden();
  });

  test("shows the API message when too many requests are made", async ({ page }) => {
    await page.route("**/api/auth/forgot-password", (route) =>
      route.fulfill({ status: 429, contentType: "application/json", body: JSON.stringify({ message: "Too many requests" }) }),
    );
    await page.goto("/forgot-password");
    await page.getByLabel("Email").fill("someone@example.invalid");
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(page.locator("form [role=alert]")).toContainText("Too many requests");
  });

  test("links back to sign in", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.getByRole("link", { name: "Back to sign in" }).click();
    await expect(page).toHaveURL(/\/login$/);
  });
});

test.describe("reset password", () => {
  test("explains a link with no token", async ({ page }) => {
    await page.goto("/reset-password");
    await expect(page.getByRole("heading", { name: "This link is not valid" })).toBeVisible();
    await page.getByRole("link", { name: "Request a new link" }).click();
    await expect(page).toHaveURL(/\/forgot-password$/);
  });

  test("validates length and confirmation", async ({ page }) => {
    await page.goto("/reset-password?token=abc");
    await page.getByRole("button", { name: "Update password" }).click();
    await expect(page.getByText("Use at least 8 characters")).toBeVisible();
    await expect(page.getByText("Confirm your new password")).toBeVisible();

    await page.getByLabel("New password").fill("longenough1");
    await page.getByLabel("Confirm password").fill("different1");
    await page.getByRole("button", { name: "Update password" }).click();
    await expect(page.getByText("The passwords do not match")).toBeVisible();
  });

  test("rejects an invalid or expired token with the API message", async ({ page }) => {
    await page.goto("/reset-password?token=not-a-real-token");
    await page.getByLabel("New password").fill("longenough1");
    await page.getByLabel("Confirm password").fill("longenough1");
    await page.getByRole("button", { name: "Update password" }).click();
    await expect(page.locator("form [role=alert]")).toBeVisible();
  });

  test("confirms the change and offers sign in", async ({ page }) => {
    await page.route("**/api/auth/reset-password", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) }),
    );
    await page.goto("/reset-password?token=stubbed");
    await page.getByLabel("New password").fill("longenough1");
    await page.getByLabel("Confirm password").fill("longenough1");
    await page.getByRole("button", { name: "Update password" }).click();
    await expect(page.getByRole("heading", { name: "Password updated" })).toBeVisible();
    await page.getByRole("link", { name: "Go to sign in" }).click();
    await expect(page).toHaveURL(/\/login$/);
  });
});

import { test, expect } from "../../fixtures";
import { clearOtp } from "../../support/db";

test.describe("customer sign up", () => {
  test("shows validation messages when the form is empty", async ({ page, customerAuth }) => {
    await customerAuth.gotoRegister();
    await customerAuth.continueButton.click();
    await expect(page.getByText("Enter your name")).toBeVisible();
    await expect(page.getByText("Enter a valid email address")).toBeVisible();
    await expect(page.getByText("Use 3 to 20 letters, numbers or underscores")).toBeVisible();
    await expect(page.getByText("Use at least 8 characters")).toBeVisible();
    await expect(page.getByText("Confirm your password")).toBeVisible();
  });

  test("offers Google sign up", async ({ customerAuth }) => {
    await customerAuth.gotoRegister();
    await expect(customerAuth.googleButton).toHaveText("Sign up with Google");
  });

  test("requires the confirm password to match, and rechecks when either changes", async ({ newCustomer, customerAuth, page }) => {
    await customerAuth.gotoRegister();
    await customerAuth.fillRegistration(newCustomer, "different-password");
    await customerAuth.continueButton.click();
    await expect(page.getByText("The passwords do not match")).toBeVisible();

    await customerAuth.password.fill("different-password");
    await expect(page.getByText("The passwords do not match")).toBeHidden();
  });

  test("both password fields can be shown and hidden", async ({ customerAuth }) => {
    await customerAuth.gotoRegister();
    await expect(customerAuth.passwordToggle).toHaveCount(2);
    await customerAuth.password.fill("abcdefgh");
    await customerAuth.passwordToggle.first().click();
    await expect(customerAuth.password).toHaveAttribute("type", "text");
    await expect(customerAuth.confirm).toHaveAttribute("type", "password");
  });

  test("checks username availability as you type", async ({ customer, newCustomer, customerAuth, page }) => {
    await customerAuth.gotoRegister();
    await customerAuth.username.fill(customer.username);
    await expect(page.getByText("That username is taken")).toBeVisible();
    await customerAuth.username.fill(newCustomer.username);
    await expect(page.getByText("Username is available")).toBeVisible();
    await customerAuth.username.fill("a!");
    await customerAuth.continueButton.click();
    await expect(page.getByText("Use 3 to 20 letters, numbers or underscores")).toBeVisible();
  });

  test("reports an email that already has an account", async ({ customer, newCustomer, customerAuth }) => {
    await customerAuth.gotoRegister();
    await customerAuth.fillRegistration({ ...newCustomer, email: customer.email });
    await customerAuth.submitRegistration();
    await expect(customerAuth.alert).toContainText(/already|exists|registered/i);
    await customerAuth.name.fill("Edited name");
    await expect(customerAuth.alert).toBeHidden();
  });

  test("moves to the code step, names the email, and keeps the details when you go back", async ({ newCustomer, customerAuth, page }) => {
    await customerAuth.gotoRegister();
    await customerAuth.fillRegistration(newCustomer);
    await customerAuth.submitRegistration();
    await customerAuth.code.expectVisible();
    await expect(page.getByText("Step 2 of 2")).toBeVisible();
    await expect(page.getByText(newCustomer.email)).toBeVisible();

    await customerAuth.code.back.click();
    await expect(customerAuth.name).toHaveValue(newCustomer.name);
    await expect(customerAuth.email).toHaveValue(newCustomer.email);
    await expect(customerAuth.username).toHaveValue(newCustomer.username);
    await expect(customerAuth.password).toHaveValue(newCustomer.password);
    await expect(customerAuth.confirm).toHaveValue(newCustomer.password);
  });

  test("creates the account and signs in with the emailed code", async ({ newCustomer, customerAuth, page }) => {
    await customerAuth.gotoRegister();
    await customerAuth.fillRegistration(newCustomer);
    await customerAuth.submitRegistration();
    await customerAuth.enterKnownCode(newCustomer.email);

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { name: `Welcome, ${newCustomer.name}` })).toBeVisible();
    clearOtp(newCustomer.email);
  });
});

import { expect, type Locator, type Page } from "@playwright/test";
import { reserveAuthRequest } from "../support/rate-limit";
import { clearOtp, seedKnownOtp } from "../support/db";
import { env } from "../support/env";
import type { TestCustomer } from "../support/customers";
import { OtpStep } from "./otp-step";

/** Customer sign in, sign up, Google and reset password pages. */
export class CustomerAuthPage {
  readonly code: OtpStep;
  readonly name: Locator;
  readonly email: Locator;
  readonly username: Locator;
  readonly password: Locator;
  readonly confirm: Locator;
  readonly passwordToggle: Locator;
  readonly continueButton: Locator;
  readonly googleButton: Locator;
  readonly alert: Locator;
  readonly status: Locator;
  readonly slideshow: Locator;

  constructor(readonly page: Page) {
    this.code = new OtpStep(page);
    this.name = page.getByLabel("Full name");
    this.email = page.getByLabel("Email", { exact: true });
    this.username = page.getByLabel("Username");
    this.password = page.getByLabel("Password", { exact: true });
    this.confirm = page.getByLabel("Confirm password");
    this.passwordToggle = page.getByRole("button", { name: /^(Show|Hide) password$/ });
    this.continueButton = page.getByRole("button", { name: "Continue", exact: true });
    this.googleButton = page.getByRole("link", { name: /with Google$/ });
    this.alert = page.locator("form [role=alert]");
    this.status = page.locator("form [role=status]");
    this.slideshow = page.getByTestId("auth-slideshow");
  }

  async gotoLogin() {
    await this.page.goto("/login");
    await expect(this.page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  }

  async gotoRegister() {
    await this.page.goto("/register");
    await expect(this.page.getByRole("heading", { name: "Create your account" })).toBeVisible();
  }

  async submitCredentials(email: string, password: string) {
    await this.email.fill(email);
    await this.password.fill(password);
    await reserveAuthRequest();
    await this.continueButton.click();
  }

  async fillRegistration(customer: TestCustomer, confirm = customer.password) {
    await this.name.fill(customer.name);
    await this.email.fill(customer.email);
    await this.username.fill(customer.username);
    await this.password.fill(customer.password);
    await this.confirm.fill(confirm);
  }

  async submitRegistration() {
    await reserveAuthRequest();
    await this.continueButton.click();
  }

  /** The API holds the code hashed, so swap in the known test code first. */
  async enterKnownCode(email: string) {
    await this.code.expectVisible();
    seedKnownOtp(email);
    await this.code.submitCode(env.otp);
  }

  async signIn(customer: TestCustomer) {
    clearOtp(customer.email);
    await this.gotoLogin();
    await this.submitCredentials(customer.email, customer.password);
    await this.enterKnownCode(customer.email);
    await expect(this.page).toHaveURL(/\/$/);
  }
}

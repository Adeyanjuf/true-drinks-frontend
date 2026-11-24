import { expect, type Locator, type Page } from "@playwright/test";
import { seedKnownOtp } from "../support/db";
import { env } from "../support/env";
import { reserveAuthRequest } from "../support/rate-limit";
import { OtpStep } from "./otp-step";

export class LoginPage {
  readonly heading: Locator;
  readonly identifier: Locator;
  readonly password: Locator;
  readonly otp: Locator;
  readonly passwordToggle: Locator;
  readonly codeStep: OtpStep;
  readonly resendButton: Locator;
  readonly otpBoxes: Locator;
  readonly slideshow: Locator;
  readonly continueButton: Locator;
  readonly signInButton: Locator;
  readonly backButton: Locator;
  readonly alert: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByText("Admin sign in");
    this.identifier = page.getByLabel("Email", { exact: true });
    this.password = page.getByLabel("Password", { exact: true });
    this.passwordToggle = page.getByRole("button", { name: /^(Show|Hide) password$/ });
    this.codeStep = new OtpStep(page);
    this.resendButton = this.codeStep.resend;
    this.otp = page.getByRole("group", { name: "Verification code" });
    this.otpBoxes = this.otp.getByRole("textbox");
    this.slideshow = page.getByTestId("auth-slideshow");
    this.continueButton = page.getByRole("button", { name: "Continue" });
    this.signInButton = page.getByRole("button", { name: "Sign in" });
    this.backButton = page.getByRole("button", { name: "Back" });
    this.alert = page.locator("form [role=alert]");
  }

  async goto() {
    await this.page.goto("/admin/login");
    await expect(this.heading).toBeVisible();
  }

  async submitCredentials(identifier: string, password: string) {
    await this.identifier.fill(identifier);
    await this.password.fill(password);
    await reserveAuthRequest();
    await this.continueButton.click();
  }

  async submitOtp(code: string) {
    await this.otpBoxes.first().click();
    await this.page.keyboard.type(code);
    await reserveAuthRequest();
    await this.signInButton.click();
  }

  /** Full sign in with the real API, using the seeded known OTP. */
  async signInAsAdmin() {
    await this.goto();
    await this.submitCredentials(env.adminEmail, env.adminPassword);
    await expect(this.otp).toBeVisible();
    seedKnownOtp(env.adminEmail);
    await this.submitOtp(env.otp);
    await this.page.waitForURL("**/admin");
  }
}

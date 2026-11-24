import { expect, type Locator, type Page } from "@playwright/test";
import { reserveAuthRequest } from "../support/rate-limit";

/** The six box code step shared by admin sign in, customer sign in and sign up. */
export class OtpStep {
  readonly group: Locator;
  readonly boxes: Locator;
  readonly submit: Locator;
  readonly resend: Locator;
  readonly back: Locator;

  constructor(readonly page: Page) {
    this.group = page.getByRole("group", { name: "Verification code" });
    this.boxes = this.group.getByRole("textbox");
    this.submit = page.locator("form").getByRole("button", { name: /^(Sign in|Verify and continue)$/ });
    this.resend = page.getByRole("button", { name: /^Resend code/ });
    this.back = page.getByRole("button", { name: /^(Back|Edit my details)$/ });
  }

  async enter(code: string) {
    await this.boxes.first().click();
    await this.page.keyboard.type(code);
  }

  async submitCode(code: string) {
    await this.enter(code);
    await reserveAuthRequest();
    await this.submit.click();
  }

  async expectVisible() {
    await expect(this.boxes).toHaveCount(6);
  }
}

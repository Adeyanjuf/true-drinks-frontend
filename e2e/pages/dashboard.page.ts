import type { Locator, Page } from "@playwright/test";

export class DashboardPage {
  readonly heading: Locator;
  readonly nav: Locator;
  readonly signOut: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole("heading", { name: "Admin dashboard" });
    this.nav = page.getByRole("navigation", { name: "Admin" });
    this.signOut = page.getByRole("button", { name: "Sign out" });
  }

  async goto() {
    await this.page.goto("/admin");
  }
}

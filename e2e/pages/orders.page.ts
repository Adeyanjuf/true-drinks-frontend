import type { Locator, Page } from "@playwright/test";

export class OrdersPage {
  readonly heading: Locator;
  readonly content: Locator;
  readonly search: Locator;
  readonly statusFilter: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole("heading", { name: "Orders", exact: true });
    this.content = page.locator("main");
    this.search = page.getByLabel("Search orders");
    this.statusFilter = page.getByLabel("Filter by status");
  }

  async goto() {
    await this.page.goto("/admin/orders");
  }

  row(text: string): Locator {
    return this.page.getByRole("row").filter({ hasText: text });
  }

  /** Clicks the single next-step button for an order and answers the confirmation. */
  async advance(trackingId: string, nextLabel: string, { confirm }: { confirm: boolean }) {
    await this.page.getByRole("button", { name: `Mark ${trackingId} as ${nextLabel}` }).click();
    const dialog = this.page.getByRole("alertdialog");
    await dialog.getByRole("button", { name: confirm ? `Mark as ${nextLabel}` : "Cancel", exact: true }).click();
  }
}

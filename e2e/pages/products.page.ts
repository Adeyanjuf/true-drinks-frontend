import type { Locator, Page } from "@playwright/test";

export class ProductsPage {
  readonly heading: Locator;
  readonly content: Locator;
  readonly newProduct: Locator;
  readonly search: Locator;
  readonly categoryFilter: Locator;
  readonly stockFilter: Locator;
  readonly sort: Locator;
  readonly allTab: Locator;
  readonly lowStockTab: Locator;
  readonly next: Locator;
  readonly previous: Locator;

  constructor(readonly page: Page) {
    this.content = page.locator("main");
    this.heading = page.getByRole("heading", { name: "Products", exact: true });
    this.newProduct = page.getByRole("link", { name: "New product" });
    this.search = page.getByLabel("Search products");
    this.categoryFilter = page.getByLabel("Filter by category");
    this.stockFilter = page.getByLabel("Filter by stock");
    this.sort = page.getByLabel("Sort products");
    this.allTab = page.getByRole("tab", { name: "All products" });
    this.lowStockTab = page.getByRole("tab", { name: "Low stock" });
    this.next = page.getByRole("button", { name: "Next", exact: true });
    this.previous = page.getByRole("button", { name: "Previous" });
  }

  async goto() {
    await this.page.goto("/admin/products");
  }

  row(name: string): Locator {
    return this.page.getByRole("row").filter({ hasText: name });
  }

  async openEdit(name: string) {
    await this.row(name).getByRole("link", { name: `Edit ${name}` }).click();
  }

  async delete(name: string, { confirm }: { confirm: boolean }) {
    await this.row(name).getByRole("button", { name: `Delete ${name}` }).click();
    const dialog = this.page.getByRole("alertdialog");
    await dialog.getByRole("button", { name: confirm ? "Delete" : "Cancel", exact: true }).click();
  }
}

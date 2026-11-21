import type { Locator, Page } from "@playwright/test";

export class CategoriesPage {
  readonly heading: Locator;
  readonly newName: Locator;
  readonly add: Locator;
  readonly addError: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole("heading", { name: "Categories" });
    this.newName = page.getByLabel("New category");
    this.add = page.getByRole("button", { name: "Add category" });
    this.addError = page.locator("form [role=alert]");
  }

  async goto() {
    await this.page.goto("/admin/categories");
  }

  row(name: string): Locator {
    return this.page.getByRole("row").filter({ hasText: name });
  }

  async create(name: string) {
    await this.newName.fill(name);
    await this.add.click();
  }

  async rename(from: string, to: string) {
    await this.row(from).getByRole("button", { name: `Rename ${from}` }).click();
    await this.page.getByLabel(`Rename ${from}`).fill(to);
    await this.page.getByRole("button", { name: `Save ${from}` }).click();
  }

  async delete(name: string, { confirm }: { confirm: boolean }) {
    await this.row(name).getByRole("button", { name: `Delete ${name}` }).click();
    const dialog = this.page.getByRole("alertdialog");
    await dialog.getByRole("button", { name: confirm ? "Delete" : "Cancel", exact: true }).click();
  }
}

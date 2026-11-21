import type { Locator, Page } from "@playwright/test";

export type ProductFormData = Partial<{
  name: string;
  brand: string;
  category: string;
  price: string;
  discount: string;
  weight: string;
  abv: string;
  stock: string;
  lowStock: string;
  description: string;
  images: string;
  ageRestricted: boolean;
}>;

export class ProductFormPage {
  readonly submit: Locator;
  readonly alert: Locator;

  constructor(readonly page: Page) {
    this.submit = page.getByRole("button", { name: /Create product|Save changes/ });
    this.alert = page.locator("form [role=alert]");
  }

  async gotoNew() {
    await this.page.goto("/admin/products/new");
  }

  async fill(data: ProductFormData) {
    const p = this.page;
    if (data.name !== undefined) await p.getByLabel("Name").fill(data.name);
    if (data.brand !== undefined) await p.getByLabel("Brand").fill(data.brand);
    if (data.category !== undefined) await p.getByLabel("Category").selectOption({ label: data.category });
    if (data.price !== undefined) await p.getByLabel("Price (GBP)").fill(data.price);
    if (data.discount !== undefined) await p.getByLabel("Discount (%)").fill(data.discount);
    if (data.weight !== undefined) await p.getByLabel("Weight per unit (grams)").fill(data.weight);
    if (data.abv !== undefined) await p.getByLabel("ABV (%)").fill(data.abv);
    if (data.stock !== undefined) await p.getByLabel("Stock", { exact: true }).fill(data.stock);
    if (data.lowStock !== undefined) await p.getByLabel("Low stock threshold").fill(data.lowStock);
    if (data.description !== undefined) await p.getByLabel("Description").fill(data.description);
    if (data.images !== undefined) await p.getByLabel("Image URLs (one per line)").fill(data.images);
    if (data.ageRestricted !== undefined) await p.getByLabel(/Age restricted/).setChecked(data.ageRestricted);
  }
}

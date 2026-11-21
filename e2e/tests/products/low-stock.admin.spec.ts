import { test, expect } from "../../fixtures";
import { uniqueName } from "../../support/catalog-api";

test("low stock tab lists products at or below their threshold", async ({ productsPage, catalog, page }) => {
  const cat = await catalog.createCategory(uniqueName("Stock"));
  const low = await catalog.createProduct({ name: uniqueName("Running low"), categoryId: cat.id, stock: 3, lowStockThreshold: 5 });
  const out = await catalog.createProduct({ name: uniqueName("Sold out"), categoryId: cat.id, stock: 0, lowStockThreshold: 5 });
  const fine = await catalog.createProduct({ name: uniqueName("Plenty"), categoryId: cat.id, stock: 50, lowStockThreshold: 5 });

  await productsPage.goto();
  await productsPage.lowStockTab.click();

  await expect(productsPage.row(low.name)).toContainText("3 left");
  await expect(productsPage.row(out.name)).toContainText("Out of stock");
  await expect(productsPage.row(fine.name)).toHaveCount(0);

  await productsPage.row(low.name).getByRole("link", { name: "Restock" }).click();
  await expect(page).toHaveURL(/\/admin\/products\/.+\/edit$/);
});

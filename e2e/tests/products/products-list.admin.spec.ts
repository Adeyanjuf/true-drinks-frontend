import { test, expect } from "../../fixtures";
import { uniqueName } from "../../support/catalog-api";

test.describe("products list", () => {
  test("is reachable from the sidebar", async ({ page, dashboardPage }) => {
    await dashboardPage.goto();
    await dashboardPage.nav.getByRole("link", { name: "Products" }).click();
    await expect(page).toHaveURL(/\/admin\/products$/);
  });

  test("shows seeded products with price, discount and stock state", async ({ productsPage, catalog }) => {
    const cat = await catalog.createCategory(uniqueName("Cat"));
    const plain = await catalog.createProduct({ name: uniqueName("Plain"), categoryId: cat.id, pricePence: 1250, stock: 20 });
    const sale = await catalog.createProduct({ name: uniqueName("Sale"), categoryId: cat.id, pricePence: 2000, discountPercent: 25, stock: 20 });
    const low = await catalog.createProduct({ name: uniqueName("Low"), categoryId: cat.id, stock: 2, lowStockThreshold: 5 });
    const out = await catalog.createProduct({ name: uniqueName("Out"), categoryId: cat.id, stock: 0 });

    await productsPage.goto();
    await productsPage.categoryFilter.selectOption({ label: cat.name });

    await expect(productsPage.row(plain.name)).toContainText("£12.50");
    await expect(productsPage.row(sale.name)).toContainText("£15.00");
    await expect(productsPage.row(sale.name)).toContainText("£20.00");
    await expect(productsPage.row(sale.name)).toContainText("-25%");
    await expect(productsPage.row(low.name)).toContainText("Low: 2");
    await expect(productsPage.row(out.name)).toContainText("Out of stock");
  });

  test("filters by search, category and stock", async ({ productsPage, catalog }) => {
    const catA = await catalog.createCategory(uniqueName("CatA"));
    const catB = await catalog.createCategory(uniqueName("CatB"));
    const a = await catalog.createProduct({ name: uniqueName("Alpha"), categoryId: catA.id, stock: 10 });
    const b = await catalog.createProduct({ name: uniqueName("Bravo"), categoryId: catB.id, stock: 0 });

    await productsPage.goto();
    await productsPage.search.fill(a.name);
    await expect(productsPage.row(a.name)).toBeVisible();
    await expect(productsPage.row(b.name)).toHaveCount(0);

    await productsPage.search.fill("");
    await productsPage.categoryFilter.selectOption({ label: catB.name });
    await expect(productsPage.row(b.name)).toBeVisible();
    await expect(productsPage.row(a.name)).toHaveCount(0);

    await productsPage.stockFilter.selectOption("in");
    await expect(productsPage.row(b.name)).toHaveCount(0);
    await expect(productsPage.content).toContainText("No products found.");
  });

  test("shows an empty state when nothing matches", async ({ productsPage }) => {
    await productsPage.goto();
    await productsPage.search.fill(uniqueName("nothing-matches-this"));
    await expect(productsPage.content).toContainText("No products found.");
  });

  test("paginates the list", async ({ productsPage, catalog }) => {
    const cat = await catalog.createCategory(uniqueName("Pages"));
    const names: string[] = [];
    for (let i = 0; i < 11; i++) {
      const p = await catalog.createProduct({ name: uniqueName(`P${String(i).padStart(2, "0")}`), categoryId: cat.id });
      names.push(p.name);
    }

    await productsPage.goto();
    await productsPage.categoryFilter.selectOption({ label: cat.name });
    await expect(productsPage.content).toContainText("Page 1 of 2 (11 products)");
    await expect(productsPage.previous).toBeDisabled();

    await productsPage.next.click();
    await expect(productsPage.content).toContainText("Page 2 of 2");
    await expect(productsPage.next).toBeDisabled();
  });
});

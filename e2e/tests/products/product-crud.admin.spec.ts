import { test, expect } from "../../fixtures";
import { uniqueName } from "../../support/catalog-api";

test.describe("product create, edit and delete", () => {
  test("validates required and malformed fields", async ({ productForm, page }) => {
    await productForm.gotoNew();
    await productForm.submit.click();
    await expect(page.getByText("Name is required")).toBeVisible();
    await expect(page.getByText("Choose a category")).toBeVisible();
    await expect(page.getByText("Enter a price like 12.99")).toBeVisible();
    await expect(page.getByText("Weight must be a whole number")).toBeVisible();

    await productForm.fill({ price: "12.999", discount: "150", abv: "120", images: "not-a-url" });
    await productForm.submit.click();
    await expect(page.getByText("Enter a price like 12.99")).toBeVisible();
    await expect(page.getByText("Discount must be at most 100")).toBeVisible();
    await expect(page.getByText("ABV must be between 0 and 100")).toBeVisible();
    await expect(page.getByText("Each image must be a full URL, one per line")).toBeVisible();
  });

  test("creates a product with prices converted to pence and weight in grams", async ({ productForm, productsPage, catalog, page }) => {
    const cat = await catalog.createCategory(uniqueName("Create"));
    const name = uniqueName("Created");

    await productForm.gotoNew();
    await productForm.fill({
      name,
      brand: "E2E Brand",
      category: cat.name,
      price: "18.99",
      discount: "10",
      weight: "1100",
      abv: "37.5",
      stock: "12",
      lowStock: "4",
      ageRestricted: true,
    });
    await productForm.submit.click();

    await expect(page).toHaveURL(/\/admin\/products$/);
    await catalog.trackByName(name);
    await productsPage.categoryFilter.selectOption({ label: cat.name });
    const row = productsPage.row(name);
    await expect(row).toContainText("£17.09"); // 1899 pence less 10%
    await expect(row).toContainText("£18.99");
    await expect(row).toContainText("1.1 kg");
    await expect(row).toContainText("Yes");
    await expect(row).toContainText("E2E Brand");

    await productsPage.delete(name, { confirm: true });
    await expect(row).toHaveCount(0);
  });

  test("shows the server error when the API rejects the data", async ({ productForm, page, catalog }) => {
    const cat = await catalog.createCategory(uniqueName("Reject"));
    await productForm.gotoNew();
    await productForm.fill({ name: uniqueName("Bad"), category: cat.name, price: "5.00", weight: "500" });
    // Simulate the API rejecting the payload so the form must surface its message.
    await page.route("**/api/admin/proxy/products", (route) =>
      route.fulfill({ status: 400, contentType: "application/json", body: JSON.stringify({ message: "Category does not exist" }) }),
    );
    await productForm.submit.click();
    await expect(productForm.alert).toHaveText("Category does not exist");
    await expect(page).toHaveURL(/\/admin\/products\/new$/);
  });

  test("edits an existing product", async ({ productForm, productsPage, catalog, page }) => {
    const cat = await catalog.createCategory(uniqueName("Edit"));
    const product = await catalog.createProduct({ name: uniqueName("Before"), categoryId: cat.id, pricePence: 1000 });

    await productsPage.goto();
    await productsPage.categoryFilter.selectOption({ label: cat.name });
    await productsPage.openEdit(product.name);

    await expect(page.getByLabel("Name")).toHaveValue(product.name);
    await expect(page.getByLabel("Price (GBP)")).toHaveValue("10.00");

    const renamed = uniqueName("After");
    await productForm.fill({ name: renamed, price: "24.50", stock: "7" });
    await productForm.submit.click();

    await expect(page).toHaveURL(/\/admin\/products$/);
    await productsPage.categoryFilter.selectOption({ label: cat.name });
    await catalog.trackByName(renamed);
    await expect(productsPage.row(renamed)).toContainText("£24.50");
    await expect(productsPage.row(product.name)).toHaveCount(0);
  });

  test("asks for confirmation before deleting", async ({ productsPage, catalog, page }) => {
    const cat = await catalog.createCategory(uniqueName("Delete"));
    const product = await catalog.createProduct({ name: uniqueName("Doomed"), categoryId: cat.id });

    await productsPage.goto();
    await productsPage.categoryFilter.selectOption({ label: cat.name });

    await productsPage.delete(product.name, { confirm: false });
    await expect(page.getByRole("alertdialog")).toBeHidden();
    await expect(productsPage.row(product.name)).toBeVisible();

    await productsPage.delete(product.name, { confirm: true });
    await expect(productsPage.row(product.name)).toHaveCount(0);
  });
});

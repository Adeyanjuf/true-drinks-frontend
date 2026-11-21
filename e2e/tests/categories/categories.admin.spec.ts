import { test, expect } from "../../fixtures";
import { uniqueName } from "../../support/catalog-api";

test.describe("categories", () => {
  test("is reachable from the sidebar", async ({ page, dashboardPage }) => {
    await dashboardPage.goto();
    await dashboardPage.nav.getByRole("link", { name: "Category" }).click();
    await expect(page).toHaveURL(/\/admin\/categories$/);
  });

  test("creates a category and shows its generated slug", async ({ categoriesPage, catalog }) => {
    const name = uniqueName("Create Me");
    await categoriesPage.goto();
    await categoriesPage.create(name);
    await catalog.trackCategoryByName(name);

    await expect(categoriesPage.row(name)).toBeVisible();
    await expect(categoriesPage.row(name)).toContainText(name.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
    await expect(categoriesPage.newName).toHaveValue("");
  });

  test("validates an empty name", async ({ categoriesPage, page }) => {
    await categoriesPage.goto();
    await categoriesPage.add.click();
    await expect(page.getByText("Category name is required")).toBeVisible();
  });

  test("rejects a duplicate name with the server message", async ({ categoriesPage, catalog }) => {
    const existing = await catalog.createCategory(uniqueName("Dupe"));
    await categoriesPage.goto();
    await categoriesPage.create(existing.name);
    await expect(categoriesPage.addError).toHaveText("A category with this name already exists");
  });

  test("renames a category and keeps products attached to it", async ({ categoriesPage, productsPage, catalog }) => {
    const cat = await catalog.createCategory(uniqueName("Before"));
    const product = await catalog.createProduct({ name: uniqueName("Attached"), categoryId: cat.id });
    const renamed = uniqueName("After");

    await categoriesPage.goto();
    await categoriesPage.rename(cat.name, renamed);
    await expect(categoriesPage.row(renamed)).toBeVisible();
    await expect(categoriesPage.row(cat.name)).toHaveCount(0);

    await productsPage.goto();
    await expect(productsPage.row(product.name)).toContainText(renamed);
  });

  test("cancelling a rename keeps the old name", async ({ categoriesPage, page, catalog }) => {
    const cat = await catalog.createCategory(uniqueName("Keep"));
    await categoriesPage.goto();
    await categoriesPage.row(cat.name).getByRole("button", { name: `Rename ${cat.name}` }).click();
    await page.getByLabel(`Rename ${cat.name}`).fill("something else");
    await page.getByRole("button", { name: "Cancel rename" }).click();
    await expect(categoriesPage.row(cat.name)).toBeVisible();
  });

  test("deletes an empty category after confirmation", async ({ categoriesPage, page, catalog }) => {
    const cat = await catalog.createCategory(uniqueName("Delete"));
    await categoriesPage.goto();

    await categoriesPage.delete(cat.name, { confirm: false });
    await expect(page.getByRole("alertdialog")).toBeHidden();
    await expect(categoriesPage.row(cat.name)).toBeVisible();

    await categoriesPage.delete(cat.name, { confirm: true });
    await expect(categoriesPage.row(cat.name)).toHaveCount(0);
  });

  test("blocks deleting a category that still has products", async ({ categoriesPage, page, catalog }) => {
    const cat = await catalog.createCategory(uniqueName("Busy"));
    await catalog.createProduct({ name: uniqueName("Stuck"), categoryId: cat.id });
    await categoriesPage.goto();

    await categoriesPage.delete(cat.name, { confirm: true });
    await expect(page.getByRole("alertdialog")).toContainText("Cannot delete a category with 1 product(s)");
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(categoriesPage.row(cat.name)).toBeVisible();
  });
});

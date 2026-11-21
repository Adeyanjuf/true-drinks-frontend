import { test as base } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { DashboardPage } from "../pages/dashboard.page";
import { CategoriesPage } from "../pages/categories.page";
import { ProductsPage } from "../pages/products.page";
import { ProductFormPage } from "../pages/product-form.page";
import { OrdersPage } from "../pages/orders.page";
import { deleteOrders, seedOrder, type SeededOrder } from "../support/orders-db";
import { CatalogApi } from "../support/catalog-api";
import { clearOtp } from "../support/db";
import { env } from "../support/env";

type Fixtures = {
  freshOtpState: void;
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  productsPage: ProductsPage;
  productForm: ProductFormPage;
  categoriesPage: CategoriesPage;
  ordersPage: OrdersPage;
  seedOrder: (options?: Parameters<typeof seedOrder>[0]) => SeededOrder;
  catalog: CatalogApi;
};

export const test = base.extend<Fixtures>({
  // The API refuses a new code within 60s of the last one. Only tests that use the
  // login page need this reset, so it is not automatic.
  freshOtpState: async ({}, use) => {
    clearOtp(env.adminEmail);
    await use();
  },
  loginPage: async ({ page, freshOtpState }, use) => {
    void freshOtpState;
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => use(new DashboardPage(page)),
  productsPage: async ({ page }, use) => use(new ProductsPage(page)),
  productForm: async ({ page }, use) => use(new ProductFormPage(page)),
  categoriesPage: async ({ page }, use) => use(new CategoriesPage(page)),
  ordersPage: async ({ page }, use) => use(new OrdersPage(page)),
  // Inserts orders straight into the database and removes them after the test.
  seedOrder: async ({}, use) => {
    const created: SeededOrder[] = [];
    await use((options) => {
      const order = seedOrder(options);
      created.push(order);
      return order;
    });
    deleteOrders(created.map((o) => o.id));
  },
  // Seeds data through the API and removes it after the test.
  catalog: async ({ request }, use) => {
    const api = new CatalogApi(request);
    await use(api);
    await api.cleanup();
  },
});

export { expect } from "@playwright/test";

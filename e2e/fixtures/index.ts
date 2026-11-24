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
import { CustomerAuthPage } from "../pages/customer-auth.page";
import { createCustomer, deleteCustomers, newCustomerData, type TestCustomer } from "../support/customers";
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
  customerAuth: CustomerAuthPage;
  /** Fresh customer details (not yet registered). Removed after the test either way. */
  newCustomer: TestCustomer;
  /** A registered and verified customer. Removed after the test. */
  customer: TestCustomer;
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
  customerAuth: async ({ page }, use) => use(new CustomerAuthPage(page)),
  newCustomer: async ({}, use) => {
    const data = newCustomerData();
    await use(data);
    deleteCustomers([data.email]);
  },
  customer: async ({ request }, use) => {
    const data = await createCustomer(request);
    await use(data);
    deleteCustomers([data.email]);
  },
  // Seeds data through the API and removes it after the test.
  catalog: async ({ request }, use) => {
    const api = new CatalogApi(request);
    await use(api);
    await api.cleanup();
  },
});

export { expect } from "@playwright/test";

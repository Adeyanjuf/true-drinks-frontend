import { test, expect } from "../../fixtures";

test.describe("orders list", () => {
  test("is reachable from the sidebar", async ({ page, dashboardPage }) => {
    await dashboardPage.goto();
    await dashboardPage.nav.getByRole("link", { name: "Orders" }).click();
    await expect(page).toHaveURL(/\/admin\/orders$/);
  });

  test("shows an order with customer, total, weight and status", async ({ ordersPage, seedOrder }) => {
    const order = seedOrder();
    await ordersPage.goto();
    await ordersPage.search.fill(order.trackingId);

    const row = ordersPage.row(order.trackingId);
    await expect(row).toContainText(order.name);
    await expect(row).toContainText(order.email);
    await expect(row).toContainText("£45.87");
    await expect(row).toContainText("2.4 kg");
    await expect(row).toContainText("Packaging");
  });

  test("searches by tracking ID, name and email", async ({ ordersPage, seedOrder }) => {
    const a = seedOrder();
    const b = seedOrder();
    await ordersPage.goto();

    await ordersPage.search.fill(a.name);
    await expect(ordersPage.row(a.trackingId)).toBeVisible();
    await expect(ordersPage.row(b.trackingId)).toHaveCount(0);

    await ordersPage.search.fill(b.email);
    await expect(ordersPage.row(b.trackingId)).toBeVisible();
    await expect(ordersPage.row(a.trackingId)).toHaveCount(0);

    await ordersPage.search.fill(a.trackingId.toLowerCase());
    await expect(ordersPage.row(a.trackingId)).toBeVisible();
  });

  test("filters by status", async ({ ordersPage, seedOrder }) => {
    const packaging = seedOrder({ status: "PACKAGING" });
    const delivered = seedOrder({ status: "DELIVERED" });
    await ordersPage.goto();
    await ordersPage.search.fill("E2E Customer");

    await ordersPage.statusFilter.selectOption({ label: "Delivered" });
    await expect(ordersPage.row(delivered.trackingId)).toBeVisible();
    await expect(ordersPage.row(packaging.trackingId)).toHaveCount(0);

    await ordersPage.statusFilter.selectOption({ label: "Packaging" });
    await expect(ordersPage.row(packaging.trackingId)).toBeVisible();
    await expect(ordersPage.row(delivered.trackingId)).toHaveCount(0);
  });

  test("shows an empty state when nothing matches", async ({ ordersPage }) => {
    await ordersPage.goto();
    await ordersPage.search.fill("no-such-order-anywhere");
    await expect(ordersPage.content).toContainText("No orders found.");
  });
});

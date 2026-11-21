import { test, expect } from "../../fixtures";

test.describe("order detail", () => {
  test("shows customer, address, items, totals and the first history entry", async ({ ordersPage, seedOrder, page }) => {
    const order = seedOrder({ promoCode: "E2ESAVE" });
    await ordersPage.goto();
    await ordersPage.search.fill(order.trackingId);
    await page.getByRole("link", { name: order.trackingId }).click();

    await expect(page).toHaveURL(/\/admin\/orders\/.+/);
    await expect(page.getByRole("heading", { name: order.trackingId })).toBeVisible();
    await expect(page.getByText(order.email)).toBeVisible();
    await expect(page.getByText(/1 Test Street, Flat 2/)).toBeVisible();

    const items = page.getByRole("region", { name: "Items" });
    await expect(items.getByRole("row").filter({ hasText: order.itemName })).toContainText("£21.60");
    await expect(items.getByRole("row").filter({ hasText: order.itemName })).toContainText("£43.20"); // 2 x 21.60

    const payment = page.getByRole("region", { name: "Payment and shipping" });
    await expect(payment).toContainText("Discount (E2ESAVE)");
    await expect(payment).toContainText("-£4.32");
    await expect(payment).toContainText("£6.99");
    await expect(payment).toContainText("£45.87");
    await expect(payment).toContainText("2.4 kg");
    await expect(payment).toContainText("Verified");

    await expect(page.getByRole("region", { name: "Status history" })).toContainText("Order placed as Packaging");
  });

  test("records who changed the status and when", async ({ ordersPage, seedOrder, page }) => {
    const order = seedOrder();
    await page.goto(`/admin/orders/${order.id}`);

    await ordersPage.advance(order.trackingId, "Out for Delivery", { confirm: true });
    const history = page.getByRole("region", { name: "Status history" });
    await expect(history).toContainText("Packaging to Out for Delivery");
    // The change we just made is attributed to the signed in admin, not "system".
    const change = history.getByRole("listitem").filter({ hasText: "Packaging to Out for Delivery" });
    await expect(change).not.toContainText("by system");
    await expect(change).toContainText(/by \S+/);
  });

  test("shows an error for an unknown order", async ({ page }) => {
    await page.goto("/admin/orders/does-not-exist");
    await expect(page.locator("main [role=alert]")).toContainText("Order not found");
  });
});

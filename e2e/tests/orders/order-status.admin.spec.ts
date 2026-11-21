import { test, expect } from "../../fixtures";

test.describe("order status path", () => {
  test("offers only the next step and asks before changing it", async ({ ordersPage, seedOrder, page }) => {
    const order = seedOrder();
    await ordersPage.goto();
    await ordersPage.search.fill(order.trackingId);
    const row = ordersPage.row(order.trackingId);

    await expect(row.getByRole("button", { name: /Mark .* as Out for Delivery/ })).toBeVisible();
    await expect(row.getByRole("button", { name: /as Delivered/ })).toHaveCount(0);

    await ordersPage.advance(order.trackingId, "Out for Delivery", { confirm: false });
    await expect(page.getByRole("alertdialog")).toBeHidden();
    await expect(row).toContainText("Packaging");
  });

  test("moves Packaging to Out for Delivery to Delivered, then offers nothing", async ({ ordersPage, seedOrder, page }) => {
    const order = seedOrder();
    await ordersPage.goto();
    await ordersPage.search.fill(order.trackingId);
    const row = ordersPage.row(order.trackingId);

    await ordersPage.advance(order.trackingId, "Out for Delivery", { confirm: true });
    await expect(row).toContainText("Out for Delivery");
    await expect(page.getByRole("alertdialog")).toBeHidden();

    await ordersPage.advance(order.trackingId, "Delivered", { confirm: true });
    await expect(row).toContainText("Delivered");
    await expect(row).toContainText("Complete");
    await expect(row.getByRole("button")).toHaveCount(0);
  });

  test("the API refuses to skip a step and the proxy passes the reason on", async ({ request, seedOrder }) => {
    const order = seedOrder();
    const res = await request.patch(`/api/admin/proxy/admin/orders/${order.id}/status`, { data: { status: "DELIVERED" } });
    expect(res.status()).toBe(409);
    expect((await res.json()).message).toContain("The next status is OUT_FOR_DELIVERY");
  });
});

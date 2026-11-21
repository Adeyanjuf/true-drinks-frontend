import { randomUUID } from "node:crypto";
import { runSql } from "./db";

// Orders only come from a paid Stripe checkout, so tests insert them directly.
// Timestamps are written in UTC because Prisma stores UTC in timestamp columns.
// Everything is tagged with an E2E prefix and removed again by id.
export type SeededOrder = {
  id: string;
  trackingId: string;
  name: string;
  email: string;
  itemName: string;
};

type Options = {
  status?: "PACKAGING" | "OUT_FOR_DELIVERY" | "DELIVERED";
  promoCode?: string;
};

const short = () => randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();

export function seedOrder(options: Options = {}): SeededOrder {
  const id = `e2e_${randomUUID()}`;
  const tag = short();
  const order: SeededOrder = {
    id,
    trackingId: `E2E-${tag}`,
    name: `E2E Customer ${tag}`,
    email: `e2e-${tag.toLowerCase()}@example.invalid`,
    itemName: `E2E Item ${tag}`,
  };
  const status = options.status ?? "PACKAGING";

  runSql(
    `
    INSERT INTO "Order" ("id","trackingId","email","name","addressLine1","addressLine2","city","postcode","phone","country","status",
      "subtotalPence","discountPence","shippingPence","totalPence","totalWeightGrams","promoCode","stripePaymentIntentId","ageVerifiedAt","ageMethod","createdAt","updatedAt")
    VALUES (:'id', :'tracking', :'email', :'name', '1 Test Street', 'Flat 2', 'London', 'SW1A 2AA', '07000000000', 'GB', :'status'::"OrderStatus",
      4320, 432, 699, 4587, 2400, NULLIF(:'promo',''), :'pi', (now() at time zone 'utc'), 'self-declared', (now() at time zone 'utc'), (now() at time zone 'utc'));
    INSERT INTO "OrderItem" ("id","orderId","name","listPricePence","discountPercent","unitPricePence","weightGrams","quantity","isAgeRestricted")
    VALUES (:'item', :'id', :'itemName', 2400, 10, 2160, 1200, 2, true);
    INSERT INTO "OrderStatusHistory" ("id","orderId","fromStatus","toStatus","changedAt")
    VALUES (:'hist', :'id', NULL, 'PACKAGING', (now() at time zone 'utc'));
    `,
    {
      id,
      tracking: order.trackingId,
      email: order.email,
      name: order.name,
      status,
      promo: options.promoCode ?? "",
      pi: `pi_e2e_${id}`,
      item: `e2e_${randomUUID()}`,
      itemName: order.itemName,
      hist: `e2e_${randomUUID()}`,
    },
  );
  return order;
}

export function deleteOrders(ids: string[]): void {
  if (ids.length === 0) return;
  // Items and history cascade with the order.
  for (const id of ids) {
    runSql(`DELETE FROM "Order" WHERE "id" = :'id';`, { id });
  }
}

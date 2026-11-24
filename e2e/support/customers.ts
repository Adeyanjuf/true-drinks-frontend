import { randomUUID } from "node:crypto";
import type { APIRequestContext } from "@playwright/test";
import { runSql } from "./db";
import { reserveAuthRequest } from "./rate-limit";

// Customers are real accounts in the dev database, so every test account uses a
// reserved e2e address and is removed afterwards (carts and tokens cascade).
export type TestCustomer = {
  name: string;
  email: string;
  username: string;
  password: string;
};

export function newCustomerData(): TestCustomer {
  const tag = randomUUID().replace(/-/g, "").slice(0, 8);
  return {
    name: `E2E Customer ${tag.toUpperCase()}`,
    email: `e2e-cust-${tag}@example.invalid`,
    username: `e2e_${tag}`,
    password: "E2ePassw0rd!",
  };
}

/** Registers through the app and marks the account verified so it can sign in. */
export async function createCustomer(request: APIRequestContext): Promise<TestCustomer> {
  const customer = newCustomerData();
  await reserveAuthRequest();
  const res = await request.post("/api/auth/register", { data: customer });
  if (!res.ok()) throw new Error(`Could not create the test customer: ${res.status()} ${await res.text()}`);
  runSql(`UPDATE "User" SET "isVerified" = true WHERE "email" = :'email';`, { email: customer.email });
  return customer;
}

export function deleteCustomers(emails: string[]): void {
  if (emails.length === 0) return;
  runSql(`DELETE FROM "User" WHERE "email" = ANY(string_to_array(:'emails', ','));`, {
    emails: emails.join(","),
  });
}

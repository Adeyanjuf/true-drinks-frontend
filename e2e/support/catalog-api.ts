import type { APIRequestContext } from "@playwright/test";

// Test data goes through the app's own admin proxy, so the saved admin session
// authorises it and the proxy itself gets exercised too.
export type SeedProduct = {
  name: string;
  categoryId: string;
  pricePence?: number;
  weightGrams?: number;
  discountPercent?: number;
  stock?: number;
  lowStockThreshold?: number;
  brand?: string;
  isAgeRestricted?: boolean;
  abv?: number;
};

export class CatalogApi {
  private productIds: string[] = [];
  private categoryIds: string[] = [];

  constructor(private readonly request: APIRequestContext) {}

  private async unwrap<T>(res: Awaited<ReturnType<APIRequestContext["post"]>>): Promise<T> {
    if (!res.ok()) throw new Error(`API ${res.status()}: ${await res.text()}`);
    const json = (await res.json()) as { data?: T };
    return (json.data ?? json) as T;
  }

  async createCategory(name: string) {
    const c = await this.unwrap<{ id: string; name: string }>(
      await this.request.post("/api/admin/proxy/categories", { data: { name } }),
    );
    this.categoryIds.push(c.id);
    return c;
  }

  async createProduct(p: SeedProduct) {
    const created = await this.unwrap<{ id: string; name: string }>(
      await this.request.post("/api/admin/proxy/products", {
        data: { pricePence: 1999, weightGrams: 1000, ...p },
      }),
    );
    this.productIds.push(created.id);
    return created;
  }

  /** Register a product created through the UI so cleanup removes it even if the test fails. */
  async trackByName(name: string) {
    const page = await this.unwrap<{ items: { id: string }[] }>(
      await this.request.get("/api/admin/proxy/products", { params: { search: name } }),
    );
    this.productIds.push(...page.items.map((i) => i.id));
  }

  /** Remove everything this instance created. Products go first (category delete is restricted). */
  async cleanup() {
    for (const id of this.productIds) {
      await this.request.delete(`/api/admin/proxy/products/${id}`).catch(() => undefined);
    }
    for (const id of this.categoryIds) {
      await this.request.delete(`/api/admin/proxy/categories/${id}`).catch(() => undefined);
    }
  }
}

export const uniqueName = (label: string) =>
  `E2E ${label} ${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

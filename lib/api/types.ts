export type CategoryRef = { id: string; name: string; slug: string };

export type Category = CategoryRef & { createdAt: string; updatedAt: string };

export type Product = {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  brand: string | null;
  pricePence: number;
  discountPercent: number;
  finalPricePence: number;
  weightGrams: number;
  abv: number | null;
  isAgeRestricted: boolean;
  stock: number;
  lowStockThreshold: number;
  categoryId: string;
  category?: CategoryRef;
  createdAt: string;
  updatedAt: string;
};

export type LowStockProduct = {
  id: string;
  name: string;
  brand: string | null;
  stock: number;
  lowStockThreshold: number;
  outOfStock: boolean;
};

export type PageMeta = { page: number; limit: number; total: number; totalPages: number };
export type Paginated<T> = { items: T[]; meta: PageMeta };

export type ProductPayload = {
  name: string;
  description?: string;
  images?: string[];
  brand?: string;
  pricePence: number;
  discountPercent?: number;
  weightGrams: number;
  abv?: number;
  isAgeRestricted?: boolean;
  stock?: number;
  lowStockThreshold?: number;
  categoryId: string;
};

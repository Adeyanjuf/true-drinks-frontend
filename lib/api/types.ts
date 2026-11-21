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

export type OrderStatus = "PACKAGING" | "OUT_FOR_DELIVERY" | "DELIVERED";

export type OrderItem = {
  id: string;
  productId: string | null;
  name: string;
  listPricePence: number;
  discountPercent: number;
  unitPricePence: number;
  weightGrams: number;
  quantity: number;
  isAgeRestricted: boolean;
};

export type Order = {
  id: string;
  trackingId: string;
  email: string;
  name: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  postcode: string;
  phone: string;
  country: string;
  status: OrderStatus;
  subtotalPence: number;
  discountPence: number;
  shippingPence: number;
  totalPence: number;
  totalWeightGrams: number;
  promoCode: string | null;
  ageVerifiedAt: string | null;
  ageMethod: string | null;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
};

export type OrderHistoryEntry = {
  id: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  changedAt: string;
  changedBy: { id: string; email: string; name: string } | null;
};

export type OrderDetail = Order & { items: OrderItem[]; history: OrderHistoryEntry[] };

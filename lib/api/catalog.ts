"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/client";
import type {
  Category,
  LowStockProduct,
  Paginated,
  Product,
  ProductPayload,
} from "@/lib/api/types";

export type ProductFilters = {
  page: number;
  limit: number;
  search?: string;
  categoryId?: string;
  inStock?: boolean;
  sort?: "price_asc" | "price_desc" | "name";
};

export const keys = {
  products: ["products"] as const,
  list: (f: ProductFilters) => ["products", "list", f] as const,
  one: (id: string) => ["products", "one", id] as const,
  lowStock: ["products", "low-stock"] as const,
  categories: ["categories"] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: keys.categories,
    queryFn: () => adminApi<Category[]>("GET", "categories"),
  });
}

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: keys.list(filters),
    queryFn: () => adminApi<Paginated<Product>>("GET", "products", { query: filters }),
    placeholderData: keepPreviousData,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: keys.one(id),
    queryFn: () => adminApi<Product>("GET", `products/${id}`),
  });
}

export function useLowStock() {
  return useQuery({
    queryKey: keys.lowStock,
    queryFn: () => adminApi<LowStockProduct[]>("GET", "products/low-stock"),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductPayload) => adminApi<Product>("POST", "products", { body: payload }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.products }),
  });
}

export function useUpdateProduct(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<ProductPayload>) =>
      adminApi<Product>("PATCH", `products/${id}`, { body: payload }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.products }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi<void>("DELETE", `products/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.products }),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => adminApi<Category>("POST", "categories", { body: { name } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.categories }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      adminApi<Category>("PATCH", `categories/${id}`, { body: { name } }),
    onSuccess: () => {
      // Product rows show the category name, so refresh them as well.
      void qc.invalidateQueries({ queryKey: keys.categories });
      void qc.invalidateQueries({ queryKey: keys.products });
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi<void>("DELETE", `categories/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.categories }),
  });
}

"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/client";
import type { Order, OrderDetail, OrderStatus, Paginated } from "@/lib/api/types";

export type OrderFilters = {
  page: number;
  limit: number;
  status?: OrderStatus;
  search?: string;
};

export const orderKeys = {
  all: ["orders"] as const,
  list: (f: OrderFilters) => ["orders", "list", f] as const,
  one: (id: string) => ["orders", "one", id] as const,
};

export function useOrders(filters: OrderFilters) {
  return useQuery({
    queryKey: orderKeys.list(filters),
    queryFn: () => adminApi<Paginated<Order>>("GET", "admin/orders", { query: filters }),
    placeholderData: keepPreviousData,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.one(id),
    queryFn: () => adminApi<OrderDetail>("GET", `admin/orders/${id}`),
  });
}

export function useAdvanceOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      adminApi<OrderDetail>("PATCH", `admin/orders/${id}/status`, { body: { status } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: orderKeys.all }),
  });
}

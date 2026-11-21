import type { OrderStatus } from "@/lib/api/types";

export const STATUS_LABEL: Record<OrderStatus, string> = {
  PACKAGING: "Packaging",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
};

// The only legal path, mirroring the API: Packaging, Out for Delivery, Delivered.
export const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  PACKAGING: "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "DELIVERED",
  DELIVERED: null,
};

export const STATUSES: OrderStatus[] = ["PACKAGING", "OUT_FOR_DELIVERY", "DELIVERED"];

const dateTime = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" });
export const formatDateTime = (iso: string) => dateTime.format(new Date(iso));

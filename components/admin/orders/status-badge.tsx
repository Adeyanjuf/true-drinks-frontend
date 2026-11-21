import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_LABEL } from "@/lib/orders";
import type { OrderStatus } from "@/lib/api/types";

const STYLE: Record<OrderStatus, string> = {
  PACKAGING: "bg-secondary text-secondary-foreground",
  OUT_FOR_DELIVERY: "bg-accent text-accent-foreground",
  DELIVERED: "bg-primary text-primary-foreground",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <Badge className={cn("border-transparent", STYLE[status])}>{STATUS_LABEL[status]}</Badge>;
}

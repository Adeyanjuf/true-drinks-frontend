import Link from "next/link";
import { createColumnHelper, tableFeatures } from "@tanstack/react-table";
import { AdvanceStatusButton } from "@/components/admin/orders/advance-status-button";
import { StatusBadge } from "@/components/admin/orders/status-badge";
import { formatPence, formatWeight } from "@/lib/format";
import { formatDateTime } from "@/lib/orders";
import type { Order } from "@/lib/api/types";

export const orderTableFeatures = tableFeatures({});
const helper = createColumnHelper<typeof orderTableFeatures, Order>();

export const orderColumns = helper.columns([
  helper.display({
    id: "tracking",
    header: "Tracking ID",
    cell: ({ row }) => (
      <Link className="font-medium text-primary underline-offset-4 hover:underline" href={`/admin/orders/${row.original.id}`}>
        {row.original.trackingId}
      </Link>
    ),
  }),
  helper.display({
    id: "customer",
    header: "Customer",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.name}</div>
        <div className="text-xs text-muted-foreground">{row.original.email}</div>
      </div>
    ),
  }),
  helper.display({ id: "total", header: "Total", cell: ({ row }) => formatPence(row.original.totalPence) }),
  helper.display({ id: "weight", header: "Weight", cell: ({ row }) => formatWeight(row.original.totalWeightGrams) }),
  helper.display({ id: "placed", header: "Placed", cell: ({ row }) => formatDateTime(row.original.createdAt) }),
  helper.display({ id: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> }),
  helper.display({
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <AdvanceStatusButton order={row.original} />
      </div>
    ),
  }),
]);

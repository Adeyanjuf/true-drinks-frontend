"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdvanceStatusButton } from "@/components/admin/orders/advance-status-button";
import { StatusBadge } from "@/components/admin/orders/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOrder } from "@/lib/api/orders";
import { formatPence, formatWeight } from "@/lib/format";
import { STATUS_LABEL, formatDateTime } from "@/lib/orders";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: order, isPending, isError, error } = useOrder(id);

  return (
    <main className="space-y-6 p-8">
      <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> Back to orders
      </Link>

      {isPending && <p className="text-muted-foreground">Loading…</p>}
      {isError && (
        <p role="alert" className="text-destructive">
          {error.message}
        </p>
      )}

      {order && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold">{order.trackingId}</h1>
              <p className="text-sm text-muted-foreground">Placed {formatDateTime(order.createdAt)}</p>
            </div>
            <div className="flex items-center gap-4">
              <StatusBadge status={order.status} />
              <AdvanceStatusButton order={order} />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <section aria-labelledby="customer-heading" className="rounded-lg border bg-card p-4">
              <h2 id="customer-heading" className="mb-2 font-semibold">Customer and delivery</h2>
              <dl className="space-y-1 text-sm">
                <div><dt className="inline text-muted-foreground">Name: </dt><dd className="inline">{order.name}</dd></div>
                <div><dt className="inline text-muted-foreground">Email: </dt><dd className="inline">{order.email}</dd></div>
                <div><dt className="inline text-muted-foreground">Phone: </dt><dd className="inline">{order.phone}</dd></div>
                <div>
                  <dt className="text-muted-foreground">Address</dt>
                  <dd>
                    {order.addressLine1}
                    {order.addressLine2 ? `, ${order.addressLine2}` : ""}
                    <br />
                    {order.city}, {order.postcode}
                    <br />
                    {order.country}
                  </dd>
                </div>
              </dl>
            </section>

            <section aria-labelledby="summary-heading" className="rounded-lg border bg-card p-4">
              <h2 id="summary-heading" className="mb-2 font-semibold">Payment and shipping</h2>
              <dl className="space-y-1 text-sm">
                <Row label="Subtotal" value={formatPence(order.subtotalPence)} />
                <Row
                  label={order.promoCode ? `Discount (${order.promoCode})` : "Discount"}
                  value={order.discountPence > 0 ? `-${formatPence(order.discountPence)}` : formatPence(0)}
                />
                <Row label="Shipping" value={formatPence(order.shippingPence)} />
                <Row label="Total" value={formatPence(order.totalPence)} strong />
                <Row label="Order weight" value={formatWeight(order.totalWeightGrams)} />
                <Row
                  label="Age verification"
                  value={order.ageVerifiedAt ? `Verified ${formatDateTime(order.ageVerifiedAt)}${order.ageMethod ? ` (${order.ageMethod})` : ""}` : "Not required"}
                />
              </dl>
            </section>
          </div>

          <section aria-labelledby="items-heading" className="rounded-lg border bg-card">
            <h2 id="items-heading" className="p-4 pb-0 font-semibold">Items</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Unit price</TableHead>
                  <TableHead>Line total</TableHead>
                  <TableHead>Weight</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.name}
                      {item.isAgeRestricted && <span className="ml-2 text-xs text-muted-foreground">Age restricted</span>}
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{formatPence(item.unitPricePence)}</TableCell>
                    <TableCell>{formatPence(item.unitPricePence * item.quantity)}</TableCell>
                    <TableCell>{formatWeight(item.weightGrams * item.quantity)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>

          <section aria-labelledby="history-heading" className="rounded-lg border bg-card p-4">
            <h2 id="history-heading" className="mb-3 font-semibold">Status history</h2>
            <ol className="space-y-2 text-sm">
              {order.history.map((h) => (
                <li key={h.id}>
                  <span className="font-medium">
                    {h.fromStatus ? `${STATUS_LABEL[h.fromStatus]} to ${STATUS_LABEL[h.toStatus]}` : `Order placed as ${STATUS_LABEL[h.toStatus]}`}
                  </span>
                  <span className="text-muted-foreground">
                    {" "}on {formatDateTime(h.changedAt)} by {h.changedBy ? h.changedBy.name || h.changedBy.email : "system"}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}
    </main>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 ${strong ? "font-semibold" : ""}`}>
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

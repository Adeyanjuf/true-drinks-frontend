"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLowStock } from "@/lib/api/catalog";

export function LowStockPanel() {
  const { data, isPending, isError, error } = useLowStock();

  if (isPending) return <p className="text-muted-foreground">Loading…</p>;
  if (isError) return <p role="alert" className="text-destructive">{error.message}</p>;
  if (data.length === 0) {
    return <p className="rounded-lg border bg-card p-6 text-muted-foreground">Nothing is running low. Every product is above its threshold.</p>;
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Threshold</TableHead>
            <TableHead className="text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((p) => (
            <TableRow key={p.id}>
              <TableCell>
                <div className="font-medium">{p.name}</div>
                {p.brand && <div className="text-xs text-muted-foreground">{p.brand}</div>}
              </TableCell>
              <TableCell>
                {p.outOfStock ? <Badge variant="destructive">Out of stock</Badge> : <Badge variant="secondary">{p.stock} left</Badge>}
              </TableCell>
              <TableCell>{p.lowStockThreshold}</TableCell>
              <TableCell className="text-right">
                <Link className="text-primary underline-offset-4 hover:underline" href={`/admin/products/${p.id}/edit`}>
                  Restock
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

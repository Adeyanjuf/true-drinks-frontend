import { createColumnHelper, tableFeatures } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ProductActions } from "@/components/admin/products/product-actions";
import { formatPence, formatWeight } from "@/lib/format";
import type { Product } from "@/lib/api/types";

// Core features only: pagination, filters and sorting are done by the API.
export const productTableFeatures = tableFeatures({});
const helper = createColumnHelper<typeof productTableFeatures, Product>();

export const productColumns = helper.columns([
  helper.accessor("name", {
    header: "Product",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.name}</div>
        {row.original.brand && (
          <div className="text-xs text-muted-foreground">{row.original.brand}</div>
        )}
      </div>
    ),
  }),
  helper.display({
    id: "category",
    header: "Category",
    cell: ({ row }) => row.original.category?.name ?? "None",
  }),
  helper.display({
    id: "price",
    header: "Price",
    cell: ({ row }) => {
      const p = row.original;
      return p.discountPercent > 0 ? (
        <div>
          <span className="font-medium">{formatPence(p.finalPricePence)}</span>{" "}
          <span className="text-xs text-muted-foreground line-through">{formatPence(p.pricePence)}</span>
          <Badge variant="secondary" className="ml-1">-{p.discountPercent}%</Badge>
        </div>
      ) : (
        formatPence(p.pricePence)
      );
    },
  }),
  helper.display({
    id: "stock",
    header: "Stock",
    cell: ({ row }) => {
      const p = row.original;
      if (p.stock === 0) return <Badge variant="destructive">Out of stock</Badge>;
      if (p.stock <= p.lowStockThreshold) return <Badge variant="secondary">Low: {p.stock}</Badge>;
      return p.stock;
    },
  }),
  helper.display({
    id: "weight",
    header: "Weight",
    cell: ({ row }) => formatWeight(row.original.weightGrams),
  }),
  helper.display({
    id: "restricted",
    header: "Age restricted",
    cell: ({ row }) => (row.original.isAgeRestricted ? "Yes" : "No"),
  }),
  helper.display({
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <ProductActions product={row.original} />,
  }),
]);

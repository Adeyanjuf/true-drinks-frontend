"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { useTable } from "@tanstack/react-table";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LowStockPanel } from "@/components/admin/products/low-stock-panel";
import { productColumns, productTableFeatures } from "@/components/admin/products/product-columns";
import { useCategories, useProducts, type ProductFilters } from "@/lib/api/catalog";
import type { Product } from "@/lib/api/types";

const PAGE_SIZE = 10;
const NO_PRODUCTS: Product[] = []; // stable reference, see TanStack Table notes

export default function ProductsPage() {
  const [view, setView] = useState<"all" | "low">("all");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [stock, setStock] = useState<"" | "in" | "out">("");
  const [sort, setSort] = useState<ProductFilters["sort"] | "">("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const categories = useCategories();
  const products = useProducts({
    page,
    limit: PAGE_SIZE,
    search: debounced || undefined,
    categoryId: categoryId || undefined,
    inStock: stock === "" ? undefined : stock === "in",
    sort: sort || undefined,
  });

  const table = useTable({
    features: productTableFeatures,
    columns: productColumns,
    data: products.data?.items ?? NO_PRODUCTS,
  });

  const meta = products.data?.meta;

  return (
    <main className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Link href="/admin/products/new" className={buttonVariants()}>
          <Plus aria-hidden /> New product
        </Link>
      </div>

      <div role="tablist" aria-label="Product views" className="flex gap-2">
        {([["all", "All products"], ["low", "Low stock"]] as const).map(([key, label]) => (
          <Button
            key={key}
            role="tab"
            aria-selected={view === key}
            variant={view === key ? "default" : "outline"}
            onClick={() => setView(key)}
          >
            {label}
          </Button>
        ))}
      </div>

      {view === "low" ? (
        <LowStockPanel />
      ) : (
        <>
          <div className="flex flex-wrap gap-3">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2 size-4 text-muted-foreground" aria-hidden />
              <Input
                aria-label="Search products"
                placeholder="Search name or brand"
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <NativeSelect
              aria-label="Filter by category"
              className="w-48"
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All categories</option>
              {categories.data?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </NativeSelect>
            <NativeSelect
              aria-label="Filter by stock"
              className="w-40"
              value={stock}
              onChange={(e) => {
                setStock(e.target.value as typeof stock);
                setPage(1);
              }}
            >
              <option value="">Any stock</option>
              <option value="in">In stock</option>
              <option value="out">Out of stock</option>
            </NativeSelect>
            <NativeSelect
              aria-label="Sort products"
              className="w-44"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as typeof sort);
                setPage(1);
              }}
            >
              <option value="">Newest first</option>
              <option value="name">Name</option>
              <option value="price_asc">Price low to high</option>
              <option value="price_desc">Price high to low</option>
            </NativeSelect>
          </div>

          {products.isError && (
            <p role="alert" className="text-destructive">{products.error.message}</p>
          )}

          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((group) => (
                  <TableRow key={group.id}>
                    {group.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {products.isPending ? (
                  <TableRow>
                    <TableCell colSpan={productColumns.length} className="py-8 text-center text-muted-foreground">
                      Loading…
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={productColumns.length} className="py-8 text-center text-muted-foreground">
                      No products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getAllCells().map((cell) => (
                        <TableCell key={cell.id}>
                          <table.FlexRender cell={cell} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {meta && meta.total > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Page {meta.page} of {meta.totalPages} ({meta.total} products)
              </span>
              <div className="flex gap-2">
                <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button variant="outline" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}

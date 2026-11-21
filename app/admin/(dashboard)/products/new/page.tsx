"use client";

import { ProductForm } from "@/components/admin/products/product-form";
import { useCreateProduct } from "@/lib/api/catalog";

export default function NewProductPage() {
  const create = useCreateProduct();
  return (
    <main className="p-8">
      <h1 className="mb-6 text-2xl font-semibold">New product</h1>
      <ProductForm submitLabel="Create product" onSubmit={(p) => create.mutateAsync(p)} />
    </main>
  );
}

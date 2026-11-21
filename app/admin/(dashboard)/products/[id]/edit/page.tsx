"use client";

import { use } from "react";
import { ProductForm } from "@/components/admin/products/product-form";
import { useProduct, useUpdateProduct } from "@/lib/api/catalog";
import { productToForm } from "@/lib/validation/product";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const product = useProduct(id);
  const update = useUpdateProduct(id);

  return (
    <main className="p-8">
      <h1 className="mb-6 text-2xl font-semibold">Edit product</h1>
      {product.isPending && <p className="text-muted-foreground">Loading…</p>}
      {product.isError && (
        <p role="alert" className="text-destructive">{product.error.message}</p>
      )}
      {product.data && (
        <ProductForm
          initial={productToForm(product.data)}
          submitLabel="Save changes"
          onSubmit={(p) => update.mutateAsync(p)}
        />
      )}
    </main>
  );
}

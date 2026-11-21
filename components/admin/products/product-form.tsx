"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { useCategories } from "@/lib/api/catalog";
import {
  emptyProductForm,
  formToPayload,
  productFormSchema,
  type ProductFormValues,
} from "@/lib/validation/product";
import type { ProductPayload } from "@/lib/api/types";

type Props = {
  initial?: ProductFormValues;
  submitLabel: string;
  onSubmit: (payload: ProductPayload) => Promise<unknown>;
};

export function ProductForm({ initial = emptyProductForm, submitLabel, onSubmit }: Props) {
  const router = useRouter();
  const categories = useCategories();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: initial,
  });

  async function submit(values: ProductFormValues) {
    setServerError(null);
    try {
      await onSubmit(formToPayload(values));
      router.push("/admin/products");
    } catch (e) {
      setServerError((e as Error).message);
    }
  }

  const noCategories = categories.isSuccess && categories.data.length === 0;

  return (
    <form onSubmit={handleSubmit(submit)} className="max-w-3xl space-y-6" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" id="name" error={errors.name?.message} className="sm:col-span-2">
          <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
        </Field>
        <Field label="Brand" id="brand" error={errors.brand?.message}>
          <Input id="brand" {...register("brand")} />
        </Field>
        <Field label="Category" id="categoryId" error={errors.categoryId?.message}>
          <NativeSelect id="categoryId" aria-invalid={!!errors.categoryId} {...register("categoryId")}>
            <option value="">Select a category</option>
            {categories.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </NativeSelect>
          {noCategories && (
            <p className="text-sm text-muted-foreground">Create a category first.</p>
          )}
        </Field>
        <Field label="Price (GBP)" id="price" error={errors.price?.message}>
          <Input id="price" inputMode="decimal" placeholder="12.99" aria-invalid={!!errors.price} {...register("price")} />
        </Field>
        <Field label="Discount (%)" id="discountPercent" error={errors.discountPercent?.message}>
          <Input id="discountPercent" inputMode="numeric" {...register("discountPercent")} />
        </Field>
        <Field label="Weight per unit (grams)" id="weightGrams" error={errors.weightGrams?.message}>
          <Input id="weightGrams" inputMode="numeric" aria-invalid={!!errors.weightGrams} {...register("weightGrams")} />
        </Field>
        <Field label="ABV (%)" id="abv" error={errors.abv?.message}>
          <Input id="abv" inputMode="decimal" placeholder="37.5" {...register("abv")} />
        </Field>
        <Field label="Stock" id="stock" error={errors.stock?.message}>
          <Input id="stock" inputMode="numeric" {...register("stock")} />
        </Field>
        <Field label="Low stock threshold" id="lowStockThreshold" error={errors.lowStockThreshold?.message}>
          <Input id="lowStockThreshold" inputMode="numeric" {...register("lowStockThreshold")} />
        </Field>
        <Field label="Description" id="description" error={errors.description?.message} className="sm:col-span-2">
          <Textarea id="description" rows={4} {...register("description")} />
        </Field>
        <Field label="Image URLs (one per line)" id="images" error={errors.images?.message} className="sm:col-span-2">
          <Textarea id="images" rows={3} {...register("images")} />
        </Field>
        <div className="flex items-center gap-2 sm:col-span-2">
          <input id="isAgeRestricted" type="checkbox" className="size-4 accent-primary" {...register("isAgeRestricted")} />
          <Label htmlFor="isAgeRestricted">Age restricted (checkout will run age verification)</Label>
        </div>
      </div>

      {serverError && (
        <p role="alert" className="text-sm text-destructive">
          {serverError}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : submitLabel}
        </Button>
        <Link href="/admin/products" className={buttonVariants({ variant: "outline" })}>
          Cancel
        </Link>
      </div>
    </form>
  );
}

function Field({
  label,
  id,
  error,
  className,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

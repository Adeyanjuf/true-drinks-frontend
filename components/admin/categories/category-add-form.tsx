"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateCategory } from "@/lib/api/catalog";
import { categoryFormSchema, type CategoryFormValues } from "@/lib/validation/category";

export function CategoryAddForm() {
  const create = useCreateCategory();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({ resolver: zodResolver(categoryFormSchema), defaultValues: { name: "" } });

  async function submit(values: CategoryFormValues) {
    setServerError(null);
    try {
      await create.mutateAsync(values.name);
      reset();
    } catch (e) {
      setServerError((e as Error).message);
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="flex max-w-xl items-start gap-3">
      <div className="flex-1 space-y-1.5">
        <Label htmlFor="new-category">New category</Label>
        <Input id="new-category" placeholder="e.g. Whisky" aria-invalid={!!errors.name} {...register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        {serverError && (
          <p role="alert" className="text-sm text-destructive">
            {serverError}
          </p>
        )}
      </div>
      <Button type="submit" className="mt-6" disabled={isSubmitting}>
        <Plus aria-hidden /> Add category
      </Button>
    </form>
  );
}

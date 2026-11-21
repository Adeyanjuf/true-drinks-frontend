"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteProduct } from "@/lib/api/catalog";
import type { Product } from "@/lib/api/types";

export function ProductActions({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const del = useDeleteProduct();

  async function confirm() {
    setError(null);
    try {
      await del.mutateAsync(product.id);
      setOpen(false);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="flex justify-end gap-1">
      <Link
        href={`/admin/products/${product.id}/edit`}
        aria-label={`Edit ${product.name}`}
        className={buttonVariants({ variant: "ghost", size: "sm" })}
      >
        <Pencil aria-hidden />
      </Link>
      <Button
        variant="ghost"
        size="sm"
        aria-label={`Delete ${product.name}`}
        onClick={() => setOpen(true)}
      >
        <Trash2 aria-hidden />
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {product.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the product from the store. It cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={del.isPending}
              onClick={(e) => {
                e.preventDefault();
                void confirm();
              }}
            >
              {del.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

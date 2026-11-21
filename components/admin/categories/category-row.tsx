"use client";

import { useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
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
import { useDeleteCategory, useUpdateCategory } from "@/lib/api/catalog";
import { categoryFormSchema } from "@/lib/validation/category";
import type { Category } from "@/lib/api/types";

export function CategoryRow({ category }: { category: Category }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const update = useUpdateCategory();
  const del = useDeleteCategory();

  async function save() {
    const parsed = categoryFormSchema.safeParse({ name });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setError(null);
    try {
      await update.mutateAsync({ id: category.id, name: parsed.data.name });
      setEditing(false);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function cancel() {
    setName(category.name);
    setError(null);
    setEditing(false);
  }

  async function remove() {
    setDeleteError(null);
    try {
      await del.mutateAsync(category.id);
      setConfirmOpen(false);
    } catch (e) {
      setDeleteError((e as Error).message);
    }
  }

  return (
    <TableRow>
      <TableCell>
        {editing ? (
          <div className="space-y-1">
            <Input
              aria-label={`Rename ${category.name}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void save();
                if (e.key === "Escape") cancel();
              }}
              autoFocus
            />
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
        ) : (
          <span className="font-medium">{category.name}</span>
        )}
      </TableCell>
      <TableCell className="text-muted-foreground">{category.slug}</TableCell>
      <TableCell>
        <div className="flex justify-end gap-1">
          {editing ? (
            <>
              <Button variant="ghost" size="sm" aria-label={`Save ${category.name}`} onClick={() => void save()} disabled={update.isPending}>
                <Check aria-hidden />
              </Button>
              <Button variant="ghost" size="sm" aria-label="Cancel rename" onClick={cancel}>
                <X aria-hidden />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" aria-label={`Rename ${category.name}`} onClick={() => setEditing(true)}>
                <Pencil aria-hidden />
              </Button>
              <Button variant="ghost" size="sm" aria-label={`Delete ${category.name}`} onClick={() => setConfirmOpen(true)}>
                <Trash2 aria-hidden />
              </Button>
            </>
          )}
        </div>

        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {category.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                A category that still has products cannot be deleted. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {deleteError && (
              <p role="alert" className="text-sm text-destructive">
                {deleteError}
              </p>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={del.isPending}
                onClick={(e) => {
                  e.preventDefault();
                  void remove();
                }}
              >
                {del.isPending ? "Deleting…" : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
}

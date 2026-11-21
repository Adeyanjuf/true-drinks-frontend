"use client";

import { CategoryAddForm } from "@/components/admin/categories/category-add-form";
import { CategoryRow } from "@/components/admin/categories/category-row";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCategories } from "@/lib/api/catalog";

export default function CategoriesPage() {
  const { data, isPending, isError, error } = useCategories();

  return (
    <main className="space-y-6 p-8">
      <h1 className="text-2xl font-semibold">Categories</h1>
      <CategoryAddForm />

      {isError && (
        <p role="alert" className="text-destructive">
          {error.message}
        </p>
      )}

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableRow>
                <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                  No categories yet. Add your first one above.
                </TableCell>
              </TableRow>
            ) : (
              data?.map((c) => <CategoryRow key={c.id} category={c} />)
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}

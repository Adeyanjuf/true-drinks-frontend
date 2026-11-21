"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { useAdvanceOrder } from "@/lib/api/orders";
import { NEXT_STATUS, STATUS_LABEL } from "@/lib/orders";
import type { Order } from "@/lib/api/types";

/** Offers only the single valid next step and asks first, because it emails the customer. */
export function AdvanceStatusButton({ order }: { order: Pick<Order, "id" | "trackingId" | "status"> }) {
  const next = NEXT_STATUS[order.status];
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const advance = useAdvanceOrder();

  if (!next) return <span className="text-sm text-muted-foreground">Complete</span>;

  async function confirm() {
    if (!next) return;
    setError(null);
    try {
      await advance.mutateAsync({ id: order.id, status: next });
      setOpen(false);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)} aria-label={`Mark ${order.trackingId} as ${STATUS_LABEL[next]}`}>
        Mark as {STATUS_LABEL[next]}
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark {order.trackingId} as {STATUS_LABEL[next]}?</AlertDialogTitle>
            <AlertDialogDescription>
              The customer will be emailed about this change. Statuses only move forward and cannot be undone.
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
              disabled={advance.isPending}
              onClick={(e) => {
                e.preventDefault();
                void confirm();
              }}
            >
              {advance.isPending ? "Updating…" : `Mark as ${STATUS_LABEL[next]}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

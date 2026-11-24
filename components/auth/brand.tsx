import { Wine } from "lucide-react";
import { cn } from "@/lib/utils";

export const PRODUCT_NAME = "True Drinks";

export function Brand({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span
        aria-hidden
        className="flex size-10 items-center justify-center rounded-xl bg-indigo-depth text-gold shadow-sm"
      >
        <Wine className="size-5" />
      </span>
      <span className="text-xl font-semibold tracking-tight text-midnight">
        {PRODUCT_NAME}
      </span>
    </div>
  );
}

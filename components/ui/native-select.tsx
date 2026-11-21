import * as React from "react";
import { cn } from "@/lib/utils";

// A styled native select: accessible by default and works with react-hook-form's register.
export const NativeSelect = React.forwardRef<
  HTMLSelectElement,
  React.ComponentProps<"select">
>(function NativeSelect({ className, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-input bg-card px-2.5 py-1 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive md:text-sm",
        className,
      )}
      {...props}
    />
  );
});

import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, X } from "lucide-react";
import { Brand } from "./brand";
import { AuthSlideshow } from "./auth-slideshow";

/**
 * Shared sign in layout for admin and customers: form on one half,
 * a rotating showcase of the range on the other (hidden on small screens).
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-2">
      <section className="flex flex-col px-6 py-8 sm:px-12 lg:px-16">
        <Brand />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          {children}
        </div>
      </section>
      <AuthSlideshow />
    </main>
  );
}

export function AuthDivider({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-warm-grey">
      <span className="h-px flex-1 bg-border" />
      {children}
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-destructive">{message}</p> : null;
}

/**
 * Single message area for a form: errors and confirmations. Announced to
 * screen readers and can be dismissed. Forms clear it when the user edits.
 */
export function FormMessage({
  kind = "error",
  message,
  onDismiss,
}: {
  kind?: "error" | "success";
  message: string | null;
  onDismiss: () => void;
}) {
  if (!message) return null;
  const error = kind === "error";
  const Icon = error ? CircleAlert : CircleCheck;
  return (
    <div
      role={error ? "alert" : "status"}
      className={
        error
          ? "flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          : "flex items-start gap-2 rounded-lg border border-indigo-depth/20 bg-indigo-depth/5 px-3 py-2 text-sm text-indigo-depth"
      }
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss message"
        className="shrink-0 rounded p-0.5 opacity-70 hover:opacity-100"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

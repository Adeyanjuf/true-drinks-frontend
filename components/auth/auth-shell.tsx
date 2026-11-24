import type { ReactNode } from "react";
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

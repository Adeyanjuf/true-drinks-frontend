"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { AuthShell } from "@/components/auth/auth-shell";
import { postJson } from "@/lib/auth/post";

/** Finishes Google sign in for an existing account by exchanging the one-time code. */
export function GoogleCallback({ code }: { code: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(
    code ? null : "The Google sign in link is incomplete.",
  );
  // The code is single use; guard against the effect running twice in development.
  const started = useRef(false);

  useEffect(() => {
    if (!code || started.current) return;
    started.current = true;
    postJson("/api/auth/google-exchange", { code })
      .then(() => {
        router.replace("/");
        router.refresh();
      })
      .catch((e: Error) => setError(e.message));
  }, [code, router]);

  return (
    <AuthShell>
      {error ? (
        <>
          <h1 className="text-2xl font-semibold text-midnight">Google sign in failed</h1>
          <p role="alert" className="mt-1 text-sm text-destructive">{error}</p>
          <Link href="/login" className={`${buttonVariants()} mt-8 w-full`}>
            Back to sign in
          </Link>
        </>
      ) : (
        <div role="status" className="flex items-center gap-3 text-warm-grey">
          <LoaderCircle className="size-5 animate-spin" />
          Signing you in with Google…
        </div>
      )}
    </AuthShell>
  );
}

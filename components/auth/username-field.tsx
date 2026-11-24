"use client";

import { useEffect, useState, type ComponentProps } from "react";
import { Check, LoaderCircle, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export type UsernameStatus = "idle" | "checking" | "available" | "taken";

export const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;

/** Debounced availability check against our route handler. */
export function useUsernameStatus(value: string | undefined): UsernameStatus {
  const [state, setState] = useState<{ value: string; status: UsernameStatus }>({
    value: "",
    status: "idle",
  });
  const candidate = value ?? "";
  const valid = USERNAME_PATTERN.test(candidate);

  useEffect(() => {
    if (!valid) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/auth/check-username?username=${encodeURIComponent(candidate)}`,
          { signal: controller.signal },
        );
        const body = await res.json();
        setState({ value: candidate, status: body.available ? "available" : "taken" });
      } catch {
        /* aborted or offline: leave the last answer; the server re-checks on submit */
      }
    }, 400);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [candidate, valid]);

  if (!valid) return "idle";
  return state.value === candidate ? state.status : "checking";
}

export function UsernameField({
  status,
  ...props
}: Omit<ComponentProps<typeof Input>, "type"> & { status: UsernameStatus }) {
  return (
    <div className="space-y-1.5">
      <div className="relative">
        <Input {...props} type="text" autoComplete="username" className="pr-10" />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          {status === "checking" && <LoaderCircle className="size-4 animate-spin text-warm-grey" />}
          {status === "available" && <Check className="size-4 text-indigo-depth" />}
          {status === "taken" && <X className="size-4 text-destructive" />}
        </span>
      </div>
      <p aria-live="polite" className="min-h-4 text-xs">
        {status === "available" && <span className="text-indigo-depth">Username is available</span>}
        {status === "taken" && <span className="text-destructive">That username is taken</span>}
        {status === "checking" && <span className="text-warm-grey">Checking availability</span>}
      </p>
    </div>
  );
}

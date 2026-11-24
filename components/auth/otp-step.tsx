"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FieldError, FormMessage } from "@/components/auth/auth-shell";
import { OtpInput } from "@/components/auth/otp-input";
import { useFormMessage } from "@/components/auth/use-form-message";
import { postJson } from "@/lib/auth/post";

const schema = z.object({ otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code") });
type Values = z.infer<typeof schema>;

const RESEND_COOLDOWN_SECONDS = 60;

type Props = {
  email: string;
  /** Route handler that verifies the code and sets the session cookies. */
  verifyUrl: string;
  /** Route handler that emails a new code. */
  resendUrl: string;
  /** Extra fields sent with the resend request (for example isReturning). */
  resendExtra?: Record<string, unknown>;
  onVerified: () => void;
  onBack: () => void;
  stepLabel?: string;
  backLabel?: string;
  submitLabel?: string;
};

/** Second step of every sign in or sign up wizard: six boxes, resend, back. */
export function OtpStep({
  email,
  verifyUrl,
  resendUrl,
  resendExtra,
  onVerified,
  onBack,
  stepLabel = "Step 2 of 2",
  backLabel = "Back",
  submitLabel = "Sign in",
}: Props) {
  const { message, clear, error, success } = useFormMessage();
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [resending, setResending] = useState(false);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { otp: "" } });

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function onSubmit(values: Values) {
    clear();
    try {
      await postJson(verifyUrl, { email, otp: values.otp });
      onVerified();
    } catch (e) {
      error(e);
    }
  }

  async function onResend() {
    clear();
    setResending(true);
    try {
      await postJson(resendUrl, { email, ...resendExtra });
      form.reset({ otp: "" });
      setCooldown(RESEND_COOLDOWN_SECONDS);
      success(`A new code was sent to ${email}`);
    } catch (e) {
      error(e);
    } finally {
      setResending(false);
    }
  }

  return (
    <>
      <p className="text-xs font-medium uppercase tracking-widest text-indigo-depth">{stepLabel}</p>
      <h1 className="mt-2 text-2xl font-semibold text-midnight">Check your email</h1>
      <p className="mt-1 text-sm text-warm-grey">
        We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
      </p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div className="space-y-2">
          <Controller
            control={form.control}
            name="otp"
            render={({ field }) => (
              <OtpInput
                autoFocus
                value={field.value}
                onChange={(v) => {
                  clear();
                  field.onChange(v);
                }}
                invalid={!!form.formState.errors.otp || message?.kind === "error"}
                disabled={form.formState.isSubmitting}
              />
            )}
          />
          <FieldError message={form.formState.errors.otp?.message} />
        </div>
        <FormMessage kind={message?.kind} message={message?.text ?? null} onDismiss={clear} />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Verifying…" : submitLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={cooldown > 0 || resending}
          onClick={onResend}
        >
          {resending ? "Sending…" : cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </Button>
        <Button type="button" variant="ghost" className="w-full" onClick={onBack}>
          {backLabel}
        </Button>
      </form>
    </>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AuthShell, FieldError, FormMessage } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { useFormMessage } from "@/components/auth/use-form-message";
import { postJson } from "@/lib/auth/post";

const schema = z
  .object({
    newPassword: z.string().min(8, "Use at least 8 characters"),
    confirm: z.string().min(1, "Confirm your new password"),
  })
  .refine((v) => v.newPassword === v.confirm, {
    path: ["confirm"],
    message: "The passwords do not match",
  });
type Values = z.infer<typeof schema>;

export function ResetPasswordForm({ token }: { token: string }) {
  const [done, setDone] = useState(false);
  const { message, clear, error } = useFormMessage();
  const form = useForm<Values>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Values) {
    clear();
    try {
      await postJson("/api/auth/reset-password", { token, newPassword: values.newPassword });
      setDone(true);
    } catch (e) {
      error(e);
    }
  }

  if (!token) {
    return (
      <AuthShell>
        <h1 className="text-2xl font-semibold text-midnight">This link is not valid</h1>
        <p className="mt-1 text-sm text-warm-grey">
          The reset link is missing its token. Request a new one to continue.
        </p>
        <Link href="/forgot-password" className={`${buttonVariants()} mt-8 w-full`}>
          Request a new link
        </Link>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell>
        <h1 className="text-2xl font-semibold text-midnight">Password updated</h1>
        <p className="mt-1 text-sm text-warm-grey">
          You were signed out everywhere. Sign in with your new password.
        </p>
        <Link href="/login" className={`${buttonVariants()} mt-8 w-full`}>
          Go to sign in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <h1 className="text-2xl font-semibold text-midnight">Choose a new password</h1>
      <p className="mt-1 text-sm text-warm-grey">Use at least 8 characters.</p>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="newPassword">New password</Label>
          <PasswordInput
            id="newPassword"
            autoComplete="new-password"
            {...form.register("newPassword", { onChange: clear })}
          />
          <FieldError message={form.formState.errors.newPassword?.message} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirm password</Label>
          <PasswordInput
            id="confirm"
            autoComplete="new-password"
            {...form.register("confirm", { onChange: clear })}
          />
          <FieldError message={form.formState.errors.confirm?.message} />
        </div>
        <FormMessage kind={message?.kind} message={message?.text ?? null} onDismiss={clear} />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving…" : "Update password"}
        </Button>
      </form>
    </AuthShell>
  );
}

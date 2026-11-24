"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell, FieldError, FormMessage } from "@/components/auth/auth-shell";
import { useFormMessage } from "@/components/auth/use-form-message";
import { postJson } from "@/lib/auth/post";

const schema = z.object({ email: z.email("Enter a valid email address") });
type Values = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const { message, clear, error, success } = useFormMessage();
  const form = useForm<Values>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Values) {
    clear();
    try {
      await postJson("/api/auth/forgot-password", values);
      // The API answers generically, so the wording must not confirm the account exists.
      success(`If an account exists for ${values.email}, a reset link is on its way.`);
    } catch (e) {
      error(e);
    }
  }

  return (
    <AuthShell>
      <h1 className="text-2xl font-semibold text-midnight">Forgot your password?</h1>
      <p className="mt-1 text-sm text-warm-grey">
        Enter your email and we will send you a link to choose a new one.
      </p>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...form.register("email", { onChange: clear })}
          />
          <FieldError message={form.formState.errors.email?.message} />
        </div>
        <FormMessage kind={message?.kind} message={message?.text ?? null} onDismiss={clear} />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Sending…" : "Send reset link"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-warm-grey">
        <Link href="/login" className="font-medium text-indigo-depth hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}

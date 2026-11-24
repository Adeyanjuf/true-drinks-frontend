"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthDivider, AuthShell, FieldError, FormMessage } from "@/components/auth/auth-shell";
import { GoogleButton } from "@/components/auth/google-button";
import { OtpStep } from "@/components/auth/otp-step";
import { PasswordInput } from "@/components/auth/password-input";
import { useFormMessage } from "@/components/auth/use-form-message";
import { postJson } from "@/lib/auth/post";

const schema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});
type Values = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const { message, clear, error } = useFormMessage();
  const form = useForm<Values>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Values) {
    clear();
    try {
      await postJson("/api/auth/login", values);
      setEmail(values.email);
    } catch (e) {
      error(e);
    }
  }

  if (email) {
    return (
      <AuthShell>
        <OtpStep
          email={email}
          verifyUrl="/api/auth/verify-otp"
          resendUrl="/api/auth/resend-otp"
          resendExtra={{ isReturning: true }}
          onVerified={() => {
            router.replace("/");
            router.refresh();
          }}
          onBack={() => {
            setEmail(null);
            clear();
          }}
        />
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <p className="text-xs font-medium uppercase tracking-widest text-indigo-depth">Step 1 of 2</p>
      <h1 className="mt-2 text-2xl font-semibold text-midnight">Welcome back</h1>
      <p className="mt-1 text-sm text-warm-grey">Sign in to your account</p>

      <div className="mt-8 space-y-5">
        <GoogleButton />
        <AuthDivider>or with email</AuthDivider>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              {...form.register("email", { onChange: clear })}
            />
            <FieldError message={form.formState.errors.email?.message} />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-xs font-medium text-indigo-depth hover:underline">
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              {...form.register("password", { onChange: clear })}
            />
            <FieldError message={form.formState.errors.password?.message} />
          </div>
          <FormMessage kind={message?.kind} message={message?.text ?? null} onDismiss={clear} />
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Sending code…" : "Continue"}
          </Button>
        </form>
        <p className="text-center text-sm text-warm-grey">
          New here?{" "}
          <Link href="/register" className="font-medium text-indigo-depth hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell, FieldError, FormMessage } from "@/components/auth/auth-shell";
import { OtpStep } from "@/components/auth/otp-step";
import { PasswordInput } from "@/components/auth/password-input";
import { useFormMessage } from "@/components/auth/use-form-message";
import { postJson } from "@/lib/auth/post";

const schema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});
type Values = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const { message, clear, error } = useFormMessage();
  const form = useForm<Values>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Values) {
    clear();
    try {
      await postJson("/api/admin/auth/login", {
        identifier: values.email,
        password: values.password,
      });
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
          verifyUrl="/api/admin/auth/verify-otp"
          resendUrl="/api/admin/auth/resend-otp"
          onVerified={() => {
            router.replace("/admin");
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
      <h1 className="mt-2 text-2xl font-semibold text-midnight">Admin sign in</h1>
      <p className="mt-1 text-sm text-warm-grey">Use your administrator account</p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
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
          <Label htmlFor="password">Password</Label>
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
    </AuthShell>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell, FieldError } from "@/components/auth/auth-shell";
import { OtpInput } from "@/components/auth/otp-input";

const credentialsSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});
const otpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});
type Credentials = z.infer<typeof credentialsSchema>;
type Otp = z.infer<typeof otpSchema>;

async function post(url: string, data: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message ?? "Something went wrong");
  return body;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const credsForm = useForm<Credentials>({
    resolver: zodResolver(credentialsSchema),
  });
  const otpForm = useForm<Otp>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  async function onCredentials(values: Credentials) {
    setError(null);
    try {
      await post("/api/admin/auth/login", {
        identifier: values.email,
        password: values.password,
      });
      setEmail(values.email);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function onOtp(values: Otp) {
    setError(null);
    try {
      await post("/api/admin/auth/verify-otp", { email, otp: values.otp });
      router.replace("/admin");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <AuthShell>
      <p className="text-xs font-medium uppercase tracking-widest text-indigo-depth">
        Step {email ? 2 : 1} of 2
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-midnight">
        {email ? "Check your email" : "Admin sign in"}
      </h1>
      <p className="mt-1 text-sm text-warm-grey">
        {email ? (
          <>
            We sent a 6-digit code to{" "}
            <span className="font-medium text-foreground">{email}</span>
          </>
        ) : (
          "Use your administrator account"
        )}
      </p>

      <div className="mt-8">
        {!email ? (
          <form
            onSubmit={credsForm.handleSubmit(onCredentials)}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                {...credsForm.register("email")}
              />
              <FieldError message={credsForm.formState.errors.email?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...credsForm.register("password")}
              />
              <FieldError message={credsForm.formState.errors.password?.message} />
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={credsForm.formState.isSubmitting}>
              {credsForm.formState.isSubmitting ? "Sending code…" : "Continue"}
            </Button>
          </form>
        ) : (
          <form onSubmit={otpForm.handleSubmit(onOtp)} className="space-y-4">
            <div className="space-y-2">
              <Controller
                control={otpForm.control}
                name="otp"
                render={({ field }) => (
                  <OtpInput
                    autoFocus
                    value={field.value}
                    onChange={field.onChange}
                    invalid={!!otpForm.formState.errors.otp || !!error}
                    disabled={otpForm.formState.isSubmitting}
                  />
                )}
              />
              <FieldError message={otpForm.formState.errors.otp?.message} />
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={otpForm.formState.isSubmitting}>
              {otpForm.formState.isSubmitting ? "Verifying…" : "Sign in"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setEmail(null);
                setError(null);
                otpForm.reset();
              }}
            >
              Back
            </Button>
          </form>
        )}
      </div>
    </AuthShell>
  );
}

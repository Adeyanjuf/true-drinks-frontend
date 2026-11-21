"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const credentialsSchema = z.object({
  identifier: z.string().min(1, "Enter your email or username"),
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
  const otpForm = useForm<Otp>({ resolver: zodResolver(otpSchema) });

  async function onCredentials(values: Credentials) {
    setError(null);
    try {
      await post("/api/admin/auth/login", values);
      // The OTP is emailed to the account address; fall back to what was typed.
      setEmail(values.identifier);
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
    <main className="flex min-h-screen items-center justify-center bg-midnight p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Admin sign in</CardTitle>
          <CardDescription>
            {email
              ? `Enter the 6-digit code sent to ${email}`
              : "Use your administrator account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!email ? (
            <form
              onSubmit={credsForm.handleSubmit(onCredentials)}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label htmlFor="identifier">Email or username</Label>
                <Input
                  id="identifier"
                  autoComplete="username"
                  {...credsForm.register("identifier")}
                />
                <FieldError message={credsForm.formState.errors.identifier?.message} />
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
              <div className="space-y-1.5">
                <Label htmlFor="otp">Verification code</Label>
                <Input
                  id="otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  {...otpForm.register("otp")}
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
                }}
              >
                Back
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-destructive">{message}</p> : null;
}

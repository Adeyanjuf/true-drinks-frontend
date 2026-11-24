"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthDivider, AuthShell, FieldError, FormMessage } from "@/components/auth/auth-shell";
import { GoogleButton } from "@/components/auth/google-button";
import { OtpStep } from "@/components/auth/otp-step";
import { PasswordInput } from "@/components/auth/password-input";
import { UsernameField, USERNAME_PATTERN, useUsernameStatus } from "@/components/auth/username-field";
import { useFormMessage } from "@/components/auth/use-form-message";
import { postJson } from "@/lib/auth/post";

const schema = z
  .object({
  name: z.string().trim().min(1, "Enter your name"),
  email: z.email("Enter a valid email address"),
  username: z
    .string()
    .regex(USERNAME_PATTERN, "Use 3 to 20 letters, numbers or underscores"),
  password: z.string().min(8, "Use at least 8 characters"),
  confirm: z.string().min(1, "Confirm your password"),
})
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "The passwords do not match",
  });
type Values = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const { message, clear, error } = useFormMessage();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", username: "", password: "", confirm: "" },
  });
  const username = useWatch({ control: form.control, name: "username" });
  const usernameStatus = useUsernameStatus(username);

  async function onSubmit(values: Values) {
    clear();
    if (usernameStatus === "taken") {
      form.setError("username", { message: "That username is taken" });
      return;
    }
    try {
      await postJson("/api/auth/register", {
        name: values.name,
        email: values.email,
        username: values.username,
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
          verifyUrl="/api/auth/verify-otp"
          resendUrl="/api/auth/resend-otp"
          resendExtra={{ isReturning: false }}
          submitLabel="Verify and continue"
          backLabel="Edit my details"
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
      <h1 className="mt-2 text-2xl font-semibold text-midnight">Create your account</h1>
      <p className="mt-1 text-sm text-warm-grey">Order your favourite drinks in a few taps</p>

      <div className="mt-8 space-y-5">
        <GoogleButton label="Sign up with Google" />
        <AuthDivider>or with email</AuthDivider>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" autoComplete="name" {...form.register("name", { onChange: clear })} />
            <FieldError message={form.formState.errors.name?.message} />
          </div>
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
          <div className="space-y-1.5">
            <Label htmlFor="username">Username</Label>
            <UsernameField
              id="username"
              status={usernameStatus}
              {...form.register("username", { onChange: clear })}
            />
            <FieldError message={form.formState.errors.username?.message} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              {...form.register("password", { onChange: clear, deps: ["confirm"] })}
            />
            <FieldError message={form.formState.errors.password?.message} />
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
            {form.formState.isSubmitting ? "Creating account…" : "Continue"}
          </Button>
        </form>
        <p className="text-center text-sm text-warm-grey">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-indigo-depth hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

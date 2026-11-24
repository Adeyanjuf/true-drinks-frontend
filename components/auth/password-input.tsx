"use client";

import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

/** Password field with a show/hide toggle. Works with react-hook-form's register. */
export function PasswordInput(props: Omit<ComponentProps<typeof Input>, "type">) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;
  return (
    <div className="relative">
      <Input {...props} type={visible ? "text" : "password"} className="pr-10" />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-lg text-warm-grey transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Icon className="size-4" />
      </button>
    </div>
  );
}

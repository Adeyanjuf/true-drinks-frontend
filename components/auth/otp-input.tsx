"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  invalid?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
};

/** Separate boxes for each digit with auto advance, backspace and paste. */
export function OtpInput({
  value,
  onChange,
  length = 6,
  invalid,
  disabled,
  autoFocus,
}: Props) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  function focusAt(i: number) {
    refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();
  }

  function setDigits(next: string[]) {
    onChange(next.join("").slice(0, length));
  }

  function handleChange(i: number, raw: string) {
    const entered = raw.replace(/\D/g, "");
    if (!entered) return;
    const next = [...digits];
    // A multi character change (autofill, fast typing) spreads across boxes.
    entered.split("").forEach((d, k) => {
      if (i + k < length) next[i + k] = d;
    });
    setDigits(next);
    focusAt(i + entered.length);
  }

  function handleKeyDown(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = [...digits];
      if (next[i]) {
        next[i] = "";
        setDigits(next);
      } else if (i > 0) {
        next[i - 1] = "";
        setDigits(next);
        focusAt(i - 1);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusAt(i - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusAt(i + 1);
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    e.preventDefault();
    const next = pasted.slice(0, length);
    onChange(next);
    focusAt(next.length);
  }

  return (
    <div role="group" aria-label="Verification code" className="flex gap-2">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={digit}
          inputMode="numeric"
          pattern="\d*"
          maxLength={length}
          autoComplete={i === 0 ? "one-time-code" : "off"}
          autoFocus={autoFocus && i === 0}
          disabled={disabled}
          aria-label={`Digit ${i + 1} of ${length}`}
          aria-invalid={invalid || undefined}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            "h-12 min-w-0 flex-1 rounded-lg border border-input bg-card text-center text-lg font-semibold text-foreground outline-none transition-colors",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40",
            "aria-invalid:border-destructive aria-invalid:ring-destructive/20 disabled:opacity-50",
          )}
        />
      ))}
    </div>
  );
}

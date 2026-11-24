"use client";

import { useCallback, useState } from "react";

export type Message = { kind: "error" | "success"; text: string } | null;

/** One message slot per form. Forms call `clear` whenever the person edits. */
export function useFormMessage() {
  const [message, setMessage] = useState<Message>(null);
  const clear = useCallback(() => setMessage(null), []);
  const error = useCallback(
    (e: unknown) =>
      setMessage({ kind: "error", text: e instanceof Error ? e.message : String(e) }),
    [],
  );
  const success = useCallback((text: string) => setMessage({ kind: "success", text }), []);
  return { message, clear, error, success };
}

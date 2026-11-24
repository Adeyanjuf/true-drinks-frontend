import { NextResponse } from "next/server";
import { API_URL, customerSession } from "@/lib/auth/session";

type Json = Record<string, unknown>;

/** Forward a JSON body to the API and return the parsed response. */
export async function callApi(path: string, init?: { method?: string; body?: Json; query?: string }) {
  const res = await fetch(`${API_URL}${path}${init?.query ? `?${init.query}` : ""}`, {
    method: init?.method ?? "POST",
    headers: { "Content-Type": "application/json" },
    body: init?.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });
  const body = await res.json().catch(() => ({}));
  return { res, body };
}

/** Normalises a Nest style message (string or string array). */
export function messageOf(body: { message?: unknown }, fallback: string): string {
  const m = body?.message;
  if (Array.isArray(m)) return m.join(", ");
  return typeof m === "string" && m ? m : fallback;
}

/** Plain passthrough: send selected fields, return ok or the API's error message. */
export async function passthrough(path: string, fields: Json, fallback: string) {
  const { res, body } = await callApi(path, { body: fields });
  if (!res.ok) {
    return NextResponse.json({ message: messageOf(body, fallback) }, { status: res.status });
  }
  return NextResponse.json({ ok: true });
}

/**
 * For endpoints that end with tokens (verify code, Google exchange, complete
 * profile): store them in httpOnly cookies and never return them to the browser.
 */
export async function signInCustomer(path: string, fields: Json, fallback: string) {
  const { res, body } = await callApi(path, { body: fields });
  if (!res.ok) {
    return NextResponse.json({ message: messageOf(body, fallback) }, { status: res.status });
  }
  const payload = body.data ?? body;
  const { token, user } = payload;
  if (!token?.accessToken || !token?.refreshToken) {
    return NextResponse.json({ message: fallback }, { status: 502 });
  }
  if (user?.role === "ADMIN") {
    await customerSession.clearSession();
    return NextResponse.json(
      { message: "Administrators sign in from the admin page" },
      { status: 403 },
    );
  }
  await customerSession.setSession(token.accessToken, token.refreshToken, user);
  return NextResponse.json({ user: { name: user?.name, email: user?.email } });
}

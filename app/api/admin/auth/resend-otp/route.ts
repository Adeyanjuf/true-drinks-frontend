import { NextResponse } from "next/server";
import { API_URL } from "@/lib/auth/session";

// Emails a fresh one-time code to a returning account.
export async function POST(request: Request) {
  const { email } = await request.json();
  const res = await fetch(`${API_URL}/auth/resend-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, isReturning: true }),
    cache: "no-store",
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json(
      { message: body.message ?? "Could not resend the code" },
      { status: res.status },
    );
  }
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { API_URL } from "@/lib/auth/session";

// Step 1: forward credentials; the API emails a one-time code.
export async function POST(request: Request) {
  const { identifier, password } = await request.json();
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
    cache: "no-store",
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json(
      { message: body.message ?? "Login failed" },
      { status: res.status },
    );
  }
  return NextResponse.json({ ok: true });
}

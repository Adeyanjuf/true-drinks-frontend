import { NextResponse } from "next/server";
import { API_URL, clearSession, setSession } from "@/lib/auth/session";

// Step 2: exchange the emailed code for tokens, keep them in httpOnly cookies.
export async function POST(request: Request) {
  const { email, otp } = await request.json();
  const res = await fetch(`${API_URL}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
    cache: "no-store",
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json(
      { message: body.message ?? "Invalid or expired code" },
      { status: res.status },
    );
  }

  // Tolerate the response being wrapped in { data: ... } like the login endpoint.
  const payload = body.data ?? body;
  const { token, user } = payload;
  if (!token?.accessToken || user?.role !== "ADMIN") {
    await clearSession();
    return NextResponse.json(
      { message: "This account is not an administrator" },
      { status: 403 },
    );
  }

  await setSession(token.accessToken, token.refreshToken);
  return NextResponse.json({ user: { name: user.name, email: user.email } });
}

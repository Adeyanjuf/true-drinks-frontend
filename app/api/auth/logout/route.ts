import { NextResponse } from "next/server";
import { API_URL, customerSession } from "@/lib/auth/session";

export async function POST() {
  const { accessToken, refreshToken } = await customerSession.getTokens();
  if (accessToken) {
    // Best effort: revoke the refresh token on the API, then drop cookies regardless.
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => undefined);
  }
  await customerSession.clearSession();
  return NextResponse.json({ ok: true });
}

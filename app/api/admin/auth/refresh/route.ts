import { NextResponse } from "next/server";
import { refreshSession } from "@/lib/auth/session";

// Server components cannot set cookies, so an expired access token sends the
// browser here to renew the session and bounce back to where it was.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") ?? "/admin";
  // Only allow local admin paths, so this cannot be used as an open redirect.
  const safeNext = next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";

  const ok = await refreshSession();
  return NextResponse.redirect(new URL(ok ? safeNext : "/admin/login", url.origin));
}

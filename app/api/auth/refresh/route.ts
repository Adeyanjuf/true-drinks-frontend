import { NextResponse } from "next/server";
import { customerSession } from "@/lib/auth/session";

// Server components cannot set cookies, so an expired access token sends the
// browser here to renew the session and bounce back to where it was.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") ?? "/";
  // Local paths only, so this cannot be used as an open redirect.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  const ok = await customerSession.refreshSession();
  return NextResponse.redirect(new URL(ok ? safeNext : "/login", url.origin));
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Optimistic check only (cookie presence). Real authorization happens in the
// admin layout and on the API, which verifies the JWT and role.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has("fb_admin_refresh");
  const isLogin = pathname === "/admin/login";

  if (!hasSession && !isLogin) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  if (hasSession && isLogin) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

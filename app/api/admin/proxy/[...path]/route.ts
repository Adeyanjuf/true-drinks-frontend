import { NextResponse } from "next/server";
import { API_URL, getTokens, refreshSession } from "@/lib/auth/session";

// Browser calls go through here so the JWT stays in httpOnly cookies. The
// handler attaches the token and renews it once if the API answers 401.
const ALLOWED = ["categories", "products", "promo-codes", "admin/orders"];

type Ctx = { params: Promise<{ path: string[] }> };

async function forward(request: Request, ctx: Ctx) {
  const { path } = await ctx.params;
  const target = path.join("/");
  if (!ALLOWED.some((p) => target === p || target.startsWith(`${p}/`))) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const url = new URL(request.url);
  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.text();

  const call = async (token?: string) =>
    fetch(`${API_URL}/${target}${url.search}`, {
      method: request.method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body,
      cache: "no-store",
    });

  let { accessToken } = await getTokens();
  let res = await call(accessToken);
  if (res.status === 401 && (await refreshSession())) {
    accessToken = (await getTokens()).accessToken;
    res = await call(accessToken);
  }

  const text = await res.text();
  return new NextResponse(text || null, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
  });
}

export { forward as GET, forward as POST, forward as PATCH, forward as PUT, forward as DELETE };

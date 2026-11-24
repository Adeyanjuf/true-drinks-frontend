import { NextResponse } from "next/server";
import { callApi } from "@/lib/auth/forward";

export async function GET(request: Request) {
  const username = new URL(request.url).searchParams.get("username") ?? "";
  const { res, body } = await callApi("/auth/check-username", {
    method: "GET",
    query: new URLSearchParams({ username }).toString(),
  });
  if (!res.ok) return NextResponse.json({ available: false }, { status: res.status });
  return NextResponse.json({ available: Boolean((body.data ?? body).available) });
}

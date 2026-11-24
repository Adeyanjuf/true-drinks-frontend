import { NextResponse } from "next/server";
import { API_URL } from "@/lib/auth/session";

// The API starts the Google flow with a browser redirect, so send the browser there.
export async function GET() {
  return NextResponse.redirect(`${API_URL}/auth/google`);
}

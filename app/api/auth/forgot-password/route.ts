import { passthrough } from "@/lib/auth/forward";

// The API always answers generically, so this never reveals whether an email exists.
export async function POST(request: Request) {
  const { email } = await request.json();
  return passthrough("/auth/forgot-password", { email }, "Could not send the reset link");
}

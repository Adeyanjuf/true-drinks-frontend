import { passthrough } from "@/lib/auth/forward";

// Step 1: check the password; the API emails a one-time code.
export async function POST(request: Request) {
  const { email, password } = await request.json();
  return passthrough("/auth/login", { identifier: email, password }, "Login failed");
}

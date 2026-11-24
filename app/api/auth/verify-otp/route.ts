import { signInCustomer } from "@/lib/auth/forward";

// Exchanges the emailed code for tokens, kept in httpOnly cookies.
export async function POST(request: Request) {
  const { email, otp } = await request.json();
  return signInCustomer("/auth/verify-otp", { email, otp }, "Invalid or expired code");
}

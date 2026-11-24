import { passthrough } from "@/lib/auth/forward";

export async function POST(request: Request) {
  const { email, isReturning } = await request.json();
  return passthrough(
    "/auth/resend-otp",
    { email, isReturning: Boolean(isReturning) },
    "Could not resend the code",
  );
}

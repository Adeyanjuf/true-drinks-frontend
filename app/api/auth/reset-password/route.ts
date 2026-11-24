import { passthrough } from "@/lib/auth/forward";

export async function POST(request: Request) {
  const { token, newPassword } = await request.json();
  return passthrough(
    "/auth/reset-password",
    { token, newPassword },
    "This reset link is invalid or has expired",
  );
}

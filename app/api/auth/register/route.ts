import { passthrough } from "@/lib/auth/forward";

// Creates the account and emails a one-time code to confirm the address.
export async function POST(request: Request) {
  const { name, email, username, password } = await request.json();
  return passthrough(
    "/auth/register",
    { name, email, username, password },
    "Could not create the account",
  );
}

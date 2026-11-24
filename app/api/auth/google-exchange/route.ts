import { signInCustomer } from "@/lib/auth/forward";

// Existing account: swap the short lived code from the Google redirect for tokens.
export async function POST(request: Request) {
  const { code } = await request.json();
  return signInCustomer(
    "/auth/google/exchange",
    { code },
    "This Google sign in link has expired. Please try again.",
  );
}

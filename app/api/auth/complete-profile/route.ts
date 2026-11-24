import { signInCustomer } from "@/lib/auth/forward";

// New Google account: choose a username and password to finish creating it.
export async function POST(request: Request) {
  const { ticket, username, password } = await request.json();
  return signInCustomer(
    "/auth/complete-profile",
    { ticket, username, password },
    "Could not finish creating the account",
  );
}

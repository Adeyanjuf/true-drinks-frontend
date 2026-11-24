import { redirect } from "next/navigation";
import { API_URL, customerSession } from "@/lib/auth/session";

export type Customer = { name?: string; email?: string };

/**
 * Returns the signed in customer or null. Asks the API (a customer-only
 * endpoint) rather than trusting cookie presence. An expired access token is
 * renewed through the refresh route, which bounces back to `currentPath`.
 */
export async function getCustomer(currentPath = "/"): Promise<Customer | null> {
  const { accessToken, refreshToken } = await customerSession.getTokens();
  if (!accessToken) {
    if (refreshToken) redirect(`/api/auth/refresh?next=${encodeURIComponent(currentPath)}`);
    return null;
  }
  const res = await fetch(`${API_URL}/orders/me?limit=1`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (res.status === 401) {
    redirect(`/api/auth/refresh?next=${encodeURIComponent(currentPath)}`);
  }
  if (!res.ok) return null;
  return (await customerSession.getUser()) ?? {};
}

/** For sign in and sign up pages: signed in customers have no business here. */
export async function redirectIfSignedIn(): Promise<void> {
  const { accessToken } = await customerSession.getTokens();
  if (!accessToken) return;
  const res = await fetch(`${API_URL}/orders/me?limit=1`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (res.ok) redirect("/");
}

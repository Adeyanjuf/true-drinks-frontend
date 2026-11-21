import { redirect } from "next/navigation";
import { API_URL, getTokens } from "@/lib/auth/session";

/**
 * Data-access guard for admin pages. Asks the API whether the token belongs to
 * an admin (via a protected admin endpoint) instead of trusting cookie presence.
 * An expired access token is renewed through the refresh route handler.
 */
export async function requireAdmin(currentPath = "/admin"): Promise<void> {
  const { accessToken, refreshToken } = await getTokens();

  if (!accessToken) {
    if (refreshToken) {
      redirect(`/api/admin/auth/refresh?next=${encodeURIComponent(currentPath)}`);
    }
    redirect("/admin/login");
  }

  const res = await fetch(`${API_URL}/admin/orders?limit=1`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (res.status === 401) {
    redirect(`/api/admin/auth/refresh?next=${encodeURIComponent(currentPath)}`);
  }
  if (res.status === 403) redirect("/admin/login");
}

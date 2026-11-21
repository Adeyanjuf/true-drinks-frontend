import { cookies } from "next/headers";

// Server-only module: never import from a "use client" file.
export const ACCESS_COOKIE = "fb_admin_access";
export const REFRESH_COOKIE = "fb_admin_refresh";

const REFRESH_MAX_AGE = 60 * 60 * 24 * 7; // 7 days; the API stays the source of truth

export const API_URL = process.env.API_URL ?? "http://localhost:4000/api";

/** Seconds until the JWT expires, read from its `exp` claim (no signature check). */
function secondsUntilExpiry(jwt: string): number {
  try {
    const payload = JSON.parse(
      Buffer.from(jwt.split(".")[1], "base64url").toString("utf8"),
    );
    return Math.max(Number(payload.exp) - Math.floor(Date.now() / 1000), 0);
  } catch {
    return 0;
  }
}

const baseOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function setSession(accessToken: string, refreshToken: string) {
  const store = await cookies();
  store.set(ACCESS_COOKIE, accessToken, {
    ...baseOptions,
    maxAge: secondsUntilExpiry(accessToken) || 60 * 15,
  });
  store.set(REFRESH_COOKIE, refreshToken, {
    ...baseOptions,
    maxAge: REFRESH_MAX_AGE,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

export async function getTokens() {
  const store = await cookies();
  return {
    accessToken: store.get(ACCESS_COOKIE)?.value,
    refreshToken: store.get(REFRESH_COOKIE)?.value,
  };
}

/** Exchange the refresh token for a new pair. The API rotates the old one out. */
export async function refreshSession(): Promise<boolean> {
  const { refreshToken } = await getTokens();
  if (!refreshToken) return false;

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });
  if (!res.ok) {
    await clearSession();
    return false;
  }
  const body = await res.json().catch(() => ({}));
  const payload = body.data ?? body;
  const tokens = payload.token ?? payload;
  if (!tokens?.accessToken || !tokens?.refreshToken) {
    await clearSession();
    return false;
  }
  await setSession(tokens.accessToken, tokens.refreshToken);
  return true;
}

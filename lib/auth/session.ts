import { cookies } from "next/headers";

// Server-only module: never import from a "use client" file.
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

/**
 * Cookie backed session for one role. Admin and customer sessions use
 * different cookie names so both can be signed in on the same browser.
 */
export function createSessionStore(prefix: string) {
  const ACCESS = `${prefix}_access`;
  const REFRESH = `${prefix}_refresh`;
  const USER = `${prefix}_user`;

  async function setSession(
    accessToken: string,
    refreshToken: string,
    user?: { name?: string; email?: string },
  ) {
    const store = await cookies();
    store.set(ACCESS, accessToken, {
      ...baseOptions,
      maxAge: secondsUntilExpiry(accessToken) || 60 * 15,
    });
    store.set(REFRESH, refreshToken, { ...baseOptions, maxAge: REFRESH_MAX_AGE });
    if (user) {
      // Display details only (no secrets), so pages can greet the person.
      store.set(USER, JSON.stringify({ name: user.name, email: user.email }), {
        ...baseOptions,
        maxAge: REFRESH_MAX_AGE,
      });
    }
  }

  async function clearSession() {
    const store = await cookies();
    store.delete(ACCESS);
    store.delete(REFRESH);
    store.delete(USER);
  }

  async function getTokens() {
    const store = await cookies();
    return {
      accessToken: store.get(ACCESS)?.value,
      refreshToken: store.get(REFRESH)?.value,
    };
  }

  async function getUser(): Promise<{ name?: string; email?: string } | null> {
    const raw = (await cookies()).get(USER)?.value;
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /** Exchange the refresh token for a new pair. The API rotates the old one out. */
  async function refreshSession(): Promise<boolean> {
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

  return {
    ACCESS_COOKIE: ACCESS,
    REFRESH_COOKIE: REFRESH,
    setSession,
    clearSession,
    getTokens,
    getUser,
    refreshSession,
  };
}

export const adminSession = createSessionStore("fb_admin");
export const customerSession = createSessionStore("fb_customer");

// Admin exports keep their original names.
export const {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  setSession,
  clearSession,
  getTokens,
  refreshSession,
} = adminSession;

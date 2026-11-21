export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

type Query = Record<string, string | number | boolean | undefined | null>;

function toQuery(query?: Query): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  const text = params.toString();
  return text ? `?${text}` : "";
}

/** Calls the admin BFF proxy and unwraps the API's `{ data }` envelope. */
export async function adminApi<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  options: { query?: Query; body?: unknown } = {},
): Promise<T> {
  const res = await fetch(`/api/admin/proxy/${path}${toQuery(options.query)}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (res.status === 401) {
    // Refresh already failed in the proxy, so the session is over.
    window.location.assign("/admin/login");
    throw new ApiError("Session expired", 401);
  }

  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const message = Array.isArray(json.message) ? json.message.join(", ") : json.message;
    throw new ApiError(message ?? "Request failed", res.status);
  }
  return (json.data ?? json) as T;
}

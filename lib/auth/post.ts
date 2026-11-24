/** POST JSON to one of our route handlers; throws an Error carrying the API message. */
export async function postJson<T = unknown>(url: string, data: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message ?? "Something went wrong");
  return body as T;
}

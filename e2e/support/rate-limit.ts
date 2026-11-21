// The API allows 100 requests per minute per IP. Every login step in the UI
// costs one request, so a full run can exceed that. Page objects call
// `reserveAuthRequest()` before each login step, and this waits when the
// sliding one minute window is nearly full.
const LIMIT = Number(process.env.E2E_AUTH_RATE_LIMIT ?? 90); // stay under the API limit (100 per minute)
const WINDOW_MS = 60_000;
const sent: number[] = [];

export async function reserveAuthRequest(): Promise<void> {
  for (;;) {
    const now = Date.now();
    while (sent.length && now - sent[0] >= WINDOW_MS) sent.shift();
    if (sent.length < LIMIT) {
      sent.push(now);
      return;
    }
    const waitMs = WINDOW_MS - (now - sent[0]) + 250;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }
}

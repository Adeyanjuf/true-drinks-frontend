# E2E automation (Playwright)

Real browser tests against the real Next app and the real API on port 4000.

## Run
1. Start the API and Postgres.
2. Create `.env.e2e` (gitignored) with `E2E_DATABASE_URL`, `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`, `E2E_OTP=123456`.
3. Run specs for a feature (starts its own Next dev server on port 3100):

| Command | Runs |
|---|---|
| `npm run test:e2e` | the latest feature only (named in `e2e/latest-feature.txt`) |
| `npm run test:e2e -- products orders` | the listed feature folders |
| `npm run test:e2e:auth` | the auth scenarios (login, OTP, refresh, forged cookie, sign out) |
| `npm run test:e2e:all` | everything |

Flags pass through, for example `npm run test:e2e -- --grep "delete"`. Also: `npm run test:e2e:ui`, `npm run test:e2e:report`.
Runs in Firefox, headed, by default. Set `E2E_HEADLESS=1` (or CI) for headless, and `E2E_BROWSER=chromium` as a fallback browser.

## When to run what
- Normal work: `npm run test:e2e` (latest feature). The saved admin session is reused, so no login happens.
- Auth code changed: also run `npm run test:e2e:auth`.
- Before merging a feature branch, or when shared code changes (`lib/auth`, `proxy.ts`, `app/api/admin/proxy`, the admin layout, `e2e/fixtures`, `e2e/support`): run `npm run test:e2e:all`.
- At the end of each delivery: add or update that feature's specs and set `e2e/latest-feature.txt` to its folder name.

## Session reuse
`auth.setup.ts` keeps `e2e/.auth/admin.json` (gitignored). On each run it probes the saved session through the app's admin proxy, writes back any renewed cookies (refresh tokens rotate), and only signs in again if the probe fails. Only the `auth` specs sign in on their own.

## Layout
- `pages/` page objects: locators and actions only, no assertions about business rules.
- `fixtures/` extended `test` that hands page objects to specs. Import `test`/`expect` from here.
- `support/` env access and database helpers.
- `tests/<feature>/` specs. Name `*.public.spec.ts` (no session) or `*.admin.spec.ts` (reuses the saved admin session from `auth.setup.ts`).

## How login works in tests
The API emails a hashed OTP, so tests cannot read it. After the API issues a code, `seedKnownOtp` overwrites that user's stored hash in the database with the hash of `123456`. Only the OTP columns of the admin user are touched.

## Rules
- Each delivered feature adds or updates specs here before it is merged.
- Specs that change the session (refresh, logout) sign in themselves; read only specs reuse the saved session.
- The API limits every route to 100 requests per minute per IP, so the suite runs on one worker and `support/rate-limit.ts` paces login steps to stay under it (per worker process; wait a minute between separate runs).

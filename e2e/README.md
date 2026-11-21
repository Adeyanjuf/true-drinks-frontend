# E2E automation (Playwright)

Real browser tests against the real Next app and the real API on port 4000.

## Run
1. Start the API and Postgres.
2. Create `.env.e2e` (gitignored) with `E2E_DATABASE_URL`, `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`, `E2E_OTP=123456`.
3. `npm run test:e2e` (starts its own Next dev server on port 3100).
Runs in Firefox, headed (visible browser) by default; set `E2E_HEADLESS=1` (or CI) to run headless.
Other scripts: `npm run test:e2e:ui`, `npm run test:e2e:report`.

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

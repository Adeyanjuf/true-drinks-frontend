import { defineConfig, devices } from "@playwright/test";

// Local secrets for tests (database URL, admin credentials). Gitignored.
try {
  process.loadEnvFile(".env.e2e");
} catch {
  // Fine in CI where the variables are injected directly.
}

const PORT = Number(process.env.E2E_PORT ?? 3000);
// Firefox is the default browser. E2E_BROWSER=chromium is a fallback (e.g. when the Firefox download is blocked).
const usingChromium = process.env.E2E_BROWSER === "chromium";
const device = usingChromium ? devices["Desktop Chrome"] : devices["Desktop Firefox"];
// Headed Firefox crashes on some Wayland desktops (GNOME settings schema assertion), so run it through X11.
const launchOptions = usingChromium ? {} : { env: { ...process.env, MOZ_ENABLE_WAYLAND: "0" } as Record<string, string> };
const AUTH_FILE = "e2e/.auth/admin.json";

export default defineConfig({
  testDir: "./e2e/tests",
  // The API rate limits login (10 per minute), so keep the suite serial.
  workers: 1,
  // Login pacing may wait for the API rate limit window to reopen.
  timeout: 90_000,
  // Login sends an email through the API, which can take a few seconds.
  expect: { timeout: 15_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    // Headed by default so runs can be watched. Set E2E_HEADLESS=1 for CI.
    headless: process.env.E2E_HEADLESS === "1" || !!process.env.CI,
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: `npm run dev -- -p ${PORT}`,
    url: `http://localhost:${PORT}/admin/login`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "public",
      testMatch: /.*\.public\.spec\.ts/,
      use: { ...device, launchOptions },
    },
    {
      name: "admin",
      testMatch: /.*\.admin\.spec\.ts/,
      dependencies: ["setup"],
      use: { ...device, launchOptions, storageState: AUTH_FILE },
    },
  ],
});

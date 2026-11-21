import { defineConfig, devices } from "@playwright/test";

// Local secrets for tests (database URL, admin credentials). Gitignored.
try {
  process.loadEnvFile(".env.e2e");
} catch {
  // Fine in CI where the variables are injected directly.
}

const PORT = Number(process.env.E2E_PORT ?? 3100);
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
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "admin",
      testMatch: /.*\.admin\.spec\.ts/,
      dependencies: ["setup"],
      use: { ...devices["Desktop Chrome"], storageState: AUTH_FILE },
    },
  ],
});

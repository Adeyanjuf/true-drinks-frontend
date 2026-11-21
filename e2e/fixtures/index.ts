import { test as base } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { DashboardPage } from "../pages/dashboard.page";
import { clearOtp } from "../support/db";
import { env } from "../support/env";

type Fixtures = {
  freshOtpState: void;
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
};

export const test = base.extend<Fixtures>({
  // Runs for every test so the API's 60s code cooldown never leaks between tests.
  freshOtpState: [
    async ({}, use) => {
      clearOtp(env.adminEmail);
      await use();
    },
    { auto: true },
  ],
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  dashboardPage: async ({ page }, use) => use(new DashboardPage(page)),
});

export { expect } from "@playwright/test";

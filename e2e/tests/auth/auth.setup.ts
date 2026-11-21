import { existsSync } from "node:fs";
import { test as setup } from "../../fixtures";

const AUTH_FILE = "e2e/.auth/admin.json";

// Gives every "admin" spec a signed in session. A saved session is reused when
// it still works, so a normal run does not log in (and does not touch OTP rows).
setup("authenticate as admin", async ({ page, loginPage, playwright, baseURL }) => {
  if (existsSync(AUTH_FILE)) {
    const api = await playwright.request.newContext({ baseURL, storageState: AUTH_FILE });
    try {
      // The proxy renews an expired access token with the refresh cookie. Refresh
      // tokens rotate, so the renewed cookies must be written back to the file.
      const probe = await api.get("/api/admin/proxy/admin/orders?limit=1");
      if (probe.ok()) {
        await api.storageState({ path: AUTH_FILE });
        return;
      }
    } finally {
      await api.dispose();
    }
  }

  await loginPage.signInAsAdmin();
  await page.context().storageState({ path: AUTH_FILE });
});

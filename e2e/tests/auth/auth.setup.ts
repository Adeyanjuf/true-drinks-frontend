import { test as setup } from "../../fixtures";

// Signs in once and stores the session for every "admin" project spec.
setup("authenticate as admin", async ({ page, loginPage }) => {
  await loginPage.signInAsAdmin();
  await page.context().storageState({ path: "e2e/.auth/admin.json" });
});

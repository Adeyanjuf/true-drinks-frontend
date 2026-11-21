function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}. Add it to .env.e2e (see e2e/README.md).`);
  return value;
}

export const env = {
  get databaseUrl() {
    return required("E2E_DATABASE_URL");
  },
  get adminEmail() {
    return required("E2E_ADMIN_EMAIL");
  },
  get adminPassword() {
    return required("E2E_ADMIN_PASSWORD");
  },
  get otp() {
    return process.env.E2E_OTP ?? "123456";
  },
};

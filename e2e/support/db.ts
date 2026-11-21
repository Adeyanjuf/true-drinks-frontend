import { execFileSync } from "node:child_process";
import { env } from "./env";

// bcrypt hash (cost 10) of the default test code 123456. The API stores OTPs
// hashed, so tests cannot read the emailed code. Instead, after the API issues
// a code, we overwrite the stored hash with this known one.
const KNOWN_OTP_HASH = "$2b$10$IesnN7EzeMMkoG43xUrMZeQ5FQG0j4BU7RqXGlUEz9wSdFWHFiChW";

if (env.otp !== "123456") {
  throw new Error("E2E_OTP must stay 123456 unless KNOWN_OTP_HASH is regenerated.");
}

function runSql(sql: string, vars: Record<string, string>): void {
  const args = [env.databaseUrl, "-v", "ON_ERROR_STOP=1", "-q", "-f", "-"];
  for (const [key, value] of Object.entries(vars)) args.push("-v", `${key}=${value}`);
  execFileSync("psql", args, { input: sql, stdio: ["pipe", "ignore", "inherit"] });
}

/**
 * The API refuses a new code within 60s of the last one (it checks that the
 * stored expiry is more than 9 minutes away). Clearing the stored code lets
 * every test request a fresh one.
 */
export function clearOtp(email: string): void {
  runSql(`UPDATE "User" SET "otp_hashed" = NULL, "otp_expiresAt" = NULL WHERE "email" = :'email';`, { email });
}

/** Make the next OTP verification for this user accept the known test code. */
export function seedKnownOtp(email: string): void {
  // 8 minutes keeps the code valid while staying under the 9 minute cooldown mark.
  runSql(
    `UPDATE "User" SET "otp_hashed" = :'hash', "otp_expiresAt" = now() + interval '8 minutes' WHERE "email" = :'email';`,
    { hash: KNOWN_OTP_HASH, email },
  );
}

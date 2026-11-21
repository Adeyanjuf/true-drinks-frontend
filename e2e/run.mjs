// Runs the e2e specs for chosen features instead of the whole suite.
//   npm run test:e2e                      latest feature (e2e/latest-feature.txt)
//   npm run test:e2e -- products orders   specific features
//   npm run test:e2e:all                  everything (before merging, or when shared code changed)
// Flags such as --ui or --grep are passed straight to Playwright.
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const testsDir = join(root, "e2e", "tests");
const features = readdirSync(testsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

const args = process.argv.slice(2);
const names = args.filter((a) => !a.startsWith("-"));
const flags = args.filter((a) => a.startsWith("-"));

let selected;
if (names.includes("all")) {
  selected = [];
} else if (names.length > 0) {
  const unknown = names.filter((n) => !features.includes(n));
  if (unknown.length > 0) {
    console.error(`Unknown feature: ${unknown.join(", ")}. Valid features: ${features.join(", ")}, all`);
    process.exit(1);
  }
  selected = names;
} else {
  const latest = readFileSync(join(root, "e2e", "latest-feature.txt"), "utf8").trim();
  if (!features.includes(latest)) {
    console.error(`e2e/latest-feature.txt says "${latest}" but there is no such folder. Valid: ${features.join(", ")}`);
    process.exit(1);
  }
  selected = [latest];
}

console.log(selected.length ? `Running e2e for: ${selected.join(", ")}` : "Running the full e2e suite");
const result = spawnSync(
  "npx",
  ["playwright", "test", ...selected.map((f) => `e2e/tests/${f}/`), ...flags],
  { cwd: root, stdio: "inherit" },
);
process.exit(result.status ?? 1);

import { existsSync, readFileSync } from "node:fs";

const requiredFiles = [
  "src/app/layout.tsx",
  "src/app/page.tsx",
  "src/app/login/page.tsx",
  "src/lib/api/client.ts",
  "src/lib/auth/storage.ts",
  "src/components/SavedSearches.tsx",
];

for (const file of requiredFiles) {
  if (!existsSync(file)) throw new Error(`Missing required production file: ${file}`);
}

const layout = readFileSync("src/app/layout.tsx", "utf8");
const page = readFileSync("src/app/page.tsx", "utf8");
const checks = [
  [layout.includes('lang="en"'), "Root layout must define document language"],
  [layout.includes("AuthNavigationGuard"), "Auth navigation guard must be mounted"],
  [page.includes("/login"), "Authenticated app must retain login redirect handling"],
  [page.includes("SearchView"), "Main search view must be present"],
];

for (const [passed, message] of checks) {
  if (!passed) throw new Error(message);
}

console.log(`Smoke checks passed (${requiredFiles.length} required files, ${checks.length} runtime safeguards).`);

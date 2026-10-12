import { existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const files = [
  ".env.example",
  ".gitignore",
  ".nvmrc",
  ".github/workflows/ci.yml",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "LICENSE",
  "SECURITY.md",
  "README.md",
  "SUPPORT.md",
  "THIRD_PARTY_NOTICES.md",
  "eslint.config.mjs",
  "netlify.toml",
  "next.config.ts",
  "package.json",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  "playwright.config.ts",
  "postcss.config.mjs",
  "tsconfig.json",
  "vitest.config.mts",
  "supabase/config.toml",
  "supabase/seed.sql",
];

const directories = [
  "docs",
  "e2e",
  "public",
  "scripts",
  "src",
  "supabase/demo-files",
  "supabase/migrations",
  "supabase/tests",
];

function walk(dir) {
  const found = [];
  if (!existsSync(dir)) return found;
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next" || name.startsWith(".")) continue;
    const full = join(dir, name);
    const info = statSync(full);
    if (info.isDirectory()) found.push(...walk(full));
    else found.push(full);
  }
  return found;
}

export function posixPath(abs) {
  return relative(root, abs).split(sep).join("/");
}

export function listReleaseFiles() {
  const abs = [];
  for (const file of files) {
    const full = join(root, file);
    if (!existsSync(full)) throw new Error(`Release file missing: ${file}`);
    abs.push(full);
  }
  for (const dir of directories) {
    const full = join(root, dir);
    if (!existsSync(full)) throw new Error(`Release folder missing: ${dir}`);
    abs.push(...walk(full));
  }
  return abs.sort();
}

export const forbiddenInZip = [
  /^\.env(?!\.example$)/,
  /(^|\/)node_modules\//,
  /^\.next\//,
  /^\.git\//,
  /^\.grok\//,
  /^marketing\//,
  /^dist\//,
  /^coverage\//,
  /^test-results\//,
  /^playwright-report\//,
  /^supabase\/\.temp\//,
  /^PROGRESS\.md$/,
  /^DECISIONS\.md$/,
  /^TOOLING\.md$/,
  /^AGENTS\.md$/,
  /^CLAUDE\.md$/,
  /^Agents\.md$/,
  /ClientNest_Complete_Build_and_Sales_Plan\.docx$/,
  /^tmp-/,
];

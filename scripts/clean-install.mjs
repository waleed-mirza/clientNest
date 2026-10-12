/**
 * Unpack the release ZIP into a temp folder and `pnpm install --frozen-lockfile`.
 * Does not start Supabase. Use after `pnpm pack:zip`.
 */
import { mkdtempSync, rmSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { root } from "./release-files.mjs";

const zipArg = process.argv[2];
const distDir = join(root, "dist");
const zipPath =
  zipArg ||
  readdirSync(existsSync(distDir) ? distDir : root)
    .filter((name) => name.startsWith("clientnest-v") && name.endsWith(".zip"))
    .map((name) => join(distDir, name))
    .at(-1);

if (!zipPath || !existsSync(zipPath)) {
  console.error("No ZIP found. Run pnpm pack:zip first, or pass a path.");
  process.exit(1);
}

const dir = mkdtempSync(join(tmpdir(), "clientnest-clean-"));
console.log(`Unpacking ${zipPath} -> ${dir}`);

const unzip = spawnSync(
  "python",
  [
    "-c",
    `
import zipfile, sys
zipfile.ZipFile(sys.argv[1]).extractall(sys.argv[2])
`,
    zipPath,
    dir,
  ],
  { encoding: "utf8", windowsHide: true },
);
if (unzip.status !== 0) {
  process.stderr.write(unzip.stderr || unzip.stdout || "");
  rmSync(dir, { recursive: true, force: true });
  process.exit(unzip.status ?? 1);
}

if (existsSync(join(dir, ".env.local")) || existsSync(join(dir, ".env"))) {
  console.error("ZIP contained an env file. That is a release blocker.");
  rmSync(dir, { recursive: true, force: true });
  process.exit(1);
}

const install = spawnSync("pnpm", ["install", "--frozen-lockfile"], {
  cwd: dir,
  encoding: "utf8",
  shell: true,
  windowsHide: true,
});
process.stdout.write(install.stdout || "");
process.stderr.write(install.stderr || "");
if (install.status !== 0) {
  rmSync(dir, { recursive: true, force: true });
  process.exit(install.status ?? 1);
}

rmSync(dir, { recursive: true, force: true });
console.log("CLEAN_INSTALL_OK");

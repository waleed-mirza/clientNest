/**
 * Restore Harbor Studio rows, then re-upload demo Storage objects.
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    shell: true,
    windowsHide: true,
    stdio: "inherit",
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run("pnpm", ["exec", "supabase", "--yes", "db", "query", "--linked", "-f", "supabase/seed.sql"]);
run("node", ["scripts/seed-files.mjs"]);
console.log("DEMO_RESET_OK");

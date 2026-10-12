/**
 * Run supabase/tests/rls.sql against the linked hosted project.
 * Requires `pnpm supabase login` and a linked project (pnpm supabase:setup).
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const file = join(root, "supabase", "tests", "rls.sql");

const result = spawnSync(
  "pnpm",
  ["exec", "supabase", "--yes", "db", "query", "--linked", "-f", file],
  {
    cwd: root,
    encoding: "utf8",
    shell: true,
    windowsHide: true,
  },
);

const out = `${result.stdout || ""}\n${result.stderr || ""}`;
process.stdout.write(result.stdout || "");
process.stderr.write(result.stderr || "");

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

if (!out.includes("RLS_OK")) {
  console.error("RLS tests ran but did not report RLS_OK.");
  process.exit(1);
}

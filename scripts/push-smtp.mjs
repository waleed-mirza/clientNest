/**
 * Push Auth SMTP (Resend) to the linked hosted project.
 *
 * Do not paste the API key into chat. Provide it as:
 *   RESEND_API_KEY in gitignored .env.local
 *   $env:RESEND_API_KEY='re_...'
 *   or a one-line file at supabase/.temp/resend-api-key
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const keyFile = join(root, "supabase", ".temp", "resend-api-key");
const envLocal = join(root, ".env.local");

function valueFromEnvFile(file, name) {
  if (!existsSync(file)) return "";
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z0-9_]+)\s*=\s*(.*)$/);
    if (!match || match[1] !== name) continue;
    return match[2].trim().replace(/^['"]|['"]$/g, "");
  }
  return "";
}

function readKey() {
  const fromEnv = process.env.RESEND_API_KEY?.trim();
  if (fromEnv) return fromEnv;
  const fromLocal = valueFromEnvFile(envLocal, "RESEND_API_KEY");
  if (fromLocal) return fromLocal;
  if (existsSync(keyFile)) {
    return readFileSync(keyFile, "utf8").trim();
  }
  return "";
}

const key = readKey();
if (!key) {
  console.error(`
Resend API key not found.

In PowerShell (do not paste the key into this chat):

  $env:RESEND_API_KEY='re_your_key'
  pnpm supabase:smtp

Or write the key as a single line to supabase/.temp/resend-api-key (gitignored), then re-run.
`);
  process.exit(2);
}

const result = spawnSync("pnpm", ["exec", "supabase", "--yes", "config", "push"], {
  cwd: root,
  encoding: "utf8",
  env: { ...process.env, RESEND_API_KEY: key },
  shell: true,
  windowsHide: true,
});

process.stdout.write(result.stdout || "");
process.stderr.write(result.stderr || "");
if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log("Pushed Auth SMTP (Resend) to the linked project.");
console.log(
  "Until you verify a domain in Resend, From is onboarding@resend.dev and mail only delivers to your Resend account email.",
);

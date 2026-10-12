/**
 * Upload Harbor demo files to the private project-files bucket.
 * Metadata lives in supabase/seed.sql; Storage blobs cannot be inserted from SQL.
 *
 * Requires `pnpm supabase login` and a linked project. Uses the service role in
 * memory only — it is not written to .env.local.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const workspaceId = "11111111-aaaa-4111-8111-aaaaaaaaaaaa";
const projectId = "11111111-eeee-4111-8111-eeeeeeeeeee1";
const files = [
  {
    id: "81111111-aaaa-4111-8111-aaaaaaaaaaa1",
    name: "Homepage-hero-v3.png",
    mime: "image/png",
  },
  {
    id: "81111111-aaaa-4111-8111-aaaaaaaaaaa2",
    name: "Menu-board.pdf",
    mime: "application/pdf",
  },
  {
    id: "81111111-aaaa-4111-8111-aaaaaaaaaaa3",
    name: "Brand-tokens.txt",
    mime: "text/plain",
  },
];

function supabase(args) {
  const result = spawnSync("pnpm", ["exec", "supabase", "--yes", ...args], {
    cwd: root,
    encoding: "utf8",
    shell: true,
    windowsHide: true,
  });
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || `supabase ${args.join(" ")} failed`).trim());
  }
  const out = (result.stdout || "").trim();
  try {
    return JSON.parse(out);
  } catch {
    return out;
  }
}

function asList(value) {
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value.list)) return value.list;
  if (value && typeof value === "object") return [value];
  return [];
}

function envUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (fromEnv) return fromEnv;
  const envFile = join(root, ".env.local");
  if (!existsSync(envFile)) return "";
  for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const match = line.trim().match(/^NEXT_PUBLIC_SUPABASE_URL\s*=\s*(.*)$/);
    if (match) return match[1].trim().replace(/^['"]|['"]$/g, "");
  }
  return "";
}

function pickKey(keys, names) {
  for (const name of names) {
    const row = asList(keys).find((item) => {
      const n = String(item.name ?? item.id ?? item.type ?? "").toLowerCase();
      return n === name || n.includes(name);
    });
    const key = row?.api_key ?? row?.apiKey ?? row?.key;
    if (key) return String(key);
  }
  return "";
}

const url = envUrl();
if (!url) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL in .env.local. Run pnpm supabase:setup.");
  process.exit(1);
}
const ref = new URL(url).hostname.split(".")[0];
let keys;
try {
  keys = supabase(["projects", "api-keys", "--project-ref", ref, "-o", "json"]);
} catch (error) {
  console.error(String(error.message || error));
  process.exit(1);
}
const service =
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || pickKey(keys, ["service_role", "secret"]);
if (!service) {
  console.error("Could not read the service role key. Log in with pnpm supabase login.");
  process.exit(1);
}

for (const file of files) {
  const disk = join(root, "supabase", "demo-files", file.name);
  const body = readFileSync(disk);
  const path = `${workspaceId}/${projectId}/${file.id}`;
  const endpoint = `${url}/storage/v1/object/project-files/${path}`;
  const put = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${service}`,
      apikey: service,
      "Content-Type": file.mime,
      "x-upsert": "true",
    },
    body,
  });
  if (!put.ok) {
    const text = await put.text();
    console.error(`Upload failed for ${file.name}: ${put.status} ${text}`);
    process.exit(1);
  }
  console.log(`uploaded ${file.name}`);
}

console.log("DEMO_FILES_OK");

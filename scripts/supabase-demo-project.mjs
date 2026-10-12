/**
 * Create (or reuse) a hosted Supabase project for the public listing demo.
 *
 * Does not write .env.local. Relinks the repo to the previous project when done.
 * Writes URL + anon key to supabase/.temp/netlify-demo.env (gitignored).
 *
 * Requires: `pnpm supabase login`
 * Optional: SUPABASE_ORG_ID, SUPABASE_REGION, SUPABASE_DEMO_DB_PASSWORD
 */
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tempDir = join(root, "supabase", ".temp");
const passwordFile = join(tempDir, "demo-db-password");
const envOut = join(tempDir, "netlify-demo.env");
const projectName = "clientnest-demo";
const region = process.env.SUPABASE_REGION?.trim() || "ap-southeast-1";

function supabase(args, { json = true, env = {} } = {}) {
  const result = spawnSync("pnpm", ["exec", "supabase", "--yes", ...args], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, ...env },
    shell: true,
    windowsHide: true,
  });
  if (result.status !== 0) {
    const err = (result.stderr || result.stdout || "").trim();
    const error = new Error(err || `supabase ${args.join(" ")} failed`);
    error.stdout = result.stdout;
    error.stderr = result.stderr;
    throw error;
  }
  const out = (result.stdout || "").trim();
  if (!json) return out;
  if (!out) return null;
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

function pickKey(keys, names) {
  const list = asList(keys);
  for (const name of names) {
    const row = list.find((item) => {
      const n = String(item.name ?? item.id ?? item.type ?? "").toLowerCase();
      return n === name || n.includes(name);
    });
    const key = row?.api_key ?? row?.apiKey ?? row?.key;
    if (key) return String(key);
  }
  return "";
}

function projectRef(project) {
  return String(project.id ?? project.ref ?? "");
}

function readPassword() {
  return (
    process.env.SUPABASE_DEMO_DB_PASSWORD?.trim() ||
    (existsSync(passwordFile) ? readFileSync(passwordFile, "utf8").trim() : "")
  );
}

function savePassword(password) {
  mkdirSync(tempDir, { recursive: true });
  writeFileSync(passwordFile, password, { encoding: "utf8" });
}

function currentLink() {
  const refFile = join(tempDir, "project-ref");
  const passFile = join(tempDir, "db-password");
  return {
    ref: existsSync(refFile) ? readFileSync(refFile, "utf8").trim() : "",
    password: existsSync(passFile) ? readFileSync(passFile, "utf8").trim() : "",
  };
}

function findDemo(projects) {
  const ref = process.env.SUPABASE_PROJECT_REF?.trim();
  const list = asList(projects);
  if (ref) {
    const match = list.find((p) => p.id === ref || p.ref === ref);
    if (!match) throw new Error(`No project with ref ${ref}.`);
    return match;
  }
  return (
    list.find((p) => {
      const n = String(p.name ?? "")
        .toLowerCase()
        .replace(/\s+/g, "-");
      return n === projectName;
    }) ?? null
  );
}

async function waitHealthy(ref) {
  for (let i = 0; i < 36; i += 1) {
    const latest = findDemo(supabase(["projects", "list", "-o", "json"]));
    const status = String(latest?.status ?? "").toUpperCase();
    if (["ACTIVE", "ACTIVE_HEALTHY"].includes(status) && projectRef(latest) === ref) {
      return latest;
    }
    console.log(`Project status ${status || "unknown"}; waiting…`);
    await delay(10_000);
  }
  throw new Error("Demo project did not become healthy in time.");
}

function relink(ref, password) {
  if (!ref) return;
  const args = ["link", "--project-ref", ref];
  if (password) args.push("--password", password);
  supabase(args, { json: false });
}

async function main() {
  const previous = currentLink();
  let projects;
  try {
    projects = supabase(["projects", "list", "-o", "json"]);
  } catch (error) {
    const msg = String(error.message || error);
    if (/not logged in|access token|unauthorized|401/i.test(msg)) {
      console.error("Supabase CLI is not logged in. Run `pnpm supabase login` in your terminal.");
      process.exit(2);
    }
    throw error;
  }

  const orgs = asList(supabase(["orgs", "list", "-o", "json"]));
  if (orgs.length === 0) {
    console.error("No organizations. Create one at https://supabase.com/dashboard");
    process.exit(1);
  }
  const orgId = process.env.SUPABASE_ORG_ID?.trim() || orgs[0].id;

  let project = findDemo(projects);
  if (!project) {
    const password = randomBytes(24).toString("base64url");
    savePassword(password);
    console.log(`Creating hosted project ${projectName} in ${orgId} (${region})…`);
    try {
      project = supabase([
        "projects",
        "create",
        projectName,
        "--org-id",
        orgId,
        "--region",
        region,
        "--db-password",
        password,
        "-o",
        "json",
      ]);
    } catch (error) {
      console.error(String(error.message || error));
      console.error(`
Could not create ${projectName}. Free orgs usually allow two active projects.
This account already has clientnest-dev plus any other projects.
Pause or delete an unused project in the dashboard, then re-run: pnpm supabase:demo
`);
      process.exit(1);
    }
  }

  const ref = projectRef(project);
  if (!ref) throw new Error("Could not read demo project ref.");
  console.log(`Using project ${project.name ?? projectName} (${ref}).`);

  project = await waitHealthy(ref);

  const dbPassword = readPassword();
  if (!dbPassword) {
    console.error(
      "Need the demo database password. Set SUPABASE_DEMO_DB_PASSWORD or supabase/.temp/demo-db-password.",
    );
    process.exit(1);
  }

  try {
    relink(ref, dbPassword);
    console.log("Linked to demo project. Pushing migrations…");
    supabase(["db", "push", "--linked"], {
      json: false,
      env: { SUPABASE_DB_PASSWORD: dbPassword },
    });
    console.log("Seeding Harbor Studio…");
    supabase(["db", "query", "--linked", "-f", "supabase/seed.sql"], { json: false });

    const url = `https://${ref}.supabase.co`;
    const files = spawnSync("node", ["scripts/seed-files.mjs"], {
      cwd: root,
      encoding: "utf8",
      shell: true,
      windowsHide: true,
      env: { ...process.env, NEXT_PUBLIC_SUPABASE_URL: url },
    });
    process.stdout.write(files.stdout || "");
    process.stderr.write(files.stderr || "");
    if (files.status !== 0) process.exit(files.status ?? 1);

    const keys = supabase(["projects", "api-keys", "--project-ref", ref, "-o", "json"]);
    const anon = pickKey(keys, ["anon", "publishable"]);
    if (!anon) throw new Error("Could not read the anon/publishable API key.");

    mkdirSync(tempDir, { recursive: true });
    writeFileSync(
      envOut,
      `# Paste into Netlify → Environment variables (Production). Do not commit.
NEXT_PUBLIC_SUPABASE_URL=${url}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${anon}
DEMO_MODE=true
NEXT_PUBLIC_DEMO_MODE=true
`,
      { encoding: "utf8" },
    );
    console.log(`Wrote ${envOut}`);
    console.log(`DEMO_PROJECT_OK ${ref}`);
    console.log(`NEXT_PUBLIC_SUPABASE_URL=${url}`);
  } finally {
    if (previous.ref && previous.ref !== ref) {
      console.log(`Relinking local CLI to ${previous.ref}…`);
      relink(previous.ref, previous.password);
    }
  }
}

await main();

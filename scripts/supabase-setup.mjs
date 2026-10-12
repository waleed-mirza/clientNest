/**
 * Hosted Supabase setup without Docker.
 *
 * Requires: `pnpm supabase login` (once, in your own terminal).
 * Then: `pnpm supabase:setup`
 *
 * Optional env:
 *   SUPABASE_PROJECT_REF  use this project instead of creating one
 *   SUPABASE_ORG_ID       org for a new project
 *   SUPABASE_REGION       default us-east-1
 *   SUPABASE_DB_PASSWORD  required to push migrations on an existing project
 */
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tempDir = join(root, "supabase", ".temp");
const passwordFile = join(tempDir, "db-password");
const envFile = join(root, ".env.local");
const projectName = "clientnest-dev";
const region = process.env.SUPABASE_REGION?.trim() || "us-east-1";

function supabase(args, { json = true, env = {}, input } = {}) {
  const result = spawnSync("pnpm", ["exec", "supabase", "--yes", ...args], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, ...env },
    input,
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

function failLogin() {
  console.error(`
Supabase CLI is not logged in.

In your own terminal (this opens a browser):

  pnpm supabase login

Approve access, then tell me you're logged in and I'll finish setup
(or re-run: pnpm supabase:setup).
`);
  process.exit(2);
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

function readSavedPassword() {
  return (
    process.env.SUPABASE_DB_PASSWORD?.trim() ||
    (existsSync(passwordFile) ? readFileSync(passwordFile, "utf8").trim() : "")
  );
}

function savePassword(password) {
  mkdirSync(tempDir, { recursive: true });
  writeFileSync(passwordFile, password, { encoding: "utf8" });
}

async function wait(ms) {
  await delay(ms);
}

function findProject(projects, ref) {
  const list = asList(projects);
  if (ref) {
    const match = list.find((p) => p.id === ref || p.ref === ref);
    if (!match) {
      throw new Error(
        `No project with ref ${ref}. Create it in the dashboard or unset SUPABASE_PROJECT_REF.`,
      );
    }
    return match;
  }
  const named = list.find((p) => {
    const n = String(p.name ?? "")
      .toLowerCase()
      .replace(/\s+/g, "-");
    return n === projectName || n === "clientnest";
  });
  if (named) return named;
  return null;
}

function projectRef(project) {
  return String(project.id ?? project.ref ?? "");
}

async function main() {
  let projects;
  try {
    projects = supabase(["projects", "list", "-o", "json"]);
  } catch (error) {
    const msg = String(error.message || error);
    if (/not logged in|access token|unauthorized|401/i.test(msg)) failLogin();
    throw error;
  }

  const orgs = asList(supabase(["orgs", "list", "-o", "json"]));
  if (orgs.length === 0) {
    console.error(
      "Your account has no organizations. Create one at https://supabase.com/dashboard then re-run.",
    );
    process.exit(1);
  }

  const orgId = process.env.SUPABASE_ORG_ID?.trim() || orgs[0].id;
  let project = findProject(projects, process.env.SUPABASE_PROJECT_REF?.trim());

  if (!project) {
    const password = randomBytes(24).toString("base64url");
    savePassword(password);
    console.log(`Creating hosted project ${projectName} in ${orgId} (${region})…`);
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
  }

  const ref = projectRef(project);
  if (!ref) throw new Error("Could not read project ref from CLI output.");
  console.log(`Using project ${project.name ?? projectName} (${ref}).`);

  let status = String(project.status ?? "ACTIVE").toUpperCase();
  for (let i = 0; i < 24 && !["ACTIVE", "ACTIVE_HEALTHY"].includes(status); i += 1) {
    console.log(`Project status ${status}; waiting…`);
    await wait(10_000);
    const latest = findProject(supabase(["projects", "list", "-o", "json"]), ref);
    status = String(latest?.status ?? "ACTIVE").toUpperCase();
  }

  const dbPassword = readSavedPassword();
  const linkArgs = ["link", "--project-ref", ref];
  if (dbPassword) linkArgs.push("--password", dbPassword);
  supabase(linkArgs, { json: false });
  console.log("Linked local repo to hosted project.");

  if (!dbPassword) {
    console.error(`
Linked, but migrations need the database password.

1. Dashboard → Project Settings → Database → Database password (reset if you don't have it)
2. PowerShell:
     $env:SUPABASE_DB_PASSWORD='the-password'
     pnpm supabase:setup
`);
    process.exit(1);
  }

  console.log("Pushing migrations…");
  supabase(["db", "push", "--linked"], { json: false, env: { SUPABASE_DB_PASSWORD: dbPassword } });

  try {
    const resendFile = join(tempDir, "resend-api-key");
    let resendKey = process.env.RESEND_API_KEY?.trim() || "";
    if (!resendKey && existsSync(envFile)) {
      for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
        const match = line.trim().match(/^RESEND_API_KEY\s*=\s*(.*)$/);
        if (match) {
          resendKey = match[1].trim().replace(/^['"]|['"]$/g, "");
          break;
        }
      }
    }
    if (!resendKey && existsSync(resendFile)) {
      resendKey = readFileSync(resendFile, "utf8").trim();
    }
    supabase(["config", "push"], {
      json: false,
      env: resendKey ? { RESEND_API_KEY: resendKey } : {},
    });
    console.log(
      resendKey
        ? "Pushed auth URL + Resend SMTP config."
        : "Pushed auth URL config (localhost:3000). Set RESEND_API_KEY and run pnpm supabase:smtp for mail.",
    );
  } catch (error) {
    console.warn("Config push skipped:", error.message.split("\n")[0]);
  }

  const keys = supabase(["projects", "api-keys", "--project-ref", ref, "-o", "json"]);
  const anon = pickKey(keys, ["anon", "publishable"]);
  if (!anon) throw new Error("Could not read the anon/publishable API key.");

  const envBody = `# Generated by pnpm supabase:setup. Do not commit.
NEXT_PUBLIC_SUPABASE_URL=https://${ref}.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=${anon}
`;
  writeFileSync(envFile, envBody, { encoding: "utf8" });
  console.log("Wrote .env.local (URL + anon key only).");

  console.log(`
Done. Start the app with:

  pnpm dev

Open http://localhost:3000/signup
`);
}

await main();

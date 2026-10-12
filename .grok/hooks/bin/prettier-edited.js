const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function allow() {
  process.stdout.write(JSON.stringify({ decision: "allow" }));
  process.exit(0);
}

let raw = "";
try {
  raw = fs.readFileSync(0, "utf8");
} catch {
  allow();
}

let event;
try {
  event = JSON.parse(raw || "{}");
} catch {
  allow();
}

const input = event.toolInput || {};
const filePath = String(input.path || input.file_path || input.target_file || "");
if (!/\.(ts|tsx|js|mjs|css|md|json|yml|yaml)$/i.test(filePath)) allow();
if (!fs.existsSync(filePath)) allow();

const root = process.env.GROK_WORKSPACE_ROOT || process.cwd();
spawnSync("pnpm", ["exec", "prettier", "--write", path.resolve(filePath)], {
  cwd: root,
  stdio: "ignore",
  shell: true,
  windowsHide: true,
});

allow();

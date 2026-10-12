const fs = require("fs");
const path = require("path");

const root = process.env.GROK_WORKSPACE_ROOT || process.cwd();
const progressPath = path.join(root, "PROGRESS.md");

function warn(message) {
  process.stderr.write(`[clientnest] ${message}\n`);
}

if (!fs.existsSync(progressPath)) {
  warn("PROGRESS.md missing — create it before doing product work.");
  process.exit(0);
}

const text = fs.readFileSync(progressPath, "utf8");
const table = text.match(
  /## Current status[\s\S]*?\n\| Field \| Value \|\n\|[-| ]+\|\n((?:\|.*\|\n)+)/,
);

if (!table) {
  warn("Could not parse Current status from PROGRESS.md.");
  process.exit(0);
}

const rows = {};
for (const line of table[1].trim().split("\n")) {
  const cells = line.split("|").map((cell) => cell.trim());
  if (cells.length >= 3) rows[cells[1]] = cells[2];
}

warn(`Week: ${rows["Plan week"] || "unknown"} | Phase: ${rows["Phase"] || "unknown"}`);
warn(`Allowed: ${rows["Allowed product work"] || "see PROGRESS.md"}`);
warn("Read PROGRESS.md before working. Update it when you finish.");
process.exit(0);

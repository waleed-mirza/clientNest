const fs = require("fs");

function allow() {
  process.stdout.write(JSON.stringify({ decision: "allow" }));
  process.exit(0);
}

function deny(reason) {
  process.stdout.write(JSON.stringify({ decision: "deny", reason }));
  process.exit(2);
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
const haystack = JSON.stringify(input);
const filePath = String(input.path || input.file_path || input.target_file || "");
const command = String(input.command || "");
const combined = `${filePath}\n${command}\n${haystack}`;

const envFile = /(?:^|[\\/])\.env(?:\..+)?$/i.test(filePath.replace(/\\/g, "/"));
const envExample = /\.env\.example$/i.test(filePath.replace(/\\/g, "/"));

if (envFile && !envExample) {
  deny("Refusing to write a real .env file. Change .env.example and keep secrets out of git.");
}

if (
  /\bgit\b/.test(command) &&
  /\badd\b|\bcommit\b/.test(command) &&
  /\.env\b/.test(command) &&
  !/\.env\.example\b/.test(command)
) {
  deny("Refusing to git-add a .env file. Use .env.example only.");
}

const secretAssignment =
  /(?:SERVICE_ROLE|SUPABASE_SERVICE_ROLE|SECRET_KEY|PRIVATE_KEY|OPENAI_API_KEY|STRIPE_SECRET)['"\s:=]+[A-Za-z0-9_/+-]{16,}/i;

if (secretAssignment.test(combined) && !/\.env\.example/.test(filePath)) {
  deny(
    "Refusing to write a live-looking secret. Use env placeholders such as YOUR_SERVICE_ROLE_KEY.",
  );
}

allow();

import { readFileSync } from "node:fs";
import { forbiddenInZip, listReleaseFiles, posixPath } from "./release-files.mjs";

const binary = /\.(png|jpg|jpeg|gif|webp|pdf|ico|woff2?)$/i;

const patterns = [
  { name: "private-key", re: /BEGIN [A-Z ]*PRIVATE KEY/ },
  { name: "stripe-live", re: /sk_live_[A-Za-z0-9]{16,}/ },
  { name: "resend-key", re: /\bre_[A-Za-z0-9]{20,}\b/ },
  { name: "service-role-env", re: /SUPABASE_SERVICE_ROLE_KEY[ \t]*=[ \t]*\S+/ },
];

function jwtRole(token) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const json = Buffer.from(parts[1], "base64url").toString("utf8");
    const payload = JSON.parse(json);
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

const files = listReleaseFiles();
const hits = [];

for (const file of files) {
  const rel = posixPath(file);
  if (forbiddenInZip.some((re) => re.test(rel))) {
    hits.push(`${rel}: file is not allowed in the buyer ZIP`);
    continue;
  }
  if (binary.test(rel)) continue;
  const text = readFileSync(file, "utf8");
  for (const pattern of patterns) {
    if (pattern.re.test(text)) hits.push(`${rel}: ${pattern.name}`);
  }
  const jwt = text.match(/eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g) ?? [];
  for (const token of jwt) {
    if (jwtRole(token) === "service_role") hits.push(`${rel}: service_role JWT`);
  }
}

if (hits.length > 0) {
  console.error("Secret scan failed:\n" + hits.map((hit) => `  ${hit}`).join("\n"));
  process.exit(1);
}

console.log(`SECRET_SCAN_OK ${files.length} files`);

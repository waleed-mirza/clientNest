import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { listReleaseFiles, posixPath, root } from "./release-files.mjs";

const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const version = pkg.version;
const distDir = join(root, "dist");
const zipName = `clientnest-v${version}.zip`;
const zipPath = join(distDir, zipName);
const staging = join(distDir, "staging");

mkdirSync(distDir, { recursive: true });
rmSync(staging, { recursive: true, force: true });
mkdirSync(staging, { recursive: true });

const files = listReleaseFiles();
const manifest = [];

for (const file of files) {
  const rel = posixPath(file);
  const dest = join(staging, rel);
  mkdirSync(join(dest, ".."), { recursive: true });
  writeFileSync(dest, readFileSync(file));
  manifest.push(rel);
}

rmSync(zipPath, { force: true });

const py = `
import zipfile, os, sys
staging, zip_path = sys.argv[1], sys.argv[2]
with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
    for root, dirs, files in os.walk(staging):
        for name in files:
            full = os.path.join(root, name)
            arc = os.path.relpath(full, staging).replace("\\\\", "/")
            z.write(full, arc)
print(zip_path)
`;

const result = spawnSync("python", ["-c", py, staging, zipPath], {
  cwd: root,
  encoding: "utf8",
  windowsHide: true,
});
if (result.status !== 0) {
  process.stderr.write(result.stderr || result.stdout || "zip failed\n");
  process.exit(result.status ?? 1);
}

rmSync(staging, { recursive: true, force: true });
console.log(`PACKED ${zipName} (${manifest.length} files)`);
console.log(zipPath);

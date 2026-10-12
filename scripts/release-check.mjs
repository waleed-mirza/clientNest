import { spawnSync } from "node:child_process";
import { root } from "./release-files.mjs";

function run(script) {
  const result = spawnSync("node", [script], {
    cwd: root,
    encoding: "utf8",
    windowsHide: true,
    stdio: "inherit",
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run("scripts/secret-scan.mjs");
run("scripts/pack-zip.mjs");
run("scripts/clean-install.mjs");
console.log("RELEASE_OK");

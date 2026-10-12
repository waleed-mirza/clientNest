import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DocsShell } from "@/components/marketing/docs-shell";
import { Markdown } from "@/lib/docs/markdown";

export const metadata = { title: "License" };

export default function LicensePage() {
  const body = readFileSync(join(process.cwd(), "LICENSE"), "utf8");
  return (
    <DocsShell title="License">
      <Markdown source={body} />
    </DocsShell>
  );
}

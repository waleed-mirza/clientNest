import { readFileSync } from "node:fs";
import { join } from "node:path";
import { docs, isDocSlug, type DocSlug } from "@/lib/docs/catalog";

export type DocPage = {
  slug: DocSlug;
  title: string;
  summary: string;
  body: string;
};

export function docsDirectory(): string {
  return join(process.cwd(), "docs");
}

export function readDoc(slug: string): DocPage | null {
  if (!isDocSlug(slug)) return null;
  const meta = docs.find((doc) => doc.slug === slug);
  if (!meta) return null;
  const body = readFileSync(join(docsDirectory(), `${slug}.md`), "utf8");
  return { ...meta, body };
}

export function listDocs(): DocPage[] {
  return docs.map((doc) => {
    const page = readDoc(doc.slug);
    if (!page) throw new Error(`Missing docs/${doc.slug}.md`);
    return page;
  });
}

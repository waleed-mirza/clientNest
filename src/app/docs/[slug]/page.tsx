import { notFound } from "next/navigation";
import { DocsShell } from "@/components/marketing/docs-shell";
import { docs, isDocSlug } from "@/lib/docs/catalog";
import { Markdown } from "@/lib/docs/markdown";
import { readDoc } from "@/lib/docs/read";

export const dynamic = "force-static";

export function generateStaticParams() {
  return docs.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = isDocSlug(slug) ? readDoc(slug) : null;
  if (!doc) return { title: "Documentation" };
  return { title: doc.title, description: doc.summary };
}

export default async function DocSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = readDoc(slug);
  if (!doc) notFound();
  return (
    <DocsShell title={doc.title}>
      <Markdown source={doc.body} />
    </DocsShell>
  );
}

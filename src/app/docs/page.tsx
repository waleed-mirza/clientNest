import Link from "next/link";
import { DocsShell } from "@/components/marketing/docs-shell";
import { docs } from "@/lib/docs/catalog";

export const metadata = { title: "Documentation" };

export default function DocsIndexPage() {
  return (
    <DocsShell title="Documentation">
      <h1 className="font-serif text-4xl font-semibold text-balance">Install without a call</h1>
      <p className="mt-4 max-w-2xl text-muted text-pretty">
        Quick Start is 15 numbered steps on Node 24 and hosted Supabase. Docker is not required. If
        a technically capable developer still needs live help, the docs are not done.
      </p>
      <ul className="mt-10 grid gap-0 divide-y divide-border bg-surface">
        {docs.map((doc) => (
          <li key={doc.slug}>
            <Link
              href={`/docs/${doc.slug}`}
              className="flex flex-col gap-1 px-4 py-4 hover:bg-background"
            >
              <span className="font-medium">{doc.title}</span>
              <span className="text-sm text-muted">{doc.summary}</span>
            </Link>
          </li>
        ))}
        <li>
          <Link href="/license" className="flex flex-col gap-1 px-4 py-4 hover:bg-background">
            <span className="font-medium">License</span>
            <span className="text-sm text-muted">
              MIT. Use, modify, and redistribute, including for client work.
            </span>
          </Link>
        </li>
      </ul>
    </DocsShell>
  );
}

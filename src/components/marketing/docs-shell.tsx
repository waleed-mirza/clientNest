import type { ReactNode } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/marketing/site-header";
import { ColorSchemeToggle } from "@/components/theme/color-scheme-toggle";
import { docs } from "@/lib/docs/catalog";

export function DocsShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-12 lg:flex-row">
        <nav aria-label="Documentation" className="w-full shrink-0 lg:w-56">
          <p className="text-sm font-medium">Docs</p>
          <ul className="mt-3 grid gap-2 text-sm">
            <li>
              <Link
                href="/docs"
                className="text-muted transition-colors duration-150 hover:text-foreground"
              >
                All guides
              </Link>
            </li>
            {docs.map((doc) => (
              <li key={doc.slug}>
                <Link
                  href={`/docs/${doc.slug}`}
                  className="text-muted transition-colors duration-150 hover:text-foreground"
                >
                  {doc.title}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/license"
                className="text-muted transition-colors duration-150 hover:text-foreground"
              >
                License
              </Link>
            </li>
          </ul>
        </nav>
        <main className="min-w-0 flex-1">
          <p className="text-sm font-medium text-accent">{title}</p>
          <div className="mt-4">{children}</div>
        </main>
      </div>
      <footer className="border-t border-border px-4 py-6 text-center text-sm text-muted">
        <div className="mb-3 flex justify-center sm:hidden">
          <ColorSchemeToggle compact />
        </div>
        ClientNest v1.0 · MIT License
      </footer>
    </div>
  );
}

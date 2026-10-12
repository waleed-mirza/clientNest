import Link from "next/link";

const packageEntries = [
  { path: "src/", kind: "dir", detail: "Next.js app, components, and feature code" },
  { path: "supabase/", kind: "dir", detail: "migrations, RLS tests, seed, and demo files" },
  { path: "docs/", kind: "dir", detail: "Quick Start, environment, deploy, troubleshooting" },
  { path: "e2e/", kind: "dir", detail: "Playwright product journeys" },
  { path: "LICENSE", kind: "file", detail: "MIT — use, modify, and redistribute" },
  { path: "SUPPORT.md", kind: "file", detail: "docs first, then GitHub issues" },
  { path: "CHANGELOG.md", kind: "file", detail: "what changed in this version" },
  { path: ".env.example", kind: "file", detail: "public variable names only — no secrets" },
];

const quickStartPeek = [
  "Clone the repository and open that folder.",
  "Use Node 24 LTS (`nvm use`) and pnpm 10.",
  "pnpm install",
  "pnpm supabase login, then pnpm supabase:setup",
  "pnpm dev — then create the first owner at /signup",
];

export function BuyerProof() {
  return (
    <section id="source" className="scroll-mt-8">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div>
          <p className="text-sm font-medium text-accent">Source you host yourself</p>
          <h2 className="mt-3 text-2xl font-medium">Open the folder. Make it your portal.</h2>
          <p className="mt-3 max-w-2xl text-muted">
            ClientNest is a source-code kit you clone, customize, and host. This is the top of the
            repository.
          </p>
          <figure className="mt-6 overflow-hidden border border-border bg-surface">
            <figcaption className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3 text-sm">
              <span className="font-medium">Package contents</span>
              <code className="font-mono text-muted">clientnest</code>
            </figcaption>
            <ul className="divide-y divide-border font-mono text-sm">
              {packageEntries.map((entry) => (
                <li
                  key={entry.path}
                  className="grid gap-1 px-4 py-3 sm:grid-cols-[3.5rem_11rem_1fr] sm:items-baseline sm:gap-4"
                >
                  <span className="font-sans text-xs uppercase tracking-normal text-muted">
                    {entry.kind}
                  </span>
                  <span className="text-foreground">{entry.path}</span>
                  <span className="font-sans text-muted">{entry.detail}</span>
                </li>
              ))}
            </ul>
          </figure>
          <p className="mt-3 text-sm text-muted">
            The repository excludes `.env` values and demo-project secrets.
          </p>
        </div>

        <div className="grid gap-8">
          <figure className="border border-border bg-surface">
            <figcaption className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3 text-sm">
              <span className="font-medium">Setup-guide peek</span>
              <code className="font-mono text-muted">docs/quick-start.md</code>
            </figcaption>
            <ol className="divide-y divide-border text-sm">
              {quickStartPeek.map((step, index) => (
                <li key={step} className="grid grid-cols-[2rem_1fr] gap-3 px-4 py-3">
                  <span className="font-mono text-accent">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-muted">{step}</span>
                </li>
              ))}
            </ol>
            <p className="border-t border-border px-4 py-3 text-sm text-muted">
              Fifteen numbered steps in all.{" "}
              <Link
                href="/docs/quick-start"
                className="text-accent underline-offset-2 hover:underline"
              >
                Read Quick Start
              </Link>
              .
            </p>
          </figure>

          <dl className="divide-y divide-border border-y border-border text-sm">
            <div className="grid gap-2 py-4 sm:grid-cols-[9rem_1fr] sm:gap-4">
              <dt className="font-medium">License rights</dt>
              <dd className="text-muted">
                MIT. Use, modify, and redistribute the source, including for client work. Keep the
                copyright notice.{" "}
                <Link href="/license" className="text-accent underline-offset-2 hover:underline">
                  Read the license
                </Link>
                .
              </dd>
            </div>
            <div className="grid gap-2 py-4 sm:grid-cols-[9rem_1fr] sm:gap-4">
              <dt className="font-medium">Hosting needs</dt>
              <dd className="text-muted">
                You provide Node 24, a hosted Supabase project, and a host such as Netlify, Vercel,
                or your own Node server. Your hosting and Supabase bills stay in your account.
              </dd>
            </div>
            <div className="grid gap-2 py-4 sm:grid-cols-[9rem_1fr] sm:gap-4">
              <dt className="font-medium">Support scope</dt>
              <dd className="text-muted">
                Start with the docs. Install questions go to GitHub issues. Security defects use
                private vulnerability reporting. Hosting and custom builds stay yours.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

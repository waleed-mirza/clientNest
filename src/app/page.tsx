import Link from "next/link";
import { SiteHeader } from "@/components/marketing/site-header";
import { BuyerProof } from "@/components/marketing/buyer-proof";
import { ColorSchemeToggle } from "@/components/theme/color-scheme-toggle";
import { primaryButtonClass, secondaryButtonClass } from "@/components/app/styles";
import { isDemoMode } from "@/lib/demo/mode";
import { sourceRepoUrl } from "@/lib/repo";
import { publicDemoUrl } from "@/lib/storefront";

const included = [
  "Email login, invites, and role-secured client access",
  "Clients, projects, milestones, and tasks",
  "Secure file delivery",
  "Deliverable review and approval",
  "Invoices you can print (no online payments in v1)",
  "Install, customize, and deploy documentation",
];

const walkthrough = [
  {
    step: "01",
    title: "Start with the owner dashboard",
    description: "See the work that needs a decision without a wall of generic KPI tiles.",
    href: "/mockups/dashboard",
    link: "Open the dashboard mockup",
  },
  {
    step: "02",
    title: "Follow one project",
    description: "Review milestones, tasks, shared files, and the boundary around team-only work.",
    href: "/mockups/project",
    link: "Open the project mockup",
  },
  {
    step: "03",
    title: "See the client decision",
    description:
      "Read the deliverable thread, then see how an approval becomes an immutable record.",
    href: "/mockups/approval",
    link: "Open the approval mockup",
  },
];

const faq = [
  {
    q: "Do I need Docker?",
    a: "No. The app uses a hosted Supabase project. pnpm supabase:setup links it and pushes migrations.",
  },
  {
    q: "Can clients pay invoices in the portal?",
    a: "Not in v1. Invoices are records plus a print layout. Paid means you marked them paid off-platform.",
  },
  {
    q: "Can I use this for client work?",
    a: "Yes. The MIT license lets you use and modify it for client work, and redistribute it, including as a template. Keep the copyright notice.",
  },
  {
    q: "What does Supabase cost?",
    a: "The free tier is enough to install and demo. Production file storage and Auth email volume may need a paid Supabase project. That bill is yours.",
  },
  {
    q: "How long does install take?",
    a: "Quick Start is 15 numbered steps. A capable developer should finish without live help.",
  },
];

export default function Home() {
  const demoUrl = publicDemoUrl();
  const demo = demoUrl ?? "/login";
  const demoLabel = demoUrl ? "Open the live demo" : "Sign in locally";
  const oneClickDemo = isDemoMode();

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-24 px-4 py-16">
        <section className="grid items-end gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div>
            <p className="text-sm font-medium text-accent">Next.js + Supabase starter kit</p>
            <h1 className="mt-4 font-serif text-4xl font-semibold text-balance sm:text-5xl">
              Launch a branded client portal in a weekend, not from scratch.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted text-pretty">
              ClientNest is a production-ready portal for developers, freelancers, and small
              agencies: projects, files, approvals, invoices, and role-secured client access — with
              working authorization, not mock JSON.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={sourceRepoUrl} className={primaryButtonClass}>
                View source
              </a>
              <Link href={demo} className={secondaryButtonClass}>
                {demoLabel}
              </Link>
              <Link href="/docs/quick-start" className={secondaryButtonClass}>
                Read Quick Start
              </Link>
            </div>
            <p className="mt-3 text-sm text-muted">
              MIT licensed. You clone it, install it, and host it.
            </p>
          </div>
          <aside className="bg-surface p-6">
            <p className="font-serif text-sm font-semibold">Harbor Studio</p>
            <p className="mt-6 text-sm text-muted">Needs a decision</p>
            <p className="mt-1 text-xl font-medium">Homepage hero v3</p>
            <p className="mt-2 text-sm text-muted">Pine & Oak Coffee · Seasonal menu site</p>
            <p className="mt-6 text-sm">
              Walk the story first, then open the public demo as an owner or client in one click. It
              is read-only.
            </p>
            <ul className="mt-4 grid gap-2 text-sm">
              <li>
                <Link
                  href="/mockups/project"
                  className="text-accent underline-offset-2 hover:underline"
                >
                  Project workspace
                </Link>
              </li>
              <li>
                <Link
                  href="/mockups/approval"
                  className="text-accent underline-offset-2 hover:underline"
                >
                  Deliverable approval
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-accent underline-offset-2 hover:underline">
                  Documentation
                </Link>
              </li>
            </ul>
          </aside>
        </section>

        <section id="walkthrough" className="scroll-mt-8">
          <p className="text-sm font-medium text-accent">A short walkthrough</p>
          <h2 className="mt-3 text-2xl font-medium">Follow one project before you sign in.</h2>
          <p className="mt-2 max-w-2xl text-muted">
            Harbor Studio is delivering a seasonal menu site for Pine & Oak Coffee. These three
            screens show the owner, project, and client sides of the same story.
          </p>
          <ol className="mt-6 grid gap-px overflow-hidden bg-border md:grid-cols-3">
            {walkthrough.map((screen) => (
              <li key={screen.step} className="bg-surface p-5">
                <p className="font-mono text-sm text-accent">{screen.step}</p>
                <h3 className="mt-6 text-lg font-medium">{screen.title}</h3>
                <p className="mt-2 text-sm text-muted">{screen.description}</p>
                <Link
                  href={screen.href}
                  className="mt-6 inline-flex text-sm text-accent underline-offset-2 hover:underline"
                >
                  {screen.link}
                </Link>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-muted">
            Ready to click around?{" "}
            <Link href={demo} className="text-accent underline-offset-2 hover:underline">
              {demoLabel}
            </Link>{" "}
            {oneClickDemo
              ? "lets you choose an Owner or Client view without entering a password."
              : "opens the local sign-in page. The public demo offers one-click Owner and Client views."}
          </p>
        </section>

        <BuyerProof />

        <section className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-medium">Who it is for</h2>
            <ul className="mt-4 grid gap-3 text-sm text-muted">
              <li>
                <strong className="text-foreground">Freelance developers</strong> who rebuild the
                same portal for every client.
              </li>
              <li>
                <strong className="text-foreground">Small web agencies</strong> tired of email,
                chat, and shared folders for delivery.
              </li>
              <li>
                <strong className="text-foreground">Developers</strong> who want real auth,
                RLS, and CRUD — not a dashboard skin.
              </li>
            </ul>
          </div>
          <div id="included" className="scroll-mt-8">
            <h2 className="text-2xl font-medium">v1.0 includes</h2>
            <ul className="mt-4 grid gap-2 text-sm text-muted">
              {included.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted">
              Not in v1: Stripe checkout, live chat, AI, mobile apps, or SSO.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-medium">Stack</h2>
          <p className="mt-2 max-w-2xl text-muted">
            Node 24 LTS, pnpm 10, Next.js 16 App Router, TypeScript, Tailwind 4, shadcn/ui, Supabase
            (Postgres, Auth, Storage, RLS), Vitest and Playwright. Documented deploy path: Netlify,
            Vercel, or a Node server + Supabase.
          </p>
        </section>

        <section id="license" className="scroll-mt-8 max-w-xl">
          <h2 className="text-2xl font-medium">License</h2>
          <p className="mt-2 text-muted">
            <span className="font-medium text-foreground">MIT.</span> Use, modify, and redistribute
            ClientNest, including for client work and as a template. Keep the copyright and
            permission notice.{" "}
            <Link href="/license" className="text-accent underline-offset-2 hover:underline">
              Read the license
            </Link>
            .
          </p>
        </section>

        <section id="faq" className="scroll-mt-8 max-w-2xl">
          <h2 className="text-2xl font-medium">FAQ</h2>
          <dl className="mt-6 divide-y divide-border">
            {faq.map((item) => (
              <div key={item.q} className="py-4">
                <dt className="font-medium">{item.q}</dt>
                <dd className="mt-2 text-sm text-muted">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="questions" className="scroll-mt-8 max-w-xl">
          <h2 className="text-2xl font-medium">Questions?</h2>
          <p className="mt-2 text-muted">
            Install questions belong on GitHub. Include the failing command. Security defects use
            private vulnerability reporting.
          </p>
          <a href={`${sourceRepoUrl}/issues`} className={`${secondaryButtonClass} mt-6`}>
            Open an issue
          </a>
        </section>
      </main>
      <footer className="border-t border-border px-4 py-6 text-center text-sm text-muted">
        <div className="mb-3 flex justify-center sm:hidden">
          <ColorSchemeToggle compact />
        </div>
        ClientNest v1.0 · MIT License · not a hosted SaaS
      </footer>
    </div>
  );
}

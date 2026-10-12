# ClientNest

Agency client portal starter kit (Next.js + Supabase), licensed under MIT. v1.0 includes auth, workspace, invites, clients, projects, milestones, tasks, secure files, activity, deliverable approvals, invoices, and in-app notifications.

Docs: [`docs/quick-start.md`](docs/quick-start.md) · [all guides](docs/)  
License: [MIT](LICENSE) · Contributing: [`CONTRIBUTING.md`](CONTRIBUTING.md) · Security: [`SECURITY.md`](SECURITY.md)

## Fastest path

```bash
pnpm install
pnpm supabase login          # your terminal; opens a browser
pnpm supabase:setup          # hosted project, migrations, .env.local
pnpm supabase:seed           # optional Harbor Studio users
pnpm demo:files              # optional Harbor files in Storage
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Full numbered steps: [Quick Start](docs/quick-start.md).

Docker is not used. Node **24.x** LTS and pnpm **10.x** only. Production host: Vercel or Netlify — [Deployment](docs/deployment.md).

## Demo logins (after seed)

Password `Harbor-Demo-24`

| Email                    | Role                |
| ------------------------ | ------------------- |
| `sam.reed@example.com`   | Harbor Studio owner |
| `riley.chen@example.com` | member              |
| `alex.marin@example.com` | client              |

On a **public** demo set `DEMO_MODE=true` so writes are blocked. Reset with `pnpm demo:reset`. Do not run seed against a workspace that holds real clients.

## Rebrand

Visual tokens live in `src/app/globals.css`. Owner Settings (`/app/settings`) sets name, logo, and one of four presets.

| Layer        | Where                                                                                        |
| ------------ | -------------------------------------------------------------------------------------------- |
| Type         | IBM Plex Sans, Source Serif 4 (letterhead), IBM Plex Mono — loaded in `src/app/layout.tsx`   |
| Color        | CSS variables `--background`, `--foreground`, `--accent`, `--muted`, `--surface`, `--danger` |
| Presets      | `harbor`, `slate`, `clay`, `ink` via `data-theme`                                            |
| Light / dark | Personal toggle (`localStorage` key `clientnest-color-scheme`). Print stays light.           |
| Logo         | Owner upload on `/app/settings`. PNG, JPEG, or WebP. No SVG.                                 |

## Checks

```bash
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm rls:test          # linked hosted project
pnpm test:e2e
pnpm secret:scan
```

GitHub Actions runs lint, format, types, Vitest, build, and Playwright. RLS stays a linked CLI command.

## What this folder is

| Path         | Role                                                                 |
| ------------ | -------------------------------------------------------------------- |
| `src/app`    | Routes (landing, `/docs`, mockups, `/app` product screens)           |
| `docs/`      | Installation, Supabase, customization, deploy, troubleshooting       |
| `supabase/`  | Migrations, seed, RLS tests, demo files                              |

Install questions go to GitHub issues.

Client users only see projects for companies they are contacts on, shared files, submitted deliverables, and sent invoices. Invoices are records only — no Stripe or checkout.

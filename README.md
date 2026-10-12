# ClientNest

Agency client portal starter kit (Next.js + Supabase), licensed under MIT. v1.0 includes auth, workspace, invites, clients, projects, milestones, tasks, secure files, activity, deliverable approvals, invoices, and in-app notifications.

**Live demo:** [https://clientnest-app.netlify.app](https://clientnest-app.netlify.app) (read-only Harbor Studio story)

Docs: [`docs/quick-start.md`](docs/quick-start.md) · [all guides](docs/)  
License: [MIT](LICENSE) · Contributing: [`CONTRIBUTING.md`](CONTRIBUTING.md) · Security: [`SECURITY.md`](SECURITY.md) · Support: [`SUPPORT.md`](SUPPORT.md)

Repository: [github.com/waleed-mirza/clientNest](https://github.com/waleed-mirza/clientNest)

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

Docker is not used. Node **24.x** LTS and pnpm **10.x** only.

## Environment variables

Copy from [`.env.example`](.env.example), or let `pnpm supabase:setup` write the Supabase values. Full table: [Environment reference](docs/environment.md).

| Variable | Required | Notes |
| -------- | -------- | ----- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Hosted Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Anon / publishable key (or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Scripts only | Never import in `src/` or commit it |
| `RESEND_API_KEY` / `RESEND_FROM` | Optional | Auth SMTP and optional notification email |
| `DEMO_MODE` / `NEXT_PUBLIC_DEMO_MODE` | Optional | Read-only public demo only |
| `NEXT_PUBLIC_DEMO_URL` | Optional | Absolute URL for “Open the live demo” on the landing page |

Never commit `.env.local` or real secrets.

## Deploy

Documented path: **Vercel or Netlify + hosted Supabase**. See [Deployment](docs/deployment.md).

1. Apply migrations (`pnpm supabase:setup` or `db push`).
2. Set Auth Site URL and Redirect URLs to your production origin.
3. Set the environment variables above on the host (do not put the service-role key on the host unless you deliberately run admin scripts there).
4. Deploy with Node 24. Netlify uses `netlify.toml` (`pnpm build`).

`NEXT_PUBLIC_DEMO_URL` is optional. The app runs without it; the landing page falls back to local sign-in.

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
pnpm build
pnpm secret:scan
```

GitHub Actions runs lint, format, types, Vitest, build, and Playwright. RLS stays a linked CLI command.

## Contributing

Issues and pull requests are welcome. See [`CONTRIBUTING.md`](CONTRIBUTING.md). Use Node 24 and pnpm 10; never commit secrets; keep Stripe, live chat, AI, SSO, i18n, and time tracking out of v1 unless a maintainer agrees.

Client users only see projects for companies they are contacts on, shared files, submitted deliverables, and sent invoices. Invoices are records only — no Stripe or online checkout.

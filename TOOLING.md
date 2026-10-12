# Tooling notes

Product progress lives in `PROGRESS.md`. This file is a short note for contributors and agents.

## Runtime and package manager

- Node.js **24.x** LTS only (see `.nvmrc`)
- pnpm **10.x** (`packageManager` in `package.json`)
- Docker / `supabase start` is not used; Auth talks to a hosted Supabase project via `.env.local`

## Useful commands

| Command | Purpose |
| ------- | ------- |
| `pnpm supabase login` then `pnpm supabase:setup` | Create/link a hosted project, push migrations, write `.env.local` |
| `pnpm supabase:seed` / `pnpm demo:files` / `pnpm demo:reset` | Harbor Studio demo data |
| `pnpm lint` / `format:check` / `typecheck` / `test` / `build` | Local quality gates |
| `pnpm rls:test` | Isolation tests against a linked hosted project |
| `pnpm test:e2e` | Playwright |
| `pnpm secret:scan` | Scan the release file set for secrets |
| `pnpm release:check` | Secret scan + ZIP + clean install |

## Explicitly out of v1

- Stripe / online checkout, live chat, AI assistants, SSO, i18n, time tracking
- Local Supabase Docker MCP (`http://localhost:54321/mcp`)

## Optional later

Official Supabase, GitHub, Vercel, Sentry, Resend, or Playwright MCP servers may help maintainers. Confirm endpoints in their docs before enabling. Never point a write-capable MCP at a production project.

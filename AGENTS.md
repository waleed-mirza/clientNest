<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# ClientNest agent rules

Product: ClientNest v1.0 — MIT-licensed agency client portal starter (Next.js + Supabase). Scope lives in this file and `PROGRESS.md`.

## Every session

1. Read `PROGRESS.md` before doing product or tooling work. The current week there is the only week that is in scope.
2. After finishing plan-related work, update `PROGRESS.md` (status + evidence path). Do not check items you did not verify.
3. Record scope, timing, or stack changes in `DECISIONS.md`.
4. Follow `TOOLING.md` for contributor tooling notes.

## Current constraint

Interviews are **skipped for v1 start** (founder decision, 23 Aug 2026) but remain in `PROGRESS.md` as `skipped`. Do not delete those rows.

Docs and the demo are in Week 8. Still excluded: Stripe, chat, AI, SSO, i18n, time tracking. The license is MIT (`LICENSE`). Do not add a paid checkout or commercial license tiers.

A v1-excluded feature still needs a `DECISIONS.md` row before it is added.

## Stack (pin when adding a dependency)

| Layer             | Choice                                                                |
| ----------------- | --------------------------------------------------------------------- |
| Runtime           | Node.js 24 LTS (`24.x` only — not 25 Current)                         |
| Packages          | pnpm 10, commit `pnpm-lock.yaml`, `packageManager` field              |
| App               | Next.js 16 App Router, TypeScript strict, `src/`                      |
| UI                | Tailwind CSS 4 + shadcn/ui source, Lucide only                        |
| Backend (Week 4+) | Supabase Postgres / Auth / Storage; RLS is the authorization boundary |
| Hosting           | Vercel or Netlify + Supabase (documented path)                        |

Do not add Redux, an ORM, Express/Nest, GraphQL, a monorepo, or paid design/font dependencies. Never put service-role keys in client code or commit real `.env` values.

## Definition of done (when a real feature is in scope)

Happy path, empty, validation error, server failure, and permission denial. Authorization in the database policy and on the server, not only in the UI. Tests, docs, and demo data updated. No new production-build or console warnings.

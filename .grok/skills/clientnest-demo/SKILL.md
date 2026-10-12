---
name: clientnest-demo
description: Harbor Studio seeded demo and reset. Use when changing seed data, demo files, DEMO_MODE, or the two-minute story.
---

# ClientNest demo

Story: Harbor Studio delivering Seasonal menu site for Pine & Oak Coffee. People are fictional `@example.com` only.

## Commands

- `pnpm supabase:seed` — idempotent SQL, restores Harbor rows
- `pnpm demo:files` — uploads three Storage objects (SQL cannot)
- `pnpm demo:reset` — seed + files
- Public listing demo: `DEMO_MODE=true` (blocks writes)

## Accounts

Password `Harbor-Demo-24`: Sam owner, Riley member, Alex client.

## Rules

- Do not seed real names, emails, or client files.
- Team-only files stay `visibility = internal`; clients must not see those names on the timeline.
- `DEMO_MODE` is for the hosted demo only. Buyer installs leave it unset so Playwright and CRUD still work.
- Seed must stay safe to re-run. Extra Playwright rows in Harbor are deleted.

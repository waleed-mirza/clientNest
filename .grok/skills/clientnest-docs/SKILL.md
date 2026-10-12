---
name: clientnest-docs
description: Buyer install documentation for ClientNest. Use when writing or changing Quick Start, env, Supabase, customization, deploy, troubleshooting, or upgrade guides, or when a buyer would otherwise need live help.
---

# ClientNest docs

Source of truth: `docs/*.md`. The `/docs` routes render those files. Keep README as the fastest path plus links.

## Rules

- Quick Start stays 10–15 numbered steps on Node 24, pnpm 10, hosted Supabase. No Docker.
- Every env var lives in `docs/environment.md` (public vs server-only, required vs optional, where to get it).
- A capable buyer must install without messaging the seller. If they cannot, fix the guide — that is a release blocker.
- Demo passwords and Harbor emails stay fictional `@example.com`. Never paste live service-role keys.
- After doc edits, update `CHANGELOG.md` only when buyer behavior changed.

## Files

| File                      | Topic                            |
| ------------------------- | -------------------------------- |
| `docs/quick-start.md`     | Install                          |
| `docs/environment.md`     | Variables                        |
| `docs/supabase.md`        | Project, RLS, Auth URLs, buckets |
| `docs/customization.md`   | Tokens, presets, roles           |
| `docs/deployment.md`      | Vercel first                     |
| `docs/troubleshooting.md` | Auth, cookies, files, RLS        |
| `docs/upgrade.md`         | Migrations and ZIP replace       |

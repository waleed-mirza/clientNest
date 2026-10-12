# Changelog

## Unreleased

- MIT license copyright holder set to WHH Treasures.
- Landing no longer includes the old purchase / package-proof section.
- README documents environment variables, deploy, live demo, and contributing.
- Support and security contacts point at WHH Treasures / GitHub.

## 1.0.0 — 2026-08-24

First source release.

- Auth: email/password, reset, invite accept, protected `/app`
- Workspace: onboarding, owner Settings (name, logo, Harbor/slate/clay/ink), per-user light/dark
- Clients, projects, milestones, tasks
- Private file uploads with signed downloads
- Deliverables, comments, append-only client approvals
- Invoice records and print layout (no online payment)
- Activity timeline and in-app notifications (optional Resend HTTP adapter)
- Harbor Studio seed and `DEMO_MODE` read-only hosted demo
- Docs: Quick Start, environment, Supabase, customization, deployment, troubleshooting, upgrade
- Netlify: `netlify.toml` (Node 24, `pnpm build`). Adapter is not pinned. `DEMO_MODE` stays in the host UI.
- `pnpm pack:zip` / `pnpm release:check` (secret scan + ZIP + clean install)

Node 24 LTS, pnpm 10, Next.js 16 App Router, Tailwind 4, hosted Supabase. Docker is not used.

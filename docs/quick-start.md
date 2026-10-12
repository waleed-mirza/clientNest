# Quick Start

Follow these steps on your own machine. Budget 10–15 minutes if you already have a Supabase account.

## Requirements

- Node.js **24.x** LTS (not 25)
- pnpm **10.x**
- A hosted Supabase project (free tier is enough)
- Git, to clone the repository

Docker is not required. The app talks to hosted Supabase.

## Install

1. Clone the repository and open that folder in a terminal.
2. `nvm use` (this repo pins 24.13.0 in `.nvmrc`) or install Node 24 another way. Confirm with `node -v`.
3. Enable pnpm 10 if you do not have it: `corepack enable` then `corepack prepare pnpm@10.34.5 --activate`.
4. `pnpm install`
5. In **your** terminal (it opens a browser): `pnpm supabase login`
6. `pnpm supabase:setup` — creates or reuses a ClientNest project, pushes migrations, and writes `.env.local` (URL + anon key only).
7. If you already have several Supabase projects, set the ref first, then re-run setup:

   ```bash
   # PowerShell
   $env:SUPABASE_PROJECT_REF='your-ref'
   $env:SUPABASE_DB_PASSWORD='your-db-password'
   pnpm supabase:setup
   ```

8. Optional Harbor Studio demo users: `pnpm supabase:seed`
9. Optional demo files (hero image, menu PDF, tokens): `pnpm demo:files`
10. `pnpm dev`
11. Open [http://localhost:3000](http://localhost:3000)
12. Create an account at `/signup`, or sign in with a demo user from the table below if you seeded.
13. New accounts land on `/onboarding` to name the workspace. That first user is the owner.
14. Invite a teammate or client from `/app/team`. They open `/invite/<token>` and must use the invited email.
15. Confirm the Auth redirect URLs if you will deploy (see [Supabase setup](/docs/supabase)).

## Demo logins (after seed)

Password for every Harbor user: `Harbor-Demo-24`

| Email                    | Role   | What to look at                                      |
| ------------------------ | ------ | ---------------------------------------------------- |
| `sam.reed@example.com`   | Owner  | Clients, files, request approval, invoices, settings |
| `riley.chen@example.com` | Member | Team-only files stay hidden from the client          |
| `alex.marin@example.com` | Client | Seasonal menu site, Homepage hero v3, INV-2026-0041  |

Never use these emails for a real client. They are fictional `@example.com` identities.

## What “done” looks like

- `/app` shows workspace stats, not an empty onboarding loop
- An owner can create a client and a project
- A client contact sees only assigned projects
- File download works for shared files and 404s for everyone else

If a step fails, use [Troubleshooting](/docs/troubleshooting), then open a GitHub issue.

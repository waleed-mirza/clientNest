# Supabase setup

ClientNest uses hosted Supabase (Postgres, Auth, Storage, RLS). Local `supabase start` / Docker is not part of the supported path.

## Create or link a project

Preferred:

```bash
pnpm supabase login
pnpm supabase:setup
```

The script creates `clientnest-dev` if you have no project, links this folder, pushes `supabase/migrations` in filename order, writes `.env.local`, and sets the Auth site URL to `http://localhost:3000`.

Manual path:

1. Create a project in the Supabase dashboard.
2. SQL editor or `pnpm supabase db push --linked` for every file in `supabase/migrations`.
3. Paste the project URL and anon key into `.env.local`.

## What migrations create

| Area            | Notes                                                   |
| --------------- | ------------------------------------------------------- |
| Auth identities | `profiles` rows are created from Auth users             |
| Workspace       | `workspaces`, `memberships`, `invitations`              |
| Agency records  | clients, contacts, projects, milestones, tasks          |
| Files           | `files` metadata + private `project-files` bucket       |
| Branding        | private `workspace-logos` bucket, PNG/JPEG/WebP, no SVG |
| Workflow        | deliverables, comments, append-only `approvals`         |
| Billing records | invoices and line items in USD cents — **no Stripe**    |
| Activity        | `activity_events` with `internal` / `client` visibility |
| Notifications   | in-app rows; email is a fetch adapter                   |

Row Level Security is enabled and forced on business tables. Do not turn it off.

## Auth URLs

Dashboard → Authentication → URL configuration:

| Setting       | Local                      | Production               |
| ------------- | -------------------------- | ------------------------ |
| Site URL      | `http://localhost:3000`    | `https://your-domain`    |
| Redirect URLs | `http://localhost:3000/**` | `https://your-domain/**` |

The app uses `/auth/confirm` as the PKCE callback. Password reset continues to `/reset-password`.

Email templates can stay on the Supabase defaults. Confirmation and recovery links must keep the `{{ .ConfirmationURL }}` (or token-hash) placeholder.

## Email (Auth SMTP)

Password-reset and signup confirmation mail is **Supabase Auth SMTP**, not the Next.js app.

```bash
# PowerShell
$env:RESEND_API_KEY='re_your_key'
pnpm supabase:smtp
```

Until you verify a domain in Resend, the From address is `onboarding@resend.dev` and delivery is limited to the Resend account email.

In-app notification email is separate: the same `RESEND_API_KEY` in `.env.local` / Vercel. No Resend SDK is installed. Missing key = in-app only.

## Storage

Buckets come from migrations. You should not create them by hand.

| Bucket            | Public | Path shape                              |
| ----------------- | ------ | --------------------------------------- |
| `project-files`   | No     | `{workspace_id}/{project_id}/{file_id}` |
| `workspace-logos` | No     | `{workspace_id}/logo`                   |

Downloads go through `/app/files/[id]/download` (60-second signed URL) after an RLS check. Do not expose the service role to mint URLs in the browser.

## Seed

```bash
pnpm supabase:seed
pnpm demo:files
```

`seed.sql` is idempotent. It restores Harbor Studio (fictional people only) and deletes extra Playwright rows in that workspace. It cannot create Storage objects; `pnpm demo:files` uploads the three Harbor files.

A public demo should use a **separate** project. From this repo (does not change `.env.local`):

```bash
pnpm supabase:demo
```

## Isolation tests

```bash
pnpm rls:test
```

Needs a linked project and the service role in the environment. Expect `RLS_OK`. A failing negative case is a **release blocker**.

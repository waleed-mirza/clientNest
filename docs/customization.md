# Customization

Buyers rebrand in a weekend by editing CSS variables and, in the app, the owner Settings page. Do not scatter new hex values in components.

## Visual tokens

Source of truth: `src/app/globals.css` (`:root` and `[data-theme]` / `html[data-color-scheme]`).

| Token          | Role                                     |
| -------------- | ---------------------------------------- |
| `--background` | Page paper                               |
| `--foreground` | Body ink                                 |
| `--accent`     | One action color (Harbor: oxidized pine) |
| `--muted`      | Secondary text                           |
| `--surface`    | Raised panels                            |
| `--danger`     | Destructive / errors                     |

Type: IBM Plex Sans (UI), Source Serif 4 (workspace name, landing H1, invoice letterhead only), IBM Plex Mono (numbers and IDs). Loaded in `src/app/layout.tsx`. These fonts are SIL OFL and redistributable.

Motion: `--duration` (150ms) and `--ease` in `:root`. Hover and press use opacity or color only. Route changes fade the page in and show a pine progress bar if navigation takes longer than a beat. `prefers-reduced-motion: reduce` turns the motion off.

## Presets and color scheme

Owner Settings (`/app/settings`) stores a preset on `workspaces.theme`: `harbor` | `slate` | `clay` | `ink`. Arbitrary CSS in that jsonb is rejected.

Each signed-in person picks light / dark / system. That choice is `localStorage` key `clientnest-color-scheme`. Print layouts stay light.

## Logo

Owner upload, PNG / JPEG / WebP, max 512 KB, no SVG. Stored in the `workspace-logos` bucket. Only owners can write it (`canEditWorkspace`).

## Navigation and roles

Role-aware nav lives in `src/features/app-shell/workspace-nav.tsx`. Do not add a workspace switcher in v1: `/app` shows the oldest membership.

| Role    | Typical access                                                         |
| ------- | ---------------------------------------------------------------------- |
| Owner   | Settings, team, all records                                            |
| Manager | Team invites, clients, projects, files, invoices                       |
| Member  | Clients, projects, files, invoices (no Settings, no invites)           |
| Client  | Assigned projects, shared files, submitted deliverables, sent invoices |

Client access is `client_contacts.profile_id`, not `project_members`. `project_members` is the internal team.

## Database fields

Add columns with a **new forward-only migration** in `supabase/migrations`. Enable and force RLS. Add a positive and a negative case to `supabase/tests/rls.sql`. Run `pnpm supabase db push --linked` and `pnpm rls:test`.

Do not introduce an ORM.

## Email provider

The notification adapter is `src/lib/notifications/email.ts`. It POSTs to the Resend HTTP API when `RESEND_API_KEY` is set. To use another provider, change that one module. Auth SMTP is configured on the Supabase project, not in Next.js.

## What not to add while staying on v1

Stripe/PayPal checkout, live chat, AI, SSO, i18n, time tracking, a large theme gallery. Those stay out of the v1 product. The MIT license does not add them.

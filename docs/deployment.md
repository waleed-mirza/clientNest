# Deployment

Documented production path: **Vercel or Netlify + hosted Supabase**. Self-hosting a Node server is possible; static export is not (the app needs Server Actions, cookies, and SSR).

A hosted demo can run on Netlify. Your own install may use Vercel or Netlify. `netlify.toml` pins Node 24 and `pnpm build`. Netlify injects its Next.js adapter at build time — do not add `@netlify/plugin-nextjs` unless you intend to pin and skip automatic adapter updates.

## Before you deploy

1. A hosted Supabase project with all migrations applied (`pnpm supabase:setup` or `db push`).
2. Auth Site URL and Redirect URLs set to the production origin (see [Supabase setup](./supabase.md)).
3. Optional: Resend domain + `pnpm supabase:smtp` so real clients receive reset mail.
4. Optional: `pnpm supabase:seed` only on a **demo** project, never on a client’s production data.

## Environment variables (either host)

| Name                            | Value                                     |
| ------------------------------- | ----------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://<ref>.supabase.co`               |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon / publishable key                    |
| `RESEND_API_KEY`                | optional                                  |
| `RESEND_FROM`                   | optional, verified domain                 |
| `DEMO_MODE`                     | `true` only on the public demo deployment |

Do not add `SUPABASE_SERVICE_ROLE_KEY` to the host unless you are deliberately running admin scripts in that environment. The Next.js app does not read it.

## Vercel

1. Create a Vercel project from the repository.
2. Framework preset: Next.js. Node 24.
3. Paste the variables above. Redeploy after changing `NEXT_PUBLIC_*` values.
4. Open `/login` and create the owner account (or use Harbor logins on a demo project).
5. Confirm `/auth/confirm` completes signup and password reset.

## Netlify

1. Create a site from the Git remote. Framework: Next.js. Node **24** (`netlify.toml` sets `NODE_VERSION`).
2. pnpm comes from `package.json` `"packageManager"`. Build command is `pnpm build`.
3. Site configuration → Environment variables: paste the table above. Scope them to Production (and Preview if you want Harbor on deploy previews).
4. Trigger a deploy. Open `/login`.
5. Confirm `/auth/confirm` completes signup and password reset.

`DEMO_MODE` belongs in the Netlify UI, not in `netlify.toml`, so a normal install on Netlify is not read-only by default.

## Public demo

Use a **separate** Supabase project for a public demo. Do not point that demo at a project that holds real client work.

Create or re-seed that project (does not write `.env.local`):

```bash
pnpm supabase:demo
```

Then in Netlify → Environment variables (Production):

- Paste `supabase/.temp/netlify-demo.env` (gitignored): URL, anon key, `DEMO_MODE=true`, `NEXT_PUBLIC_DEMO_MODE=true`
- After the site URL exists, set `NEXT_PUBLIC_DEMO_URL` and add that origin to this project's Auth Site URL + Redirect URLs

The public demo offers one-click Owner and Client access while `DEMO_MODE=true`. The seeded Harbor password remains `Harbor-Demo-24` for manual testing and local installs. Reset later with `pnpm supabase:demo` again.

## Self-hosting

`pnpm build` then `pnpm start` on Node 24. You need:

- HTTPS (Auth cookies and callbacks)
- The same env vars as the table above
- A process manager (systemd, Docker, etc.)

This repo does **not** ship a Docker workflow for local Supabase. A production Docker image of the Next.js app is your operations choice; keep service-role keys out of the image layers.

## Limitations

- One visible workspace per user (oldest membership). Invite accept can add another; there is no switcher.
- Invoices are records and a print stylesheet. Paid means recorded off-platform.
- File size cap is 10 MB; logos 512 KB.
- Email confirmation depends on Auth SMTP. Without it, you can confirm users in the dashboard for development only.

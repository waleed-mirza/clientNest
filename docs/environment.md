# Environment reference

Copy `.env.example` to `.env.local` only if you are pasting keys by hand. `pnpm supabase:setup` already writes the two public Supabase values.

Never commit `.env.local`, the service-role key, or `RESEND_API_KEY`. Variables prefixed `NEXT_PUBLIC_` are sent to the browser.

| Variable                                | Where      | Required                      | Source                                                                                              |
| --------------------------------------- | ---------- | ----------------------------- | --------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`              | Browser    | Yes                           | Supabase → Project Settings → API. Setup script writes this.                                        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`         | Browser    | Yes (or publishable key)      | Supabase anon / publishable key.                                                                    |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`  | Browser    | Alternate for the anon key    | Newer hosted projects may show this name. Either key works.                                         |
| `SUPABASE_SERVICE_ROLE_KEY`             | Server/CLI | Scripts only                  | Dashboard API keys. **Never** import this in `src/`. Used by `pnpm demo:files` and `pnpm rls:test`. |
| `SUPABASE_PROJECT_REF`                  | CLI        | If you already have projects  | Project ref in the dashboard URL.                                                                   |
| `SUPABASE_DB_PASSWORD`                  | CLI        | Existing project migrations   | Database password. Stored in `supabase/.temp/` (gitignored) when setup creates the project.         |
| `SUPABASE_ORG_ID`                       | CLI        | Optional                      | Org for a newly created project.                                                                    |
| `SUPABASE_REGION`                       | CLI        | Optional, default `us-east-1` | Region for a newly created project.                                                                 |
| `RESEND_API_KEY`                        | Server/CLI | Optional                      | Resend. Auth SMTP via `pnpm supabase:smtp`. In-app notification emails use the same key.            |
| `RESEND_FROM`                           | Server     | Optional                      | Default `ClientNest <onboarding@resend.dev>`. Verify a domain before mailing other inboxes.         |
| `DEMO_MODE`                             | Server     | Optional                      | Set `true` on the **hosted public demo** only. Blocks writes. Leave unset on your own install.      |
| `NEXT_PUBLIC_DEMO_MODE`                 | Browser    | Optional                      | Same flag if the public login page should offer one-click demo access.                              |
| `NEXT_PUBLIC_DEMO_URL`                  | Browser    | Optional                      | Absolute URL for “Open the live demo” on the landing page.                                          |

## Public vs server-only

- `NEXT_PUBLIC_*` values are compile-time public. Treat them as visible to every visitor.
- `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS. It belongs in GitHub Actions secrets or a local `.env.local`, never in client components.
- `RESEND_API_KEY` is server-only. Missing is a silent skip for in-app email; the product still works.

## Rotating secrets

1. Roll the key in the Supabase or Resend dashboard.
2. Update `.env.local` and the Vercel or Netlify project env.
3. Redeploy. Old anon keys stop working after they are revoked.
4. Do not rotate the Harbor demo password in seed unless you also update the docs and Playwright specs.

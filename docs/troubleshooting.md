# Troubleshooting

Work top to bottom. If the production build or an RLS negative test fails, stop shipping.

## Sign-in does nothing / “Supabase is not configured”

`.env.local` is missing `NEXT_PUBLIC_SUPABASE_URL` and an anon/publishable key. Copy from the dashboard or re-run `pnpm supabase:setup`, then restart `pnpm dev`.

## Invalid login after seed

Password is exactly `Harbor-Demo-24`. Emails are lowercase `sam.reed@example.com` (and Riley / Alex). Re-run `pnpm supabase:seed`.

## Signup succeeds but `/app` redirects to onboarding forever

The Auth user exists and `profiles` exists, but there is no `memberships` row. Complete `/onboarding`. If onboarding insert fails, check the browser network tab for the PostgREST error (usually RLS or a duplicate workspace slug).

## Password reset never arrives

Auth SMTP is not the Next.js app. Until a Resend domain is verified, mail only lands in the Resend account inbox from `onboarding@resend.dev`. Run `pnpm supabase:smtp` with `RESEND_API_KEY`. Confirm Site URL + Redirect URLs include `/auth/confirm`.

## Reset link opens login instead of `/reset-password`

Redirect URL allow-list does not include the origin you are using (localhost vs production). Add both.

## Invite shows the workspace then accept fails

The signed-in email must match the invite. Expired, used, or wrong-email tokens fail in SQL (`accept_invitation`) and in the UI. Invitees are not members yet — accept is a `SECURITY DEFINER` function, not `memberships` insert.

## Client user sees the wrong projects (or none)

Clients see projects for companies they are **contacts** of (`client_contacts.profile_id`). Adding them as `project_members` is not the client-access switch. Archive hides the company from team lists but does not leak it to other workspaces.

## File upload fails

Allowed types: PDF, PNG, JPEG, GIF, WebP, TXT, CSV. Max 10 MB. The file name extension must match the MIME type. Storage path is `{workspace}/{project}/{file id}` in the private `project-files` bucket — if that bucket is missing, migrations were not pushed.

## Download is 404 for a file the team can see

Client role + `visibility = internal`. That is intended. Team-only names also stay off the client activity timeline.

## `pnpm rls:test` is not `RLS_OK`

A negative case failed. That is a release blocker. Do not disable RLS to “make the app work.” Read the SQL error, fix the policy, re-run.

## `pnpm build` warnings or type errors

Run `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test`. CI runs those plus Playwright. Do not ship with new production-build warnings.

## Cookies / session drops on Vercel or Netlify

Site URL must be the HTTPS production origin (the `*.netlify.app` URL or your custom domain). Add that origin to Supabase Auth redirect URLs. Do not cache authenticated HTML at the CDN. The project uses the official `@supabase/ssr` cookie pattern in `src/lib/supabase` and `src/proxy.ts`.

## Demo says it is read-only

`DEMO_MODE=true` on that deployment. Unset it on a real install. A public demo should keep it on and reset with `pnpm demo:reset`.

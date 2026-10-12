---
name: clientnest-rls
description: Keep RLS on before features; add positive and negative tests. Use when adding tables, policies, or invites.
---

# ClientNest RLS

- Enable and **force** RLS on every new public table before the app uses it.
- Policies must cover select/insert/update/delete you actually grant. Default deny.
- `SECURITY DEFINER` helpers (`is_workspace_member`, `accept_invitation`) stay `set search_path = public`. Revoke execute from `public` / `anon` unless the function is a deliberate preview.
- Invitees are not members yet. Do not expect `memberships_insert` to allow accept; use `accept_invitation`.
- Every new table gets a positive case and a negative case in `supabase/tests/rls.sql`.
- Run `pnpm rls:test` against the linked hosted project. Docker is not used.
- Seed data uses fictional `@example.com` identities only.

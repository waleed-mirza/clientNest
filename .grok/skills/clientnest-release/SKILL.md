---
name: clientnest-release
description: Buyer ZIP, secret scan, and clean-install gate. Use when packaging ClientNest for sale or running /clientnest-release.
---

# ClientNest release

```bash
pnpm secret:scan
pnpm pack:zip          # dist/clientnest-vX.Y.Z.zip from package.json version
pnpm clean:install     # unzip + pnpm install --frozen-lockfile
pnpm release:check     # all three
```

## ZIP contains

Source, lockfile, docs, license, changelog, support policy, migrations, seed, demo-files, e2e, CI workflow, `.env.example`.

## ZIP must not contain

`.env*`, `node_modules`, `.next`, `.git`, `.grok`, `marketing/`, `PROGRESS.md`, `DECISIONS.md`, `TOOLING.md`, `AGENTS.md`, the Word plan, waitlist JSON, `supabase/.temp`.

Allowlist: `scripts/release-files.mjs`.

## Blockers

- Secret scan hit (service-role JWT, Resend key, Stripe live, private key)
- Env file inside the ZIP
- Clean install fail
- `pnpm rls:test` not `RLS_OK` (run separately; needs the linked project)
- Version mismatch between `package.json`, `CHANGELOG.md`, and the ZIP filename

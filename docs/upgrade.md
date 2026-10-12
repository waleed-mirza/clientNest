# Upgrade guide

v1.0.0 is the first MIT release. There is no previous version to migrate from.

## Backup before you replace files

1. Dump the hosted database (Supabase dashboard → Database → Backups, or `pg_dump`).
2. Copy Storage buckets if you have production files.
3. Keep your `.env.local` / host env. Never commit `.env`.

## Applying a newer version

1. Pull the new commit next to your local edits, not on top of `node_modules`.
2. Copy **your** `.env.local`.
3. Copy any files you edited for branding (`src/app/globals.css`, logo, copy) into the new tree, or re-apply Settings.
4. `pnpm install`
5. Apply **new** files in `supabase/migrations` only, in filename order: `pnpm supabase db push --linked`
6. `pnpm rls:test` if policies changed
7. `pnpm build` and redeploy

Migrations are forward-only. Do not edit an already-applied file; add a new timestamped SQL file.

## Breaking changes

None yet. Future notes will land in `CHANGELOG.md` with the migration filenames.

## Harbor seed vs production data

`pnpm supabase:seed` **replaces** Harbor Studio demo rows. It is safe to re-run on a demo project. Do not run it against a workspace that holds real clients.

## Version

`package.json` `version` and the `CHANGELOG.md` heading should agree.

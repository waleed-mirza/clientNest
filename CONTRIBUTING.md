# Contributing

ClientNest is MIT-licensed. Issues and pull requests are welcome.

1. `nvm use` (Node 24) and `pnpm` 10 only.
2. Pin exact versions when adding a production dependency.
3. Never commit `.env`, service-role keys, or private contact data.
4. Before opening a PR: `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test`. GitHub Actions runs those plus `pnpm build` and Playwright.
5. After schema changes: `pnpm supabase db push --linked` and `pnpm rls:test`.
6. Keep Stripe, live chat, AI, SSO, i18n, and time tracking out of v1 unless a maintainer has agreed in writing.

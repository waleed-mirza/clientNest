# Grok tooling — now vs later

Source of truth for which MCPs, skills, and hooks are active. Progress of _product_ work lives in `PROGRESS.md`.

Confirm endpoints in official docs before enabling a future row. Do not install future items early.

Enabled 23 Aug 2026. After pulling this repo, run `/hooks-trust` (or `grok --trust`) so project hooks run, then `/mcps` and authenticate Context7 if prompted.

## Now (building v1; interviews skipped)

Docker is **skipped**. Auth talks to a hosted Supabase project via `.env.local`. Founder runs `pnpm supabase login` once; `pnpm supabase:setup` (CLI `2.115.0`) creates/links the project, pushes migrations, and writes keys. Until that runs, auth pages render but cannot create sessions.

Do **not** enable local `http://localhost:54321/mcp`. Optional later: cloud MCP with `?project_ref=<dev>&read_only=true` (never production).

### MCP servers (project `.grok/config.toml`)

| Server       | Transport                           | Why now                                                                               |
| ------------ | ----------------------------------- | ------------------------------------------------------------------------------------- |
| **context7** | HTTP `https://mcp.context7.com/mcp` | Current Next.js / Tailwind / React docs for the landing page and mockups              |
| **shadcn**   | stdio `npx -y shadcn@latest mcp`    | Install real shadcn items when UI primitives are needed; do not invent component APIs |

OAuth: complete Context7 login from `/mcps` if prompted. Optional `CONTEXT7_API_KEY` in the environment (not in git).

### Skills (`.grok/skills/`)

| Skill                     | Slash                    | When                                                |
| ------------------------- | ------------------------ | --------------------------------------------------- |
| `clientnest-progress`     | `/clientnest-progress`   | Start/end of a session or after finishing plan work |
| `clientnest-scope`        | `/clientnest-scope`      | Any feature, page, or dependency request            |
| `clientnest-validation`   | `/clientnest-validation` | Interviews, waitlist, landing copy, scorecard       |
| `clientnest-ui`           | `/clientnest-ui`         | Mockups, landing, any visual work. Wins on tokens.  |
| `clientnest-architecture` | —                        | Feature folders, thin routes, Server Actions        |
| `clientnest-rls`          | —                        | RLS on before features; `pnpm rls:test`             |
| `clientnest-docs`         | —                        | Buyer install guides; keep Quick Start 10–15 steps  |
| `clientnest-demo`         | —                        | Harbor seed, `DEMO_MODE`, `pnpm demo:reset`         |
| `clientnest-release`      | —                        | Secret scan, ZIP, clean-install                     |

### Plugins (`.grok/plugins/`)

| Plugin            | Slash              | When                                                                                         |
| ----------------- | ------------------ | -------------------------------------------------------------------------------------------- |
| `frontend-design` | `/frontend-design` | Visual craft on landing, mockups, and product UI. `clientnest-ui` tokens still win on brand. |

Vendored in the repo. After a fresh clone, install and enable once so Grok loads the skill:

```
grok plugin install ./.grok/plugins/frontend-design --trust
grok plugin enable frontend-design
```

Start a new session (or `/plugins` then `r`) so `/frontend-design` appears.

### Hooks (`.grok/hooks/`)

| Event          | Script                   | Why now                                             |
| -------------- | ------------------------ | --------------------------------------------------- |
| `SessionStart` | `bin/session-start.js`   | Remind the current plan week (stderr in scrollback) |
| `PreToolUse`   | `bin/secrets-guard.js`   | Block `.env` writes and obvious secret leaks        |
| `PostToolUse`  | `bin/prettier-edited.js` | Format edited TS/TSX/CSS/MD/JSON                    |

Project hooks stay inactive until the folder is trusted (`/hooks-trust` or `grok --trust`).

### Bundled skills to use (do not copy)

- `design` — Week 3 PRD only, after the validation gate
- `agent-browser` — landing/mockup verification and screenshot capture
- `docx` — interview notes if they stay in Word
- `review` — when implementation PRs exist (Week 4+)

### Explicitly off for v1

- `build-with-ai` — AI assistants are a v1 exclusion
- Linear, Firebase, Discord, Terraform, Neon MCPs

---

## Next (after a GitHub remote exists)

| Kind   | Item                                                                              | Purpose                                                   |
| ------ | --------------------------------------------------------------------------------- | --------------------------------------------------------- |
| MCP    | **Supabase** `https://mcp.supabase.com/mcp` (`?project_ref=<dev>&read_only=true`) | Advisors. Never production. Local Docker MCP is not used. |
| MCP    | **GitHub** official remote MCP                                                    | Issues, PRs, Actions, Lite repo                           |
| Plugin | `typescript-lsp`                                                                  | Go-to-def / diagnostics                                   |

## Later (Weeks 6–8 tooling that is now on)

Docs / demo / ZIP skills moved into **Now** when Week 8 started (24 Aug 2026).

## Later (Weeks 9+)

| Kind | Item                                                                   | Purpose                                           |
| ---- | ---------------------------------------------------------------------- | ------------------------------------------------- |
| MCP  | **Playwright** plugin                                                  | Author the commercial e2e journey                 |
| MCP  | **Next.js 16** dev-server MCP                                          | Live routes / build errors                        |
| MCP  | **Resend** `https://mcp.resend.com/mcp`                                | Email _adapter_ only; app must run without Resend |
| Hook | `Stop` release gate (types + unit tests; full suite only on “release”) | Do not run Playwright on every turn               |

## After first paid users

| Kind  | Item                                          | Purpose                                                                         |
| ----- | --------------------------------------------- | ------------------------------------------------------------------------------- |
| MCP   | **Vercel** `https://mcp.vercel.com`           | Documented hosting path                                                         |
| MCP   | **Sentry** `https://mcp.sentry.dev/mcp`       | Demo/production failures                                                        |
| MCP   | Mixpanel only if landing/demo is instrumented | Week 11 conversion                                                              |
| Skill | `clientnest-listing`                          | Lemon Squeezy + Codester assets                                                 |
| MCP   | Lemon Squeezy                                 | Skip until a first-party or trusted server exists; use the dashboard until then |

## Recheck before enabling

Platform fees, Node, Next.js, and MCP URLs change. Recheck official docs (plan Appendix A) before account activation or a major dependency bump.

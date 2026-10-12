# ClientNest progress

Living tracker for the MIT open-source portal starter.
Update this file whenever plan-related work starts or finishes. Do not mark an item done unless the exit criteria are actually met.

**North star:** ship a reliable MIT-licensed agency client portal starter that a developer can install from docs.

## Current status

| Field                | Value                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------ |
| Plan week            | **Week 8 in progress.** The hosted demo is live. The license is MIT as of 12 Oct 2026.                        |
| Phase                | Open source.                                                                                                 |
| Allowed product work | Week 8 docs and demo. No Stripe, AI, chat, SSO, or i18n.                                                     |
| Blocked until        | Nothing in the tree. Repo visibility is a founder decision (agents must not change it).                      |
| Last updated         | 12 Oct 2026 (MIT open-source polish: LICENSE, docs, remove `.grok` / purchase UI)                            |

## How to use

1. Read this file at the start of every session.
2. Work only the current week's required output.
3. Check boxes only when the evidence exists (a file, a count, a passing command).
4. Record scope or timing changes in `DECISIONS.md`.

---

## Week 1 — Problem research (24–30 Aug 2026)

**Required output:** 15 interviews, competitor notes, three mockups, language log.

| Item                                                            | Status                     | Evidence                                                                                    |
| --------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------- |
| One-sentence concept                                            | done                       | Landing page hero + `AGENTS.md`                                                             |
| Three polished mockups (dashboard, project workspace, approval) | done                       | `/mockups/dashboard`, `/mockups/project`, `/mockups/approval` (static, Harbor Studio story) |
| Landing page (promise, screenshots, stack, waitlist)            | done                       | `/` — MIT landing.                                                                          |
| List of 30 target users                                         | skipped                    | Kept in plan as skipped.                                                                    |
| ≥15 short conversations                                         | skipped                    | Kept in plan as skipped.                                                                    |
| Language / objection log                                        | done (public threads only) | Historical notes removed 12 Oct 2026.                                                       |
| Competitor notes                                                | done (secondary research)  | Historical notes removed 12 Oct 2026.                                                       |
| Schedule first 5 conversations                                  | skipped                    | Kept in plan; founder speaks as freelancer user                                             |

## Week 2 — Validate positioning (31 Aug–6 Sep 2026)

| Item                         | Status                  | Evidence                                                |
| ---------------------------- | ----------------------- | ------------------------------------------------------- |
| 30 total conversations       | skipped                 | Plan row kept. Not a build blocker.                     |
| 5 strong adoption intents    | skipped                 | Founder intent as freelancer.                           |
| 10 qualified waitlist emails | skipped                 | Lead form removed 12 Oct 2026.                          |
| Landing conversion notes     | skipped                 | Optional later.                                         |
| Shortlist objections         | done (public + founder) | Historical notes removed 12 Oct 2026.                   |

**Gate (plan):** if fewer than 3 strong first-party responses, do not complete the product unchanged.

**23 Aug founder decision:** interviews are unnecessary for starting v1. Rows stay here as `skipped`. See `DECISIONS.md`.

## Week 3 — Lock scope (7–13 Sep 2026)

| Item                                    | Status      | Evidence                                                                                                              |
| --------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------- |
| Early-access installs preferred         | skipped     | Not required to build                                                                                                 |
| PRD / screen map / schema locked        | in progress | Scope notes + migrations; workspaces through projects are in `supabase/migrations`                                    |
| v1 exclusions locked                    | done        | `AGENTS.md` + `DECISIONS.md`                                                                                          |
| Storefront / checkout eligibility       | removed     | Not applicable under MIT. Historical checkout notes removed 12 Oct 2026.                                              |

## Week 4 — Engineering foundation (14–20 Sep 2026)

Closed 23 Aug 2026.

| Item                                                   | Status | Evidence                                                                                                                                                                                                       |
| ------------------------------------------------------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Git repo, README, AGENTS.md, env example, decision log | done   | Repo initialized. Prettier 3.9.6.                                                                                                                                                                              |
| Next.js + TS + Tailwind + `src/` + pnpm + Node 24      | done   | Next 16.3.2, Tailwind 4.3.3, pnpm 10.34.5, Node 24.13.0                                                                                                                                                        |
| ESLint, Prettier, Vitest, Playwright, GitHub Actions   | done   | `pnpm lint`, `format:check`, `typecheck`, Vitest, Playwright, `pnpm build` exit 0. Workflow: `.github/workflows/ci.yml`                                                                                        |
| Hosted Supabase, migrations, seed                      | done   | Hosted development project. Migrations `20260823120000` + `20260823140000` on remote. `pnpm supabase:seed` created Harbor Studio demo users. Project ref removed 12 Oct 2026. |
| SSR Supabase clients                                   | done   | `src/lib/supabase/*` + `src/proxy.ts`                                                                                                                                                                          |
| Login / reset / invite / protected layout              | done   | `/login` `/signup` `/forgot-password` `/reset-password` `/auth/confirm` `/invite/[token]` `/app/team`. Demo owner opened Team (Playwright). Founder clicked through a live password-reset email (24 Aug 2026). |
| Workspace, profiles, memberships + RLS tests           | done   | Founder workspace + Harbor Studio (seed). `pnpm rls:test` returned `RLS_OK` on hosted.                                                                                                         |

## Week 5 — Clients and projects (21–27 Sep 2026)

Closed 23 Aug 2026.

| Item                                            | Status | Evidence                                                                                                                          |
| ----------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Role-aware shell and dashboard summaries        | done   | `/app` layout + `WorkspaceNav`. Owner sees Clients/Projects/Team; client sees Dashboard/Projects. Stats from live counts.         |
| Client CRUD, search, archive, contacts          | done   | `/app/clients`, `/app/clients/new`, `/app/clients/[id]`. Internal roles only. Soft archive.                                       |
| Project CRUD, client assignment, team members   | done   | `/app/projects`, `/app/projects/new`, `/app/projects/[id]`. Status words: Planned / In progress / Awaiting approval / Approved.   |
| Empty, loading, error, permission-denied states | done   | Empty lists, `loading.tsx`, `error.tsx`, `AccessDenied` for client role on agency screens.                                        |
| RLS + seed                                      | done   | Migration `20260823200000` on hosted. `pnpm rls:test` → `RLS_OK`. Harbor seed: Pine & Oak, North Shore Dental, Fieldnote Journal. |
| Automated tests                                 | done   | Vitest 28 passed. Playwright 8 passed (owner CRUD + client isolation). `pnpm build` exit 0.                                       |

## Week 6 — Milestones, tasks, files, activity (28 Sep–4 Oct 2026)

Closed 23 Aug 2026.

| Item                                            | Status | Evidence                                                                                                             |
| ----------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------- |
| Milestones and tasks on the project workspace   | done   | `/app/projects/[id]`. Status, due date, assignee, order. Harbor seed: Kickoff & sitemap, Homepage & menu board.      |
| Secure file upload, list, download, delete      | done   | Private `project-files` bucket. Paths `{workspace}/{project}/{file id}`. `/app/files/[id]/download` 60s signed URLs. |
| Project and dashboard activity timeline         | done   | `activity_events` on `/app` and the project page. Team-only file events stay internal.                               |
| Empty, loading, error, permission-denied states | done   | Empty workflow sections; clients cannot mutate; team-only files and filenames hidden.                                |
| RLS + seed                                      | done   | Migrations `20260823210000` + `20260823220000` on hosted. `pnpm rls:test` → `RLS_OK`.                                |
| Automated tests                                 | done   | Vitest 41 passed. Playwright 11 passed. `pnpm build` exit 0.                                                         |

## Week 7 — Deliverables, approvals, invoices, notifications (5–11 Oct 2026)

Closed 23 Aug 2026.

| Item                                            | Status | Evidence                                                                                                                 |
| ----------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------ |
| Deliverables, comments, request approval        | done   | `/app/projects/[id]/deliverables/new`, `/app/deliverables/[id]`. Harbor seed: Homepage hero v3 awaiting approval.        |
| Immutable client decisions                      | done   | `approvals` append-only. Client approve / request changes. Team resubmits after changes.                                 |
| Invoices, line items, totals, print layout      | done   | `/app/invoices`, `/app/invoices/[id]/print`. USD cents. No online payment. Seed: INV-2026-0041 sent, INV-2026-0038 paid. |
| In-app notifications + optional email adapter   | done   | `/app/notifications`. Fetch adapter skips when `RESEND_API_KEY` is missing. No Resend SDK.                               |
| Empty, loading, error, permission-denied states | done   | Empty lists; clients cannot create deliverables/invoices; drafts stay team-only.                                         |
| RLS + seed                                      | done   | Migrations `20260823230000` + `20260823240000` on hosted. `pnpm rls:test` → `RLS_OK`.                                    |
| Automated tests                                 | done   | Vitest 62 passed. Playwright 14 passed (owner submit + client decision + invoice print). `pnpm build` exit 0.            |

Visual system (23 Aug 2026, not a plan week): Harbor tokens, IBM Plex + Source Serif 4 letterhead, four owner presets, per-user light/dark, `/app/settings` logo. Owner project Overview is compact lists (edit on open). Invoice detail is a meta line, not KPI tiles. Mobile nav is a CSS overlay. Seed reset restores Harbor + canonical demo rows. Vitest 71 passed. Playwright: 16/17 then the remaining clients/projects spec passed at 35s with a 120s timeout.

Interaction polish (7 Sep 2026): `/app` page fade-in, delayed pine nav progress, list-shaped `PageSkeleton`, button hover/press and pending spinner via `ActionButton`. No new dependency. `prefers-reduced-motion` still wins.

## Week 8 — Docs, demo, and open-source publish (12–18 Oct 2026)

Software closed 24 Aug 2026. Publish polish continues.

| Item                                                       | Status                       | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Install docs (Quick Start through troubleshooting + upgrade) | done                       | `docs/*.md`, `/docs`, `/docs/quick-start`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| License, changelog, support policy                         | done                         | `LICENSE` (MIT, copyright WHH Treasures), `CHANGELOG.md`, `SUPPORT.md`, `SECURITY.md`, `/license`                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Seeded demo story + Storage files                          | done                         | `supabase/seed.sql` + `supabase/demo-files/` + `pnpm demo:files` / `pnpm demo:reset`                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Read-only hosted demo                                      | done                         | `DEMO_MODE=true` blocks writes; `/login` offers one-click Owner/Client (no public password prompt)                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Release ZIP + secret scan + clean-install                  | done                         | `pnpm release:check` → `SECRET_SCAN_OK`, packed ZIP, `CLEAN_INSTALL_OK`. Path pattern: `dist/clientnest-v1.0.0.zip`.                                                                                                                                                                                                                                                                                                                                                                                                             |
| Landing polish                                             | done                         | Walkthrough and one-click demo remain. Purchase/package-proof UI and lead form removed.                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Live hosted demo URL                                       | done                         | https://clientnest-app.netlify.app — optional in README; code uses `NEXT_PUBLIC_DEMO_URL` when set. Harbor logins, Sam/Alex story, read-only.                                                                                                                                                                                                                                                                                                                                                                                   |
| MIT open-source polish                                     | in progress                  | LICENSE holder, support contacts, README env/deploy/contributing, remove `.grok/`, remove purchase UI.                                                                                                                                                                                                                                                                                                                                                                                                                          |

## Weeks 9–13 (optional follow-ups)

| Week | Objective                             | Status      |
| ---- | ------------------------------------- | ----------- |
| 9    | Tutorials and distribution notes      | not started |
| 10   | Broader discovery                     | not started |
| 11   | Install funnel improvements           | not started |
| 12   | v1.0.1 maintenance release            | not started |
| 13   | Adoption / support review             | not started |

## Definition of success (not claimed)

- [ ] New installs from docs in ≤30 minutes
- [ ] No known critical authorization, isolation, or file-access defects
- [ ] Support load stays manageable for a solo maintainer
- [ ] Public demo stays healthy and read-only

## Tooling

Authoritative list: `TOOLING.md`.

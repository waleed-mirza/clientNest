---
name: clientnest-scope
description: Enforce ClientNest v1.0 build scope and exclusions. Use when adding a feature, page, module, dependency, or integration; when the user asks for Stripe, chat, AI, SSO, i18n, time tracking, or extra dashboards; or when they run /clientnest-scope.
---

# ClientNest v1 scope

Authoritative list. Do not expand it without the rule at the bottom.

## v1.0 must include (build now; interviews skipped, not deleted from the plan)

| Module             | Done when                                                                              |
| ------------------ | -------------------------------------------------------------------------------------- |
| Authentication     | Email/password, reset, invite accept, logout; protected routes reject anonymous users  |
| Workspace          | Name, logo, basic theme; owner/member roles                                            |
| Clients            | Company + contacts; create/edit/search/archive                                         |
| Projects           | Status, dates, description, team and client assignment; role-filtered data             |
| Milestones & tasks | Status, due date, assignee, order — not a PM suite                                     |
| Files              | Upload/list/download/delete; unauthorized users cannot use URLs or metadata            |
| Deliverables       | Submit, comments, request approval; client approve or request changes with audit trail |
| Invoices           | Records, line items, status, print layout — **no online payment**                      |
| Activity           | Timeline for create/status/file/approval events                                        |
| Notifications      | In-app center; email adapter that is optional                                          |
| Documentation      | Install, configure, customize, deploy, troubleshoot without live help                  |
| Demo               | Seeded read-only demo and reset; value obvious in under two minutes                    |

## Excluded from v1.0

- Subscription billing, marketplace seller accounts, customer self-signup
- Stripe/PayPal collection, accounting, tax
- Live chat, video, AI assistants, native mobile, offline mode
- Time tracking, contracts, e-signatures, advanced reporting, automation builders
- Multiple languages, RTL, large theme galleries
- Enterprise SSO, custom granular roles, compliance claims
- Redux, ORM, Express/Nest, GraphQL, monorepo, microservices, event bus
- Paid images, fonts, or components buyers cannot redistribute

## Scope-lock rule

An excluded item may enter v1 only with a `DECISIONS.md` row. The original plan also required three interviews naming it purchase-blocking; interviews are **skipped** for starting v1 (founder is the freelancer buyer) but that interview bar stays in the Word plan for later if we reopen validation.

Do not implement excluded items “just in case.”

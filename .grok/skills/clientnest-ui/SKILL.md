---
name: clientnest-ui
description: Visual rules for ClientNest landing, mockups, and product UI. Use for layout, styling, screenshots, empty/loading/error states, accessibility, branding, or when the user runs /clientnest-ui.
---

# ClientNest UI

Buyers rebrand in a weekend by editing CSS variables and, in the app, the owner Settings page. Look like a small studio’s working portal, not a SaaS starter.

Load `frontend-design` for anti-slop process. **This file wins** on tokens, type, and layout.

## Direction (Harbor)

Sage-gray paper, stone ink, **one** accent (oxidized pine, or the workspace preset). Signature: Source Serif 4 on the **workspace name, landing H1, and invoice letterhead only**. IBM Plex Sans for UI and page titles. IBM Plex Mono for numbers and IDs.

Do **not** ship:

- Inter, Geist, Roboto, Poppins, Space Grotesk
- Indigo / purple / lavender / cyan→purple gradients / Tailwind teal-700 as-is
- Cream `#F4F1EA` + serif-everywhere + terracotta (2026 AI default look 1)
- Near-black + acid green (look 2)
- Radius 0 broadsheet (look 3)
- 3 identical feature cards, 5 equal KPI tiles, glassmorphism, bounce-on-hover, `rounded-2xl shadow-lg`, nested cards, colored left borders
- Pure `#fff` / `#000` canvases
- Dark mode as an invert; dark is a first-class palette

Lucide only, 16px, stroke 1.75. One primary action per screen. Explicit status words.

## Tokens

Source: `:root` and `[data-theme]` / `html[data-color-scheme]` in `src/app/globals.css`. Do not scatter hex in components.

Presets (workspace, owner): `harbor` | `slate` | `clay` | `ink`.
Color scheme (user): `light` | `dark` | `system`. Default light. Print is always light.

Map: `--background` paper, `--foreground` ink, `--accent` pine, `--card`/`--surface` raised, `--border` hairline, `--danger` rust.

Status: words first. Optional 6px dot — muted / ink / pine / rust only.

## Type and space

- Scale: 12 / 14 / 16 / 20 / 28 / 40. Letter-spacing 0. No `tracking-tight`.
- Space: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64. Page pad 24 mobile / 40 desktop.
- Radius: 4px controls, 8px panels, 999 avatars/unread only.
- Shadow: none on page; `--shadow-pop` for dialogs/menus.
- Motion: 150ms color/opacity. `prefers-reduced-motion: reduce`.

## Layout

- Lists, not boxes. Full-row hit targets. Dashboard: attention first, compact figures, not equal KPI cards.
- Landing: asymmetric hero, not a 3-card grid. Pricing as a definition list.
- Mobile app: top bar + dialog nav. Do not stack the sidebar above content.
- Project workspace: in-page tabs (Overview / Files / Deliverables / Invoices).
- Client record: in-page tabs (Overview / Contacts / Projects / Invoices).

## Required states

Empty, loading/skeleton, error, success, permission denied. Mobile must work; desktop project work is the priority.

## Accessibility

WCAG 2.1 AA: keyboard order, visible focus, labels, contrast, semantic headings. No icon-only buttons without an accessible name.

## Branding (product)

Owner-only `/app/settings`: name, logo (png/jpeg/webp, no SVG), four presets. Logo bucket `workspace-logos`. Arbitrary CSS in `theme` jsonb is forbidden.

## frontend-design

Enabled as a project plugin. Use it for craft: hierarchy, spacing, empty/error copy, motion restraint, avoiding generic layouts. Do **not** invent a new brand.

## shadcn

Install with the shadcn MCP or `pnpm dlx shadcn@latest add` when a primitive is needed. Restyle generated source to Harbor tokens. Native controls are fine when they match these tokens.

## Landing and mockups

Three mockups: agency dashboard, project workspace, deliverable approval. One Harbor Studio story. Mockup shell must match the product shell.

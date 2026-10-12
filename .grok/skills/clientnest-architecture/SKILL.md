---
name: clientnest-architecture
description: Feature folders, thin routes, Server Actions, no ORM/Redux. Use when adding pages, actions, or data access.
---

# ClientNest architecture

- Routes in `src/app` stay thin: load data, render, redirect.
- Domain logic lives in `src/features/<name>/` (actions, forms, session helpers).
- Shared helpers in `src/lib`. Do not add an ORM, Redux, GraphQL, or Express.
- Mutations are Server Actions (`"use server"`). Revalidate the path you changed.
- Authorization is RLS first, then a server-side role check. Never UI-only.
- Supabase clients: `src/lib/supabase/server.ts` on the server, `client.ts` in the browser. Never import the service-role key.
- One workspace membership is shown in `/app` (oldest membership). Invite accept can add another; do not build a workspace switcher in v1.

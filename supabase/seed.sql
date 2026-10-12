-- Deterministic Harbor Studio demo. Fictional people only (@example.com).
-- Password for every demo user: Harbor-Demo-24
-- Idempotent: safe to re-run against a hosted project.

create extension if not exists pgcrypto with schema extensions;

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token,
  is_sso_user,
  is_anonymous
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-4111-8111-111111111111',
    'authenticated',
    'authenticated',
    'sam.reed@example.com',
    extensions.crypt('Harbor-Demo-24', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Sam Reed"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    '',
    false,
    false
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-4222-8222-222222222222',
    'authenticated',
    'authenticated',
    'riley.chen@example.com',
    extensions.crypt('Harbor-Demo-24', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Riley Chen"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    '',
    false,
    false
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '33333333-3333-4333-8333-333333333333',
    'authenticated',
    'authenticated',
    'alex.marin@example.com',
    extensions.crypt('Harbor-Demo-24', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Alex Marin"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    '',
    false,
    false
  )
on conflict (id) do nothing;

insert into auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111111111',
    jsonb_build_object(
      'sub', '11111111-1111-4111-8111-111111111111',
      'email', 'sam.reed@example.com'
    ),
    'email',
    '11111111-1111-4111-8111-111111111111',
    now(),
    now(),
    now()
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    '22222222-2222-4222-8222-222222222222',
    jsonb_build_object(
      'sub', '22222222-2222-4222-8222-222222222222',
      'email', 'riley.chen@example.com'
    ),
    'email',
    '22222222-2222-4222-8222-222222222222',
    now(),
    now(),
    now()
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    '33333333-3333-4333-8333-333333333333',
    jsonb_build_object(
      'sub', '33333333-3333-4333-8333-333333333333',
      'email', 'alex.marin@example.com'
    ),
    'email',
    '33333333-3333-4333-8333-333333333333',
    now(),
    now(),
    now()
  )
on conflict (provider_id, provider) do nothing;

insert into public.workspaces (id, name, slug, theme)
values (
  '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
  'Harbor Studio',
  'harbor-studio',
  '{"preset":"harbor"}'::jsonb
)
on conflict (id) do update
set
  name = excluded.name,
  slug = excluded.slug,
  theme = excluded.theme;

insert into public.memberships (workspace_id, profile_id, role)
values
  (
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '11111111-1111-4111-8111-111111111111',
    'owner'
  ),
  (
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '22222222-2222-4222-8222-222222222222',
    'member'
  ),
  (
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '33333333-3333-4333-8333-333333333333',
    'client'
  )
on conflict (workspace_id, profile_id) do nothing;

insert into public.invitations (
  id,
  workspace_id,
  email,
  role,
  token,
  expires_at,
  created_by
)
values (
  '11111111-bbbb-4111-8111-bbbbbbbbbbbb',
  '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
  'jordan.hale@example.com',
  'member',
  'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb1',
  now() + interval '30 days',
  '11111111-1111-4111-8111-111111111111'
)
on conflict (id) do nothing;

insert into public.clients (id, workspace_id, name, website, notes)
values
  (
    '11111111-cccc-4111-8111-ccccccccccc1',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    'Pine & Oak Coffee',
    'https://pineandoak.example',
    'Seasonal menu and ordering page. Fictional cafe for the Harbor Studio demo.'
  ),
  (
    '11111111-cccc-4111-8111-ccccccccccc2',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    'North Shore Dental',
    'https://northshore.example',
    'Brand refresh for a fictional clinic.'
  ),
  (
    '11111111-cccc-4111-8111-ccccccccccc3',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    'Fieldnote Journal',
    'https://fieldnote.example',
    'Launch landing page for a fictional independent magazine.'
  )
on conflict (id) do nothing;

insert into public.client_contacts (
  id,
  workspace_id,
  client_id,
  profile_id,
  name,
  email,
  title
)
values
  (
    '11111111-dddd-4111-8111-ddddddddddd1',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '11111111-cccc-4111-8111-ccccccccccc1',
    '33333333-3333-4333-8333-333333333333',
    'Alex Marin',
    'alex.marin@example.com',
    'Owner'
  ),
  (
    '11111111-dddd-4111-8111-ddddddddddd2',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '11111111-cccc-4111-8111-ccccccccccc2',
    null,
    'Priya Shah',
    'priya.shah@example.com',
    'Office manager'
  )
on conflict (id) do nothing;

insert into public.projects (
  id,
  workspace_id,
  client_id,
  name,
  description,
  status,
  start_date,
  due_date
)
values
  (
    '11111111-eeee-4111-8111-eeeeeeeeeee1',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '11111111-cccc-4111-8111-ccccccccccc1',
    'Seasonal menu site',
    'A branded ordering page for the autumn menu, plus a client-facing place to review layouts before print.',
    'awaiting_approval',
    '2026-08-04',
    '2026-09-18'
  ),
  (
    '11111111-eeee-4111-8111-eeeeeeeeeee2',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '11111111-cccc-4111-8111-ccccccccccc2',
    'Brand refresh',
    'Quiet identity update for the clinic: wordmark, appointment cards, and waiting-room posters.',
    'in_progress',
    '2026-08-18',
    '2026-10-02'
  ),
  (
    '11111111-eeee-4111-8111-eeeeeeeeeee3',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '11111111-cccc-4111-8111-ccccccccccc3',
    'Launch landing page',
    'Single-page launch for the winter issue. Approved and handed off.',
    'approved',
    '2026-07-01',
    '2026-08-12'
  )
on conflict (id) do nothing;

insert into public.project_members (id, workspace_id, project_id, profile_id)
values
  (
    '11111111-ffff-4111-8111-fffffffffff1',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '11111111-eeee-4111-8111-eeeeeeeeeee1',
    '11111111-1111-4111-8111-111111111111'
  ),
  (
    '11111111-ffff-4111-8111-fffffffffff2',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '11111111-eeee-4111-8111-eeeeeeeeeee1',
    '22222222-2222-4222-8222-222222222222'
  ),
  (
    '11111111-ffff-4111-8111-fffffffffff3',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '11111111-eeee-4111-8111-eeeeeeeeeee2',
    '11111111-1111-4111-8111-111111111111'
  ),
  (
    '11111111-ffff-4111-8111-fffffffffff4',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '11111111-eeee-4111-8111-eeeeeeeeeee2',
    '22222222-2222-4222-8222-222222222222'
  ),
  (
    '11111111-ffff-4111-8111-fffffffffff5',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '11111111-eeee-4111-8111-eeeeeeeeeee3',
    '11111111-1111-4111-8111-111111111111'
  )
on conflict (id) do nothing;

insert into public.milestones (id, workspace_id, project_id, name, status, due_date, sort_order)
values
  (
    '21111111-aaaa-4111-8111-aaaaaaaaaaa1',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '11111111-eeee-4111-8111-eeeeeeeeeee1',
    'Kickoff & sitemap',
    'done',
    '2026-08-04',
    0
  ),
  (
    '21111111-aaaa-4111-8111-aaaaaaaaaaa2',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '11111111-eeee-4111-8111-eeeeeeeeeee1',
    'Homepage & menu board',
    'in_review',
    '2026-09-18',
    1
  ),
  (
    '21111111-aaaa-4111-8111-aaaaaaaaaaa3',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '11111111-eeee-4111-8111-eeeeeeeeeee1',
    'Ordering flow',
    'planned',
    '2026-10-02',
    2
  ),
  (
    '21111111-aaaa-4111-8111-aaaaaaaaaaa4',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '11111111-eeee-4111-8111-eeeeeeeeeee2',
    'Wordmark exploration',
    'in_progress',
    '2026-09-12',
    0
  ),
  (
    '21111111-aaaa-4111-8111-aaaaaaaaaaa5',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '11111111-eeee-4111-8111-eeeeeeeeeee2',
    'Appointment cards',
    'planned',
    '2026-10-02',
    1
  ),
  (
    '21111111-aaaa-4111-8111-aaaaaaaaaaa6',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '11111111-eeee-4111-8111-eeeeeeeeeee3',
    'Launch page live',
    'done',
    '2026-08-12',
    0
  )
on conflict (id) do nothing;

insert into public.tasks (
  id,
  workspace_id,
  project_id,
  milestone_id,
  assignee_id,
  name,
  status,
  due_date,
  sort_order
)
values
  (
    '31111111-aaaa-4111-8111-aaaaaaaaaaa1',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '11111111-eeee-4111-8111-eeeeeeeeeee1',
    '21111111-aaaa-4111-8111-aaaaaaaaaaa2',
    '22222222-2222-4222-8222-222222222222',
    'Revise hero headline',
    'in_progress',
    '2026-09-12',
    0
  ),
  (
    '31111111-aaaa-4111-8111-aaaaaaaaaaa2',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '11111111-eeee-4111-8111-eeeeeeeeeee1',
    '21111111-aaaa-4111-8111-aaaaaaaaaaa2',
    '11111111-1111-4111-8111-111111111111',
    'Export print PDF',
    'todo',
    '2026-09-16',
    1
  ),
  (
    '31111111-aaaa-4111-8111-aaaaaaaaaaa3',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '11111111-eeee-4111-8111-eeeeeeeeeee1',
    '21111111-aaaa-4111-8111-aaaaaaaaaaa2',
    '33333333-3333-4333-8333-333333333333',
    'Confirm allergen copy',
    'waiting_on_client',
    '2026-09-15',
    2
  ),
  (
    '31111111-aaaa-4111-8111-aaaaaaaaaaa4',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '11111111-eeee-4111-8111-eeeeeeeeeee2',
    '21111111-aaaa-4111-8111-aaaaaaaaaaa4',
    '22222222-2222-4222-8222-222222222222',
    'Draft quiet wordmark options',
    'in_progress',
    '2026-09-20',
    0
  )
on conflict (id) do nothing;

insert into public.activity_events (
  id,
  workspace_id,
  project_id,
  actor_id,
  event_type,
  summary,
  created_at,
  visibility
)
values
  (
    '41111111-aaaa-4111-8111-aaaaaaaaaaa1',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '11111111-eeee-4111-8111-eeeeeeeeeee1',
    '11111111-1111-4111-8111-111111111111',
    'milestone.status',
    'Sam Reed marked Kickoff & sitemap as done',
    now() - interval '3 days',
    'client'
  ),
  (
    '41111111-aaaa-4111-8111-aaaaaaaaaaa2',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '11111111-eeee-4111-8111-eeeeeeeeeee1',
    '22222222-2222-4222-8222-222222222222',
    'file.uploaded',
    'Riley Chen uploaded Menu-board.pdf',
    now() - interval '26 hours',
    'internal'
  ),
  (
    '41111111-aaaa-4111-8111-aaaaaaaaaaa3',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '11111111-eeee-4111-8111-eeeeeeeeeee1',
    '11111111-1111-4111-8111-111111111111',
    'project.status',
    'Sam Reed set status to Awaiting approval',
    now() - interval '2 hours',
    'client'
  ),
  (
    '41111111-aaaa-4111-8111-aaaaaaaaaaa4',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '11111111-eeee-4111-8111-eeeeeeeeeee2',
    '22222222-2222-4222-8222-222222222222',
    'task.created',
    'Riley Chen added Draft quiet wordmark options',
    now() - interval '5 hours',
    'client'
  )
on conflict (id) do update
set
  summary = excluded.summary,
  visibility = excluded.visibility,
  created_at = excluded.created_at;

insert into public.deliverables (
  id,
  workspace_id,
  project_id,
  title,
  note,
  status,
  version,
  created_by,
  requested_at
)
values
  (
    '51111111-aaaa-4111-8111-aaaaaaaaaaa1',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '11111111-eeee-4111-8111-eeeeeeeeeee1',
    'Homepage hero v3',
    'Hero now uses the autumn palette. Headline is still a placeholder pending their tasting notes.',
    'awaiting_approval',
    3,
    '11111111-1111-4111-8111-111111111111',
    now() - interval '2 hours'
  ),
  (
    '51111111-aaaa-4111-8111-aaaaaaaaaaa2',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '11111111-eeee-4111-8111-eeeeeeeeeee3',
    'Launch landing page',
    'Single-page launch for the winter issue. Copy locked and handed off.',
    'approved',
    1,
    '11111111-1111-4111-8111-111111111111',
    now() - interval '20 days'
  )
on conflict (id) do update
set
  title = excluded.title,
  note = excluded.note,
  status = excluded.status,
  version = excluded.version,
  requested_at = excluded.requested_at;

insert into public.deliverable_comments (
  id,
  workspace_id,
  project_id,
  deliverable_id,
  author_id,
  body,
  created_at
)
values
  (
    '61111111-aaaa-4111-8111-aaaaaaaaaaa1',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '11111111-eeee-4111-8111-eeeeeeeeeee1',
    '51111111-aaaa-4111-8111-aaaaaaaaaaa1',
    '22222222-2222-4222-8222-222222222222',
    'Hero now uses the autumn palette. Headline is still a placeholder pending their tasting notes.',
    now() - interval '26 hours'
  ),
  (
    '61111111-aaaa-4111-8111-aaaaaaaaaaa2',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '11111111-eeee-4111-8111-eeeeeeeeeee1',
    '51111111-aaaa-4111-8111-aaaaaaaaaaa1',
    '33333333-3333-4333-8333-333333333333',
    'Please swap the pastry photo for the new croissant shot, and make the allergen line larger.',
    now() - interval '2 hours'
  )
on conflict (id) do update
set
  body = excluded.body,
  created_at = excluded.created_at;

insert into public.invoices (
  id,
  workspace_id,
  client_id,
  project_id,
  number,
  status,
  issue_date,
  due_date,
  notes,
  created_by
)
values
  (
    '71111111-aaaa-4111-8111-aaaaaaaaaaa1',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '11111111-cccc-4111-8111-ccccccccccc1',
    '11111111-eeee-4111-8111-eeeeeeeeeee1',
    'INV-2026-0041',
    'sent',
    '2026-08-20',
    '2026-09-03',
    'Autumn menu site, homepage and board. Record only — no online payment.',
    '11111111-1111-4111-8111-111111111111'
  ),
  (
    '71111111-aaaa-4111-8111-aaaaaaaaaaa2',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '11111111-cccc-4111-8111-ccccccccccc3',
    '11111111-eeee-4111-8111-eeeeeeeeeee3',
    'INV-2026-0038',
    'paid',
    '2026-08-01',
    '2026-08-15',
    'Launch landing page. Marked paid off-platform.',
    '11111111-1111-4111-8111-111111111111'
  )
on conflict (id) do update
set
  status = excluded.status,
  notes = excluded.notes,
  issue_date = excluded.issue_date,
  due_date = excluded.due_date;

insert into public.invoice_items (
  id,
  workspace_id,
  invoice_id,
  description,
  quantity,
  unit_amount_cents,
  sort_order
)
values
  (
    '81111111-aaaa-4111-8111-aaaaaaaaaaa1',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '71111111-aaaa-4111-8111-aaaaaaaaaaa1',
    'Homepage design',
    1,
    180000,
    0
  ),
  (
    '81111111-aaaa-4111-8111-aaaaaaaaaaa2',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '71111111-aaaa-4111-8111-aaaaaaaaaaa1',
    'Menu board layout',
    1,
    65000,
    1
  ),
  (
    '81111111-aaaa-4111-8111-aaaaaaaaaaa3',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '71111111-aaaa-4111-8111-aaaaaaaaaaa2',
    'Launch landing page',
    1,
    240000,
    0
  )
on conflict (id) do update
set
  description = excluded.description,
  quantity = excluded.quantity,
  unit_amount_cents = excluded.unit_amount_cents;

insert into public.notifications (
  id,
  workspace_id,
  recipient_id,
  actor_id,
  event_type,
  title,
  body,
  href,
  created_at,
  read_at
)
values
  (
    '91111111-aaaa-4111-8111-aaaaaaaaaaa1',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '33333333-3333-4333-8333-333333333333',
    '11111111-1111-4111-8111-111111111111',
    'deliverable.submitted',
    'Homepage hero v3 needs a review',
    'Sam Reed asked you to approve this deliverable.',
    '/app/deliverables/51111111-aaaa-4111-8111-aaaaaaaaaaa1',
    now() - interval '2 hours',
    null
  ),
  (
    '91111111-aaaa-4111-8111-aaaaaaaaaaa2',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '11111111-1111-4111-8111-111111111111',
    '33333333-3333-4333-8333-333333333333',
    'deliverable.changes',
    'Changes requested on Homepage hero v3',
    'Alex Marin asked to swap the pastry photo and enlarge the allergen line.',
    '/app/deliverables/51111111-aaaa-4111-8111-aaaaaaaaaaa1',
    now() - interval '2 hours',
    null
  ),
  (
    '91111111-aaaa-4111-8111-aaaaaaaaaaa3',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '11111111-1111-4111-8111-111111111111',
    '33333333-3333-4333-8333-333333333333',
    'deliverable.comment',
    'New comment on Homepage hero v3',
    'Alex Marin: Please swap the pastry photo for the new croissant shot.',
    '/app/deliverables/51111111-aaaa-4111-8111-aaaaaaaaaaa1',
    now() - interval '2 hours',
    null
  ),
  (
    '91111111-aaaa-4111-8111-aaaaaaaaaaa4',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222222',
    'file.uploaded',
    'Riley Chen uploaded Menu-board.pdf',
    'A team-only print file was added to Seasonal menu site.',
    '/app/projects/11111111-eeee-4111-8111-eeeeeeeeeee1?tab=files',
    now() - interval '26 hours',
    null
  ),
  (
    '91111111-aaaa-4111-8111-aaaaaaaaaaa5',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222222',
    'task.waiting',
    'Confirm allergen copy is waiting on the client',
    'Riley Chen marked this task waiting on Alex Marin.',
    '/app/projects/11111111-eeee-4111-8111-eeeeeeeeeee1',
    now() - interval '1 day',
    now() - interval '12 hours'
  ),
  (
    '91111111-aaaa-4111-8111-aaaaaaaaaaa6',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '11111111-1111-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111111111',
    'project.status',
    'Seasonal menu site is awaiting approval',
    'Homepage and menu board are in review with Pine & Oak Coffee.',
    '/app/projects/11111111-eeee-4111-8111-eeeeeeeeeee1',
    now() - interval '2 hours',
    now() - interval '1 hour'
  )
on conflict (id) do nothing;

insert into public.activity_events (
  id,
  workspace_id,
  project_id,
  actor_id,
  event_type,
  summary,
  created_at,
  visibility
)
values
  (
    '41111111-aaaa-4111-8111-aaaaaaaaaaa5',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '11111111-eeee-4111-8111-eeeeeeeeeee1',
    '11111111-1111-4111-8111-111111111111',
    'deliverable.submitted',
    'Sam Reed requested approval on Homepage hero v3',
    now() - interval '2 hours',
    'client'
  ),
  (
    '41111111-aaaa-4111-8111-aaaaaaaaaaa6',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '11111111-eeee-4111-8111-eeeeeeeeeee1',
    '11111111-1111-4111-8111-111111111111',
    'invoice.sent',
    'Sam Reed sent INV-2026-0041',
    now() - interval '3 days',
    'client'
  )
on conflict (id) do update
set
  summary = excluded.summary,
  visibility = excluded.visibility,
  created_at = excluded.created_at;

-- Keep the Harbor Studio demo canonical. Playwright runs leave extra rows.
update public.workspaces
set
  name = 'Harbor Studio',
  slug = 'harbor-studio',
  theme = '{"preset":"harbor"}'::jsonb
where id = '11111111-aaaa-4111-8111-aaaaaaaaaaaa';

delete from public.notifications
where workspace_id = '11111111-aaaa-4111-8111-aaaaaaaaaaaa'
  and id not in (
    '91111111-aaaa-4111-8111-aaaaaaaaaaa1',
    '91111111-aaaa-4111-8111-aaaaaaaaaaa2',
    '91111111-aaaa-4111-8111-aaaaaaaaaaa3',
    '91111111-aaaa-4111-8111-aaaaaaaaaaa4',
    '91111111-aaaa-4111-8111-aaaaaaaaaaa5',
    '91111111-aaaa-4111-8111-aaaaaaaaaaa6'
  );

delete from public.activity_events
where workspace_id = '11111111-aaaa-4111-8111-aaaaaaaaaaaa'
  and id not in (
    '41111111-aaaa-4111-8111-aaaaaaaaaaa1',
    '41111111-aaaa-4111-8111-aaaaaaaaaaa2',
    '41111111-aaaa-4111-8111-aaaaaaaaaaa3',
    '41111111-aaaa-4111-8111-aaaaaaaaaaa4',
    '41111111-aaaa-4111-8111-aaaaaaaaaaa5',
    '41111111-aaaa-4111-8111-aaaaaaaaaaa6'
  );

delete from public.approvals
where workspace_id = '11111111-aaaa-4111-8111-aaaaaaaaaaaa';

delete from public.deliverable_comments
where workspace_id = '11111111-aaaa-4111-8111-aaaaaaaaaaaa'
  and id not in (
    '61111111-aaaa-4111-8111-aaaaaaaaaaa1',
    '61111111-aaaa-4111-8111-aaaaaaaaaaa2'
  );

delete from public.deliverables
where workspace_id = '11111111-aaaa-4111-8111-aaaaaaaaaaaa'
  and id not in (
    '51111111-aaaa-4111-8111-aaaaaaaaaaa1',
    '51111111-aaaa-4111-8111-aaaaaaaaaaa2'
  );

delete from public.invoices
where workspace_id = '11111111-aaaa-4111-8111-aaaaaaaaaaaa'
  and id not in (
    '71111111-aaaa-4111-8111-aaaaaaaaaaa1',
    '71111111-aaaa-4111-8111-aaaaaaaaaaa2'
  );

delete from public.files
where workspace_id = '11111111-aaaa-4111-8111-aaaaaaaaaaaa'
  and id not in (
    '81111111-aaaa-4111-8111-aaaaaaaaaaa1',
    '81111111-aaaa-4111-8111-aaaaaaaaaaa2',
    '81111111-aaaa-4111-8111-aaaaaaaaaaa3'
  );

insert into public.files (
  id,
  workspace_id,
  project_id,
  original_name,
  storage_path,
  mime_type,
  byte_size,
  visibility,
  uploaded_by
)
values
  (
    '81111111-aaaa-4111-8111-aaaaaaaaaaa1',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '11111111-eeee-4111-8111-eeeeeeeeeee1',
    'Homepage-hero-v3.png',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa/11111111-eeee-4111-8111-eeeeeeeeeee1/81111111-aaaa-4111-8111-aaaaaaaaaaa1',
    'image/png',
    1223,
    'client',
    '22222222-2222-4222-8222-222222222222'
  ),
  (
    '81111111-aaaa-4111-8111-aaaaaaaaaaa2',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '11111111-eeee-4111-8111-eeeeeeeeeee1',
    'Menu-board.pdf',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa/11111111-eeee-4111-8111-eeeeeeeeeee1/81111111-aaaa-4111-8111-aaaaaaaaaaa2',
    'application/pdf',
    481,
    'internal',
    '22222222-2222-4222-8222-222222222222'
  ),
  (
    '81111111-aaaa-4111-8111-aaaaaaaaaaa3',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa',
    '11111111-eeee-4111-8111-eeeeeeeeeee1',
    'Brand-tokens.txt',
    '11111111-aaaa-4111-8111-aaaaaaaaaaaa/11111111-eeee-4111-8111-eeeeeeeeeee1/81111111-aaaa-4111-8111-aaaaaaaaaaa3',
    'text/plain',
    314,
    'client',
    '22222222-2222-4222-8222-222222222222'
  )
on conflict (id) do update
set
  original_name = excluded.original_name,
  storage_path = excluded.storage_path,
  mime_type = excluded.mime_type,
  byte_size = excluded.byte_size,
  visibility = excluded.visibility;

delete from public.tasks
where workspace_id = '11111111-aaaa-4111-8111-aaaaaaaaaaaa'
  and id not in (
    '31111111-aaaa-4111-8111-aaaaaaaaaaa1',
    '31111111-aaaa-4111-8111-aaaaaaaaaaa2',
    '31111111-aaaa-4111-8111-aaaaaaaaaaa3',
    '31111111-aaaa-4111-8111-aaaaaaaaaaa4'
  );

delete from public.milestones
where workspace_id = '11111111-aaaa-4111-8111-aaaaaaaaaaaa'
  and id not in (
    '21111111-aaaa-4111-8111-aaaaaaaaaaa1',
    '21111111-aaaa-4111-8111-aaaaaaaaaaa2',
    '21111111-aaaa-4111-8111-aaaaaaaaaaa3',
    '21111111-aaaa-4111-8111-aaaaaaaaaaa4',
    '21111111-aaaa-4111-8111-aaaaaaaaaaa5',
    '21111111-aaaa-4111-8111-aaaaaaaaaaa6'
  );

delete from public.projects
where workspace_id = '11111111-aaaa-4111-8111-aaaaaaaaaaaa'
  and id not in (
    '11111111-eeee-4111-8111-eeeeeeeeeee1',
    '11111111-eeee-4111-8111-eeeeeeeeeee2',
    '11111111-eeee-4111-8111-eeeeeeeeeee3'
  );

delete from public.clients
where workspace_id = '11111111-aaaa-4111-8111-aaaaaaaaaaaa'
  and id not in (
    '11111111-cccc-4111-8111-ccccccccccc1',
    '11111111-cccc-4111-8111-ccccccccccc2',
    '11111111-cccc-4111-8111-ccccccccccc3'
  );

-- Deliverables, comments, immutable approvals, invoices, and notifications.
-- RLS is the authorization boundary. Email stays an optional adapter in the app.

create type public.deliverable_status as enum (
  'draft',
  'awaiting_approval',
  'changes_requested',
  'approved'
);

create type public.approval_decision as enum (
  'approved',
  'changes_requested'
);

create type public.invoice_status as enum (
  'draft',
  'sent',
  'paid',
  'void'
);

create table public.deliverables (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  file_id uuid references public.files (id) on delete set null,
  title text not null check (char_length(title) between 2 and 80),
  note text check (note is null or char_length(note) between 2 and 2000),
  status public.deliverable_status not null default 'draft',
  version integer not null default 1 check (version >= 1),
  created_by uuid references public.profiles (id) on delete set null,
  requested_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.deliverable_comments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  deliverable_id uuid not null references public.deliverables (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete restrict,
  body text not null check (char_length(body) between 2 and 2000),
  created_at timestamptz not null default now()
);

create table public.approvals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  deliverable_id uuid not null references public.deliverables (id) on delete cascade,
  actor_id uuid not null references public.profiles (id) on delete restrict,
  decision public.approval_decision not null,
  note text check (
    (
      decision = 'approved'
      and (note is null or char_length(note) between 2 and 2000)
    )
    or (
      decision = 'changes_requested'
      and note is not null
      and char_length(note) between 2 and 2000
    )
  ),
  created_at timestamptz not null default now()
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete restrict,
  project_id uuid not null references public.projects (id) on delete restrict,
  number text not null check (number ~ '^INV-[0-9]{4}-[0-9]{4}$'),
  status public.invoice_status not null default 'draft',
  issue_date date not null default (timezone('utc', now()))::date,
  due_date date,
  notes text check (notes is null or char_length(notes) <= 2000),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, number)
);

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  description text not null check (char_length(description) between 2 and 80),
  quantity numeric(10, 2) not null check (quantity > 0 and quantity <= 9999.99),
  unit_amount_cents integer not null check (unit_amount_cents >= 0 and unit_amount_cents <= 10000000),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  event_type text not null check (char_length(event_type) between 2 and 40),
  title text not null check (char_length(title) between 2 and 80),
  body text not null check (char_length(body) between 2 and 240),
  href text not null check (char_length(href) between 1 and 200),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index deliverables_project_id_idx on public.deliverables (project_id, created_at desc);
create index deliverable_comments_deliverable_id_idx
  on public.deliverable_comments (deliverable_id, created_at);
create index approvals_deliverable_id_idx on public.approvals (deliverable_id, created_at);
create index invoices_workspace_id_idx on public.invoices (workspace_id, created_at desc);
create index invoices_client_id_idx on public.invoices (client_id);
create index invoices_project_id_idx on public.invoices (project_id);
create index invoice_items_invoice_id_idx on public.invoice_items (invoice_id, sort_order);
create index notifications_recipient_id_idx
  on public.notifications (recipient_id, read_at, created_at desc);

create trigger deliverables_updated_at
  before update on public.deliverables
  for each row execute function public.set_updated_at();

create trigger invoices_updated_at
  before update on public.invoices
  for each row execute function public.set_updated_at();

create trigger deliverables_align_workspace
  before insert or update on public.deliverables
  for each row execute function public.project_child_align_workspace();

create or replace function public.deliverables_validate_file()
returns trigger
language plpgsql
as $$
begin
  if new.file_id is not null and not exists (
    select 1
    from public.files f
    where f.id = new.file_id
      and f.project_id = new.project_id
      and f.visibility = 'client'
  ) then
    raise exception 'Deliverable file must be a client-shared file on the same project';
  end if;
  return new;
end;
$$;

create trigger deliverables_validate_file
  before insert or update on public.deliverables
  for each row execute function public.deliverables_validate_file();

create or replace function public.deliverable_child_align()
returns trigger
language plpgsql
as $$
declare
  ws uuid;
  pid uuid;
begin
  select d.workspace_id, d.project_id into ws, pid
  from public.deliverables d
  where d.id = new.deliverable_id;
  if ws is null then
    raise exception 'Deliverable not found';
  end if;
  new.workspace_id := ws;
  new.project_id := pid;
  return new;
end;
$$;

create trigger deliverable_comments_align
  before insert or update on public.deliverable_comments
  for each row execute function public.deliverable_child_align();

create trigger approvals_align
  before insert or update on public.approvals
  for each row execute function public.deliverable_child_align();

create or replace function public.invoices_align_and_validate()
returns trigger
language plpgsql
as $$
declare
  ws uuid;
  cid uuid;
begin
  select p.workspace_id, p.client_id into ws, cid
  from public.projects p
  where p.id = new.project_id;
  if ws is null then
    raise exception 'Project not found';
  end if;
  new.workspace_id := ws;
  if new.client_id is distinct from cid then
    raise exception 'Invoice client must match the project client';
  end if;
  if new.due_date is not null and new.issue_date is not null and new.due_date < new.issue_date then
    raise exception 'Invoice due date cannot be before the issue date';
  end if;
  return new;
end;
$$;

create trigger invoices_align_and_validate
  before insert or update on public.invoices
  for each row execute function public.invoices_align_and_validate();

create or replace function public.invoice_items_align_workspace()
returns trigger
language plpgsql
as $$
declare
  ws uuid;
begin
  select i.workspace_id into ws from public.invoices i where i.id = new.invoice_id;
  if ws is null then
    raise exception 'Invoice not found';
  end if;
  new.workspace_id := ws;
  return new;
end;
$$;

create trigger invoice_items_align_workspace
  before insert or update on public.invoice_items
  for each row execute function public.invoice_items_align_workspace();

create or replace function public.can_see_deliverable(did uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.deliverables d
    where d.id = did
      and public.can_see_project(d.project_id)
      and (
        public.is_internal_member(d.workspace_id)
        or d.status <> 'draft'
      )
  );
$$;

create or replace function public.can_see_invoice(iid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.invoices i
    where i.id = iid
      and (
        public.is_internal_member(i.workspace_id)
        or (
          public.is_client_contact_of(i.client_id)
          and i.status in ('sent', 'paid')
        )
      )
  );
$$;

create or replace function public.invoice_is_draft(iid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.invoices i
    where i.id = iid
      and i.status = 'draft'
  );
$$;

create or replace function public.approvals_apply_decision()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_status public.deliverable_status;
  client_id uuid;
begin
  select d.status into current_status
  from public.deliverables d
  where d.id = new.deliverable_id
  for update;

  if auth.uid() is not null then
    if current_status is distinct from 'awaiting_approval' then
      raise exception 'Deliverable is not awaiting approval';
    end if;

    select p.client_id into client_id
    from public.projects p
    where p.id = new.project_id;

    if not public.is_client_contact_of(client_id) then
      raise exception 'Only the assigned client can decide';
    end if;

    if new.actor_id is distinct from auth.uid() then
      raise exception 'Approval actor must be the signed-in user';
    end if;

    update public.deliverables
    set status = case new.decision
      when 'approved' then 'approved'::public.deliverable_status
      else 'changes_requested'::public.deliverable_status
    end
    where id = new.deliverable_id;
  end if;

  return new;
end;
$$;

create trigger approvals_apply_decision
  before insert on public.approvals
  for each row execute function public.approvals_apply_decision();

create or replace function public.notifications_guard_update()
returns trigger
language plpgsql
as $$
begin
  if new.workspace_id is distinct from old.workspace_id
    or new.recipient_id is distinct from old.recipient_id
    or new.actor_id is distinct from old.actor_id
    or new.event_type is distinct from old.event_type
    or new.title is distinct from old.title
    or new.body is distinct from old.body
    or new.href is distinct from old.href
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Notifications can only be marked as read';
  end if;
  if old.read_at is not null and new.read_at is distinct from old.read_at then
    raise exception 'Notifications can only be marked as read';
  end if;
  return new;
end;
$$;

create trigger notifications_guard_update
  before update on public.notifications
  for each row execute function public.notifications_guard_update();

-- Clients need to write their own activity (approval, comments).
drop policy if exists activity_events_insert on public.activity_events;
create policy activity_events_insert on public.activity_events
  for insert to authenticated
  with check (
    actor_id = auth.uid()
    and public.can_see_project(project_id)
  );

alter table public.deliverables enable row level security;
alter table public.deliverables force row level security;
alter table public.deliverable_comments enable row level security;
alter table public.deliverable_comments force row level security;
alter table public.approvals enable row level security;
alter table public.approvals force row level security;
alter table public.invoices enable row level security;
alter table public.invoices force row level security;
alter table public.invoice_items enable row level security;
alter table public.invoice_items force row level security;
alter table public.notifications enable row level security;
alter table public.notifications force row level security;

create policy deliverables_select on public.deliverables
  for select to authenticated
  using (public.can_see_deliverable(id));

create policy deliverables_insert on public.deliverables
  for insert to authenticated
  with check (public.is_internal_member(workspace_id));

create policy deliverables_update on public.deliverables
  for update to authenticated
  using (public.is_internal_member(workspace_id))
  with check (public.is_internal_member(workspace_id));

create policy deliverable_comments_select on public.deliverable_comments
  for select to authenticated
  using (public.can_see_deliverable(deliverable_id));

create policy deliverable_comments_insert on public.deliverable_comments
  for insert to authenticated
  with check (
    author_id = auth.uid()
    and public.can_see_deliverable(deliverable_id)
  );

create policy approvals_select on public.approvals
  for select to authenticated
  using (public.can_see_deliverable(deliverable_id));

create policy approvals_insert on public.approvals
  for insert to authenticated
  with check (
    actor_id = auth.uid()
    and public.can_see_deliverable(deliverable_id)
  );

create policy invoices_select on public.invoices
  for select to authenticated
  using (public.can_see_invoice(id));

create policy invoices_insert on public.invoices
  for insert to authenticated
  with check (public.is_internal_member(workspace_id));

create policy invoices_update on public.invoices
  for update to authenticated
  using (public.is_internal_member(workspace_id))
  with check (public.is_internal_member(workspace_id));

create policy invoice_items_select on public.invoice_items
  for select to authenticated
  using (public.can_see_invoice(invoice_id));

create policy invoice_items_insert on public.invoice_items
  for insert to authenticated
  with check (
    public.is_internal_member(workspace_id)
    and public.invoice_is_draft(invoice_id)
  );

create policy invoice_items_delete on public.invoice_items
  for delete to authenticated
  using (
    public.is_internal_member(workspace_id)
    and public.invoice_is_draft(invoice_id)
  );

create policy notifications_select on public.notifications
  for select to authenticated
  using (recipient_id = auth.uid());

create policy notifications_insert on public.notifications
  for insert to authenticated
  with check (
    public.is_workspace_member(workspace_id)
    and exists (
      select 1
      from public.memberships m
      where m.workspace_id = notifications.workspace_id
        and m.profile_id = recipient_id
    )
  );

create policy notifications_update on public.notifications
  for update to authenticated
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

revoke all on function public.can_see_deliverable(uuid) from public;
revoke all on function public.can_see_invoice(uuid) from public;
revoke all on function public.invoice_is_draft(uuid) from public;

grant execute on function public.can_see_deliverable(uuid) to authenticated;
grant execute on function public.can_see_invoice(uuid) to authenticated;
grant execute on function public.invoice_is_draft(uuid) to authenticated;

grant select, insert, update on public.deliverables to authenticated;
grant select, insert on public.deliverable_comments to authenticated;
grant select, insert on public.approvals to authenticated;
grant select, insert, update on public.invoices to authenticated;
grant select, insert, delete on public.invoice_items to authenticated;
grant select, insert, update on public.notifications to authenticated;

revoke all on public.deliverables from anon;
revoke all on public.deliverable_comments from anon;
revoke all on public.approvals from anon;
revoke all on public.invoices from anon;
revoke all on public.invoice_items from anon;
revoke all on public.notifications from anon;

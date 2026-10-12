-- Clients, contacts, projects, and internal project members.
-- RLS is the authorization boundary. Enable and force it before the app uses these tables.

create type public.project_status as enum (
  'planned',
  'in_progress',
  'awaiting_approval',
  'approved'
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null check (char_length(name) between 2 and 80),
  website text check (website is null or char_length(website) between 8 and 200),
  notes text check (notes is null or char_length(notes) <= 2000),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.client_contacts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  profile_id uuid references public.profiles (id) on delete set null,
  name text not null check (char_length(name) between 2 and 80),
  email text not null check (char_length(email) between 3 and 254),
  title text check (title is null or char_length(title) <= 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete restrict,
  name text not null check (char_length(name) between 2 and 80),
  description text check (description is null or char_length(description) <= 2000),
  status public.project_status not null default 'planned',
  start_date date,
  due_date date,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (project_id, profile_id)
);

create index clients_workspace_id_idx on public.clients (workspace_id);
create index clients_workspace_archived_idx on public.clients (workspace_id, archived_at);
create index client_contacts_client_id_idx on public.client_contacts (client_id);
create index client_contacts_profile_id_idx on public.client_contacts (profile_id);
create unique index client_contacts_email_idx
  on public.client_contacts (client_id, lower(email));
create index projects_workspace_id_idx on public.projects (workspace_id);
create index projects_client_id_idx on public.projects (client_id);
create index projects_workspace_status_idx on public.projects (workspace_id, status);
create index project_members_profile_id_idx on public.project_members (profile_id);

create trigger clients_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

create trigger client_contacts_updated_at
  before update on public.client_contacts
  for each row execute function public.set_updated_at();

create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- Keep denormalized workspace_id aligned with the parent row.
create or replace function public.client_contacts_align_workspace()
returns trigger
language plpgsql
as $$
declare
  ws uuid;
begin
  select c.workspace_id into ws from public.clients c where c.id = new.client_id;
  if ws is null then
    raise exception 'Client not found';
  end if;
  new.workspace_id := ws;

  if new.profile_id is not null and not exists (
    select 1
    from public.memberships m
    where m.workspace_id = new.workspace_id
      and m.profile_id = new.profile_id
  ) then
    raise exception 'Contact profile must belong to the workspace';
  end if;

  return new;
end;
$$;

create trigger client_contacts_align_workspace
  before insert or update on public.client_contacts
  for each row execute function public.client_contacts_align_workspace();

create or replace function public.projects_align_workspace()
returns trigger
language plpgsql
as $$
declare
  ws uuid;
begin
  select c.workspace_id into ws from public.clients c where c.id = new.client_id;
  if ws is null then
    raise exception 'Client not found';
  end if;
  new.workspace_id := ws;
  return new;
end;
$$;

create trigger projects_align_workspace
  before insert or update on public.projects
  for each row execute function public.projects_align_workspace();

create or replace function public.project_members_align_workspace()
returns trigger
language plpgsql
as $$
declare
  ws uuid;
begin
  select p.workspace_id into ws from public.projects p where p.id = new.project_id;
  if ws is null then
    raise exception 'Project not found';
  end if;
  new.workspace_id := ws;

  if not exists (
    select 1
    from public.memberships m
    where m.workspace_id = new.workspace_id
      and m.profile_id = new.profile_id
  ) then
    raise exception 'Project member must belong to the workspace';
  end if;

  return new;
end;
$$;

create trigger project_members_align_workspace
  before insert or update on public.project_members
  for each row execute function public.project_members_align_workspace();

create or replace function public.is_internal_member(ws uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.workspace_role(ws) in ('owner', 'manager', 'member');
$$;

create or replace function public.is_client_contact_of(cid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.client_contacts cc
    where cc.client_id = cid
      and cc.profile_id = auth.uid()
  );
$$;

create or replace function public.profile_id_for_workspace_email(ws uuid, lookup_email text)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select u.id
  from auth.users u
  join public.memberships m on m.profile_id = u.id
  where m.workspace_id = ws
    and lower(u.email) = lower(lookup_email)
    and public.is_internal_member(ws)
  limit 1;
$$;

alter table public.clients enable row level security;
alter table public.clients force row level security;
alter table public.client_contacts enable row level security;
alter table public.client_contacts force row level security;
alter table public.projects enable row level security;
alter table public.projects force row level security;
alter table public.project_members enable row level security;
alter table public.project_members force row level security;

create policy clients_select on public.clients
  for select to authenticated
  using (
    public.is_internal_member(workspace_id)
    or public.is_client_contact_of(id)
  );

create policy clients_insert on public.clients
  for insert to authenticated
  with check (public.is_internal_member(workspace_id));

create policy clients_update on public.clients
  for update to authenticated
  using (public.is_internal_member(workspace_id))
  with check (public.is_internal_member(workspace_id));

create policy client_contacts_select on public.client_contacts
  for select to authenticated
  using (
    public.is_internal_member(workspace_id)
    or profile_id = auth.uid()
    or public.is_client_contact_of(client_id)
  );

create policy client_contacts_insert on public.client_contacts
  for insert to authenticated
  with check (public.is_internal_member(workspace_id));

create policy client_contacts_update on public.client_contacts
  for update to authenticated
  using (public.is_internal_member(workspace_id))
  with check (public.is_internal_member(workspace_id));

create policy client_contacts_delete on public.client_contacts
  for delete to authenticated
  using (public.is_internal_member(workspace_id));

create policy projects_select on public.projects
  for select to authenticated
  using (
    public.is_internal_member(workspace_id)
    or public.is_client_contact_of(client_id)
  );

create policy projects_insert on public.projects
  for insert to authenticated
  with check (public.is_internal_member(workspace_id));

create policy projects_update on public.projects
  for update to authenticated
  using (public.is_internal_member(workspace_id))
  with check (public.is_internal_member(workspace_id));

create policy project_members_select on public.project_members
  for select to authenticated
  using (
    public.is_internal_member(workspace_id)
    or profile_id = auth.uid()
    or exists (
      select 1
      from public.projects p
      where p.id = project_id
        and public.is_client_contact_of(p.client_id)
    )
  );

create policy project_members_insert on public.project_members
  for insert to authenticated
  with check (public.is_internal_member(workspace_id));

create policy project_members_delete on public.project_members
  for delete to authenticated
  using (public.is_internal_member(workspace_id));

-- Link matching contacts when a client (or anyone) accepts an invite.
create or replace function public.accept_invitation(invite_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  inv public.invitations%rowtype;
  uid uuid;
  user_email text;
begin
  uid := auth.uid();
  if uid is null then
    raise exception 'Not signed in';
  end if;

  user_email := lower(coalesce(auth.jwt() ->> 'email', ''));

  select * into inv
  from public.invitations
  where token = invite_token
  for update;

  if not found then
    raise exception 'Invite not found';
  end if;

  if inv.accepted_at is not null then
    raise exception 'Invite already accepted';
  end if;

  if inv.expires_at <= now() then
    raise exception 'Invite expired';
  end if;

  if lower(inv.email) <> user_email then
    raise exception 'This invite is for a different email';
  end if;

  insert into public.memberships (workspace_id, profile_id, role)
  values (inv.workspace_id, uid, inv.role)
  on conflict (workspace_id, profile_id) do nothing;

  update public.invitations
  set accepted_at = now()
  where id = inv.id;

  update public.client_contacts
  set profile_id = uid
  where workspace_id = inv.workspace_id
    and lower(email) = user_email
    and profile_id is null;

  return inv.workspace_id;
end;
$$;

revoke all on function public.is_internal_member(uuid) from public;
revoke all on function public.is_client_contact_of(uuid) from public;
revoke all on function public.profile_id_for_workspace_email(uuid, text) from public;

grant execute on function public.is_internal_member(uuid) to authenticated;
grant execute on function public.is_client_contact_of(uuid) to authenticated;
grant execute on function public.profile_id_for_workspace_email(uuid, text) to authenticated;

grant select, insert, update on public.clients to authenticated;
grant select, insert, update, delete on public.client_contacts to authenticated;
grant select, insert, update on public.projects to authenticated;
grant select, insert, update, delete on public.project_members to authenticated;

revoke all on public.clients from anon;
revoke all on public.client_contacts from anon;
revoke all on public.projects from anon;
revoke all on public.project_members from anon;

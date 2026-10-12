-- Workspace tenancy, profiles, memberships, invitations.
-- RLS is the authorization boundary. Enable it before the app uses these tables.

create type public.membership_role as enum ('owner', 'manager', 'member', 'client');

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  logo_path text,
  theme jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role public.membership_role not null,
  created_at timestamptz not null default now(),
  unique (workspace_id, profile_id)
);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  email text not null,
  role public.membership_role not null,
  token text not null unique,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index memberships_profile_id_idx on public.memberships (profile_id);
create index memberships_workspace_id_idx on public.memberships (workspace_id);
create index invitations_email_idx on public.invitations (lower(email));

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger workspaces_updated_at
  before update on public.workspaces
  for each row execute function public.set_updated_at();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- New auth user → profile row. Never expose service role to the client.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- First workspace insert makes the current user the owner.
create or replace function public.handle_new_workspace()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'workspace insert requires an authenticated user';
  end if;
  insert into public.memberships (workspace_id, profile_id, role)
  values (new.id, auth.uid(), 'owner');
  return new;
end;
$$;

create trigger on_workspace_created
  after insert on public.workspaces
  for each row execute function public.handle_new_workspace();

-- SECURITY DEFINER helpers so RLS on memberships does not recurse.
create or replace function public.is_workspace_member(ws uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships m
    where m.workspace_id = ws
      and m.profile_id = auth.uid()
  );
$$;

create or replace function public.workspace_role(ws uuid)
returns public.membership_role
language sql
stable
security definer
set search_path = public
as $$
  select m.role
  from public.memberships m
  where m.workspace_id = ws
    and m.profile_id = auth.uid()
  limit 1;
$$;

alter table public.workspaces enable row level security;
alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.invitations enable row level security;

create policy workspaces_select on public.workspaces
  for select to authenticated
  using (public.is_workspace_member(id));

create policy workspaces_insert on public.workspaces
  for insert to authenticated
  with check (auth.uid() is not null);

create policy workspaces_update on public.workspaces
  for update to authenticated
  using (public.workspace_role(id) = 'owner')
  with check (public.workspace_role(id) = 'owner');

create policy profiles_select on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or exists (
      select 1
      from public.memberships mine
      join public.memberships theirs
        on mine.workspace_id = theirs.workspace_id
      where mine.profile_id = auth.uid()
        and theirs.profile_id = profiles.id
    )
  );

create policy profiles_update on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy memberships_select on public.memberships
  for select to authenticated
  using (public.is_workspace_member(workspace_id));

create policy memberships_insert on public.memberships
  for insert to authenticated
  with check (public.workspace_role(workspace_id) in ('owner', 'manager'));

create policy memberships_update on public.memberships
  for update to authenticated
  using (public.workspace_role(workspace_id) = 'owner')
  with check (public.workspace_role(workspace_id) = 'owner');

create policy memberships_delete on public.memberships
  for delete to authenticated
  using (
    public.workspace_role(workspace_id) = 'owner'
    and profile_id <> auth.uid()
  );

create policy invitations_select on public.invitations
  for select to authenticated
  using (
    public.is_workspace_member(workspace_id)
    or (accepted_at is null and lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')))
  );

create policy invitations_insert on public.invitations
  for insert to authenticated
  with check (public.workspace_role(workspace_id) in ('owner', 'manager'));

create policy invitations_update on public.invitations
  for update to authenticated
  using (
    public.workspace_role(workspace_id) in ('owner', 'manager')
    or (
      accepted_at is null
      and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.workspaces to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.memberships to authenticated;
grant select, insert, update, delete on public.invitations to authenticated;

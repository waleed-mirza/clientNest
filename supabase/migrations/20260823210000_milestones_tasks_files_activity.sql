-- Milestones, tasks, secure project files, and activity.
-- RLS is the authorization boundary. Storage objects use non-guessable paths.

create type public.milestone_status as enum (
  'planned',
  'in_progress',
  'in_review',
  'done'
);

create type public.task_status as enum (
  'todo',
  'in_progress',
  'waiting_on_client',
  'done'
);

create type public.file_visibility as enum ('internal', 'client');

create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  name text not null check (char_length(name) between 2 and 80),
  status public.milestone_status not null default 'planned',
  due_date date,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  milestone_id uuid references public.milestones (id) on delete set null,
  assignee_id uuid references public.profiles (id) on delete set null,
  name text not null check (char_length(name) between 2 and 80),
  status public.task_status not null default 'todo',
  due_date date,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.files (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  original_name text not null check (char_length(original_name) between 1 and 80),
  storage_path text not null unique check (char_length(storage_path) between 10 and 200),
  mime_type text not null check (char_length(mime_type) between 3 and 100),
  byte_size integer not null check (byte_size > 0 and byte_size <= 10485760),
  visibility public.file_visibility not null default 'internal',
  uploaded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.activity_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  event_type text not null check (char_length(event_type) between 2 and 40),
  summary text not null check (char_length(summary) between 2 and 240),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index milestones_project_id_idx on public.milestones (project_id, sort_order);
create index tasks_project_id_idx on public.tasks (project_id, sort_order);
create index tasks_milestone_id_idx on public.tasks (milestone_id);
create index files_project_id_idx on public.files (project_id);
create index files_workspace_id_idx on public.files (workspace_id);
create index activity_events_project_id_idx on public.activity_events (project_id, created_at desc);
create index activity_events_workspace_id_idx on public.activity_events (workspace_id, created_at desc);

create trigger milestones_updated_at
  before update on public.milestones
  for each row execute function public.set_updated_at();

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

create or replace function public.project_child_align_workspace()
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
  return new;
end;
$$;

create trigger milestones_align_workspace
  before insert or update on public.milestones
  for each row execute function public.project_child_align_workspace();

create trigger tasks_align_workspace
  before insert or update on public.tasks
  for each row execute function public.project_child_align_workspace();

create trigger files_align_workspace
  before insert or update on public.files
  for each row execute function public.project_child_align_workspace();

create trigger activity_events_align_workspace
  before insert or update on public.activity_events
  for each row execute function public.project_child_align_workspace();

create or replace function public.tasks_validate_refs()
returns trigger
language plpgsql
as $$
begin
  if new.milestone_id is not null and not exists (
    select 1
    from public.milestones m
    where m.id = new.milestone_id
      and m.project_id = new.project_id
  ) then
    raise exception 'Milestone must belong to the project';
  end if;

  if new.assignee_id is not null and not exists (
    select 1
    from public.memberships m
    where m.workspace_id = new.workspace_id
      and m.profile_id = new.assignee_id
  ) then
    raise exception 'Assignee must belong to the workspace';
  end if;

  return new;
end;
$$;

create trigger tasks_validate_refs
  before insert or update on public.tasks
  for each row execute function public.tasks_validate_refs();

create or replace function public.can_see_project(pid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.projects p
    where p.id = pid
      and (
        public.is_internal_member(p.workspace_id)
        or public.is_client_contact_of(p.client_id)
      )
  );
$$;

create or replace function public.can_access_file(fid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.files f
    join public.projects p on p.id = f.project_id
    where f.id = fid
      and (
        public.is_internal_member(f.workspace_id)
        or (
          f.visibility = 'client'
          and public.is_client_contact_of(p.client_id)
        )
      )
  );
$$;

create or replace function public.file_id_from_storage_name(object_name text)
returns uuid
language plpgsql
stable
security definer
set search_path = public, storage
as $$
begin
  return storage.filename(object_name)::uuid;
exception
  when others then
    return null;
end;
$$;

alter table public.milestones enable row level security;
alter table public.milestones force row level security;
alter table public.tasks enable row level security;
alter table public.tasks force row level security;
alter table public.files enable row level security;
alter table public.files force row level security;
alter table public.activity_events enable row level security;
alter table public.activity_events force row level security;

create policy milestones_select on public.milestones
  for select to authenticated
  using (public.can_see_project(project_id));

create policy milestones_insert on public.milestones
  for insert to authenticated
  with check (public.is_internal_member(workspace_id));

create policy milestones_update on public.milestones
  for update to authenticated
  using (public.is_internal_member(workspace_id))
  with check (public.is_internal_member(workspace_id));

create policy milestones_delete on public.milestones
  for delete to authenticated
  using (public.is_internal_member(workspace_id));

create policy tasks_select on public.tasks
  for select to authenticated
  using (public.can_see_project(project_id));

create policy tasks_insert on public.tasks
  for insert to authenticated
  with check (public.is_internal_member(workspace_id));

create policy tasks_update on public.tasks
  for update to authenticated
  using (public.is_internal_member(workspace_id))
  with check (public.is_internal_member(workspace_id));

create policy tasks_delete on public.tasks
  for delete to authenticated
  using (public.is_internal_member(workspace_id));

create policy files_select on public.files
  for select to authenticated
  using (public.can_access_file(id));

create policy files_insert on public.files
  for insert to authenticated
  with check (public.is_internal_member(workspace_id));

create policy files_delete on public.files
  for delete to authenticated
  using (public.is_internal_member(workspace_id));

create policy activity_events_select on public.activity_events
  for select to authenticated
  using (public.can_see_project(project_id));

create policy activity_events_insert on public.activity_events
  for insert to authenticated
  with check (
    public.is_internal_member(workspace_id)
    and actor_id = auth.uid()
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-files',
  'project-files',
  false,
  10485760,
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'text/plain',
    'text/csv'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists project_files_select on storage.objects;
drop policy if exists project_files_insert on storage.objects;
drop policy if exists project_files_delete on storage.objects;

create policy project_files_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'project-files'
    and public.can_access_file(public.file_id_from_storage_name(name))
  );

create policy project_files_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'project-files'
    and public.is_internal_member((storage.foldername(name))[1]::uuid)
    and public.can_access_file(public.file_id_from_storage_name(name))
  );

create policy project_files_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'project-files'
    and public.is_internal_member((storage.foldername(name))[1]::uuid)
  );

revoke all on function public.can_see_project(uuid) from public;
revoke all on function public.can_access_file(uuid) from public;
revoke all on function public.file_id_from_storage_name(text) from public;

grant execute on function public.can_see_project(uuid) to authenticated;
grant execute on function public.can_access_file(uuid) to authenticated;
grant execute on function public.file_id_from_storage_name(text) to authenticated;

grant select, insert, update, delete on public.milestones to authenticated;
grant select, insert, update, delete on public.tasks to authenticated;
grant select, insert, delete on public.files to authenticated;
grant select, insert on public.activity_events to authenticated;

revoke all on public.milestones from anon;
revoke all on public.tasks from anon;
revoke all on public.files from anon;
revoke all on public.activity_events from anon;

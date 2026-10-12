-- Workspace logos for owner branding. Private bucket; members can read, owner writes.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'workspace-logos',
  'workspace-logos',
  false,
  524288,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists workspace_logos_select on storage.objects;
drop policy if exists workspace_logos_insert on storage.objects;
drop policy if exists workspace_logos_update on storage.objects;
drop policy if exists workspace_logos_delete on storage.objects;

create policy workspace_logos_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'workspace-logos'
    and public.is_workspace_member((storage.foldername(name))[1]::uuid)
  );

create policy workspace_logos_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'workspace-logos'
    and public.workspace_role((storage.foldername(name))[1]::uuid) = 'owner'
    and storage.filename(name) = 'logo'
  );

create policy workspace_logos_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'workspace-logos'
    and public.workspace_role((storage.foldername(name))[1]::uuid) = 'owner'
  )
  with check (
    bucket_id = 'workspace-logos'
    and public.workspace_role((storage.foldername(name))[1]::uuid) = 'owner'
    and storage.filename(name) = 'logo'
  );

create policy workspace_logos_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'workspace-logos'
    and public.workspace_role((storage.foldername(name))[1]::uuid) = 'owner'
  );

alter table public.workspaces
  drop constraint if exists workspaces_theme_preset_check;

alter table public.workspaces
  add constraint workspaces_theme_preset_check
  check (
    theme = '{}'::jsonb
    or (theme->>'preset') in ('harbor', 'slate', 'clay', 'ink')
  );

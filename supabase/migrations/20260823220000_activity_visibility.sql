-- Team-only file events must not appear on the client timeline.

alter table public.activity_events
  add column visibility public.file_visibility not null default 'client';

drop policy if exists activity_events_select on public.activity_events;

create policy activity_events_select on public.activity_events
  for select to authenticated
  using (
    public.can_see_project(project_id)
    and (
      visibility = 'client'
      or public.is_internal_member(workspace_id)
    )
  );

update public.activity_events ae
set visibility = 'internal'
from public.files f
where ae.event_type in ('file.uploaded', 'file.deleted')
  and f.workspace_id = ae.workspace_id
  and f.project_id = ae.project_id
  and f.visibility = 'internal'
  and ae.summary like '%' || f.original_name || '%';

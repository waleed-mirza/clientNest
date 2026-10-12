-- SELECT policies must use the current row. Looking the same row up by id
-- fails INSERT ... RETURNING because the in-flight row is not visible yet.

drop policy if exists deliverables_select on public.deliverables;
create policy deliverables_select on public.deliverables
  for select to authenticated
  using (
    public.can_see_project(project_id)
    and (
      public.is_internal_member(workspace_id)
      or status <> 'draft'
    )
  );

drop policy if exists invoices_select on public.invoices;
create policy invoices_select on public.invoices
  for select to authenticated
  using (
    public.is_internal_member(workspace_id)
    or (
      public.is_client_contact_of(client_id)
      and status in ('sent', 'paid')
    )
  );

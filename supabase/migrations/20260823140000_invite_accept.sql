-- Invite accept must run as SECURITY DEFINER: invitees are not members yet,
-- so memberships_insert would deny them. Also harden grants and owner-bypass.

create or replace function public.handle_new_workspace()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Seed / SQL as postgres has no auth.uid(); insert memberships explicitly.
  if auth.uid() is null then
    return new;
  end if;
  insert into public.memberships (workspace_id, profile_id, role)
  values (new.id, auth.uid(), 'owner');
  return new;
end;
$$;

alter table public.invitations
  drop constraint if exists invitations_role_not_owner;

alter table public.invitations
  add constraint invitations_role_not_owner check (role <> 'owner');

create unique index if not exists invitations_pending_email_idx
  on public.invitations (workspace_id, lower(email))
  where accepted_at is null;

alter table public.workspaces force row level security;
alter table public.profiles force row level security;
alter table public.memberships force row level security;
alter table public.invitations force row level security;

drop policy if exists invitations_update on public.invitations;
create policy invitations_update on public.invitations
  for update to authenticated
  using (public.workspace_role(workspace_id) in ('owner', 'manager'))
  with check (public.workspace_role(workspace_id) in ('owner', 'manager'));

drop policy if exists invitations_delete on public.invitations;
create policy invitations_delete on public.invitations
  for delete to authenticated
  using (
    public.workspace_role(workspace_id) in ('owner', 'manager')
    and accepted_at is null
  );

create or replace function public.invitation_preview(invite_token text)
returns table (
  workspace_name text,
  email text,
  role public.membership_role,
  expires_at timestamptz,
  status text
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  inv public.invitations%rowtype;
begin
  if invite_token is null or char_length(invite_token) < 16 then
    return;
  end if;

  select * into inv
  from public.invitations
  where token = invite_token;

  if not found then
    return;
  end if;

  workspace_name := (
    select w.name from public.workspaces w where w.id = inv.workspace_id
  );
  email := inv.email;
  role := inv.role;
  expires_at := inv.expires_at;
  status := case
    when inv.accepted_at is not null then 'accepted'
    when inv.expires_at <= now() then 'expired'
    else 'pending'
  end;
  return next;
end;
$$;

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

  return inv.workspace_id;
end;
$$;

revoke all on function public.is_workspace_member(uuid) from public;
revoke all on function public.workspace_role(uuid) from public;
revoke all on function public.invitation_preview(text) from public;
revoke all on function public.accept_invitation(text) from public;

grant execute on function public.is_workspace_member(uuid) to authenticated;
grant execute on function public.workspace_role(uuid) to authenticated;
grant execute on function public.invitation_preview(text) to anon, authenticated;
grant execute on function public.accept_invitation(text) to authenticated;

revoke all on public.workspaces from anon;
revoke all on public.profiles from anon;
revoke all on public.memberships from anon;
revoke all on public.invitations from anon;

-- Positive and negative RLS cases against the linked hosted database.
-- Run: pnpm rls:test
-- Uses throwaway rls-*@example.com users; cleaned up even if a case fails.

create extension if not exists pgcrypto with schema extensions;

do $rls$
declare
  user_a uuid := '00000000-0000-4000-8000-0000000000a1';
  user_b uuid := '00000000-0000-4000-8000-0000000000b1';
  user_c uuid := '00000000-0000-4000-8000-0000000000c1';
  user_d uuid := '00000000-0000-4000-8000-0000000000d1';
  ws_a uuid := '00000000-0000-4000-8000-0000000000aa';
  ws_b uuid := '00000000-0000-4000-8000-0000000000bb';
  cl_a uuid := '00000000-0000-4000-8000-0000000000ca';
  cl_b uuid := '00000000-0000-4000-8000-0000000000cb';
  pj_a uuid := '00000000-0000-4000-8000-0000000000ea';
  pj_b uuid := '00000000-0000-4000-8000-0000000000eb';
  ct_c uuid := '00000000-0000-4000-8000-0000000000cc';
  ms_a uuid := '00000000-0000-4000-8000-0000000000f1';
  tk_a uuid := '00000000-0000-4000-8000-0000000000f2';
  fl_int uuid := '00000000-0000-4000-8000-0000000000f3';
  fl_cli uuid := '00000000-0000-4000-8000-0000000000f4';
  act_a uuid := '00000000-0000-4000-8000-0000000000f5';
  dl_open uuid := '00000000-0000-4000-8000-0000000000f7';
  dl_draft uuid := '00000000-0000-4000-8000-0000000000f8';
  inv_sent uuid := '00000000-0000-4000-8000-0000000000f9';
  inv_draft uuid := '00000000-0000-4000-8000-0000000000fa';
  notif_c uuid := '00000000-0000-4000-8000-0000000000fb';
  invite_ok text := 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa01';
  invite_wrong text := 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa02';
  seen int;
  ws_name text;
  accepted_ws uuid;
begin
  delete from public.workspaces where slug in ('rls-alpha', 'rls-beta');
  delete from auth.users where email like 'rls-%@example.com';

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change,
    email_change_token_new, recovery_token, is_sso_user, is_anonymous
  )
  values
    (
      '00000000-0000-0000-0000-000000000000', user_a, 'authenticated', 'authenticated',
      'rls-a@example.com', extensions.crypt('rls-test-password', extensions.gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"RLS A"}'::jsonb,
      now(), now(), '', '', '', '', false, false
    ),
    (
      '00000000-0000-0000-0000-000000000000', user_b, 'authenticated', 'authenticated',
      'rls-b@example.com', extensions.crypt('rls-test-password', extensions.gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"RLS B"}'::jsonb,
      now(), now(), '', '', '', '', false, false
    ),
    (
      '00000000-0000-0000-0000-000000000000', user_c, 'authenticated', 'authenticated',
      'rls-c@example.com', extensions.crypt('rls-test-password', extensions.gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"RLS C"}'::jsonb,
      now(), now(), '', '', '', '', false, false
    ),
    (
      '00000000-0000-0000-0000-000000000000', user_d, 'authenticated', 'authenticated',
      'rls-d@example.com', extensions.crypt('rls-test-password', extensions.gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"RLS D"}'::jsonb,
      now(), now(), '', '', '', '', false, false
    );

  insert into public.workspaces (id, name, slug)
  values
    (ws_a, 'Alpha Agency', 'rls-alpha'),
    (ws_b, 'Beta Bureau', 'rls-beta');

  insert into public.memberships (workspace_id, profile_id, role)
  values
    (ws_a, user_a, 'owner'),
    (ws_b, user_b, 'owner'),
    (ws_a, user_c, 'client');

  insert into public.invitations (workspace_id, email, role, token, expires_at, created_by)
  values
    (ws_a, 'rls-d@example.com', 'member', invite_ok, now() + interval '7 days', user_a),
    (ws_a, 'rls-other@example.com', 'member', invite_wrong, now() + interval '7 days', user_a);

  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', user_a::text, 'email', 'rls-a@example.com', 'role', 'authenticated')::text,
    true
  );
  perform set_config('request.jwt.claim.sub', user_a::text, true);
  perform set_config('request.jwt.claim.email', 'rls-a@example.com', true);

  execute 'set local role authenticated';

  select count(*) into seen from public.workspaces where id = ws_a;
  if seen <> 1 then
    raise exception 'positive: owner A should select workspace A';
  end if;

  select count(*) into seen from public.workspaces where id = ws_b;
  if seen <> 0 then
    raise exception 'negative: owner A must not select workspace B';
  end if;

  update public.workspaces
  set theme = '{"preset":"slate"}'::jsonb, logo_path = ws_a::text || '/logo'
  where id = ws_a;
  if not found then
    raise exception 'positive: owner A should update workspace theme and logo_path';
  end if;

  insert into public.clients (id, workspace_id, name)
  values (cl_a, ws_a, 'Alpha Client');

  insert into public.projects (id, workspace_id, client_id, name, status)
  values (pj_a, ws_a, cl_a, 'Alpha Site', 'planned');

  insert into public.clients (id, workspace_id, name)
  values (cl_b, ws_a, 'Hidden Client');

  insert into public.projects (id, workspace_id, client_id, name, status)
  values (pj_b, ws_a, cl_b, 'Hidden Site', 'in_progress');

  select count(*) into seen from public.clients where id = cl_a;
  if seen <> 1 then
    raise exception 'positive: owner A should insert and select a client';
  end if;

  select count(*) into seen from public.projects where workspace_id = ws_a;
  if seen <> 2 then
    raise exception 'positive: owner A should select both workspace projects';
  end if;

  insert into public.milestones (id, workspace_id, project_id, name, status, sort_order)
  values (ms_a, ws_a, pj_a, 'Kickoff', 'planned', 0);

  insert into public.tasks (id, workspace_id, project_id, milestone_id, name, status, sort_order)
  values (tk_a, ws_a, pj_a, ms_a, 'Draft sitemap', 'todo', 0);

  insert into public.files (
    id, workspace_id, project_id, original_name, storage_path, mime_type, byte_size, visibility, uploaded_by
  )
  values
    (
      fl_int, ws_a, pj_a, 'team-notes.txt',
      ws_a::text || '/' || pj_a::text || '/' || fl_int::text,
      'text/plain', 12, 'internal', user_a
    ),
    (
      fl_cli, ws_a, pj_a, 'menu.pdf',
      ws_a::text || '/' || pj_a::text || '/' || fl_cli::text,
      'application/pdf', 24, 'client', user_a
    );

  insert into public.activity_events (
    id, workspace_id, project_id, actor_id, event_type, summary, visibility
  )
  values
    (act_a, ws_a, pj_a, user_a, 'file.uploaded', 'RLS A uploaded menu.pdf', 'client'),
    (
      '00000000-0000-4000-8000-0000000000f6',
      ws_a, pj_a, user_a, 'file.uploaded', 'RLS A uploaded team-notes.txt', 'internal'
    );

  select count(*) into seen from public.milestones where id = ms_a;
  if seen <> 1 then
    raise exception 'positive: owner A should insert and select a milestone';
  end if;

  select count(*) into seen from public.files where project_id = pj_a;
  if seen <> 2 then
    raise exception 'positive: owner A should select both project files';
  end if;

  insert into public.deliverables (
    id, workspace_id, project_id, title, note, status, created_by
  )
  values
    (dl_open, ws_a, pj_a, 'Hero v3', 'Please review the autumn hero.', 'awaiting_approval', user_a),
    (dl_draft, ws_a, pj_a, 'Internal draft', 'Not ready.', 'draft', user_a);

  insert into public.deliverable_comments (
    id, workspace_id, project_id, deliverable_id, author_id, body
  )
  values (
    '00000000-0000-4000-8000-0000000000fc',
    ws_a, pj_a, dl_open, user_a, 'Ready for the client to review.'
  );

  insert into public.invoices (
    id, workspace_id, client_id, project_id, number, status, issue_date, created_by
  )
  values
    (inv_sent, ws_a, cl_a, pj_a, 'INV-2026-0001', 'draft', current_date, user_a),
    (inv_draft, ws_a, cl_a, pj_a, 'INV-2026-0002', 'draft', current_date, user_a);

  insert into public.invoice_items (
    workspace_id, invoice_id, description, quantity, unit_amount_cents, sort_order
  )
  values
    (ws_a, inv_sent, 'Homepage design', 1, 180000, 0),
    (ws_a, inv_draft, 'Hidden draft line', 1, 1000, 0);

  update public.invoices set status = 'sent' where id = inv_sent;

  insert into public.notifications (
    id, workspace_id, recipient_id, actor_id, event_type, title, body, href
  )
  values (
    notif_c, ws_a, user_c, user_a, 'deliverable.submitted',
    'Hero v3 needs a review', 'Please approve the hero.', '/app/deliverables/open'
  );

  select count(*) into seen from public.deliverables where project_id = pj_a;
  if seen <> 2 then
    raise exception 'positive: owner A should insert and select deliverables';
  end if;

  select count(*) into seen from public.invoices where workspace_id = ws_a;
  if seen <> 2 then
    raise exception 'positive: owner A should insert and select invoices';
  end if;

  select count(*) into seen from public.profiles where id = user_b;
  if seen <> 0 then
    raise exception 'negative: A must not select unrelated profile B';
  end if;

  reset role;
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', user_c::text, 'email', 'rls-c@example.com', 'role', 'authenticated')::text,
    true
  );
  perform set_config('request.jwt.claim.sub', user_c::text, true);
  perform set_config('request.jwt.claim.email', 'rls-c@example.com', true);
  execute 'set local role authenticated';

  update public.workspaces set name = 'Hacked' where id = ws_a;

  select count(*) into seen from public.projects where id = pj_a;
  if seen <> 0 then
    raise exception 'negative: client C must not select an unassigned project';
  end if;

  select count(*) into seen from public.milestones where id = ms_a;
  if seen <> 0 then
    raise exception 'negative: client C must not select a milestone on an unassigned project';
  end if;

  select count(*) into seen from public.files where id = fl_cli;
  if seen <> 0 then
    raise exception 'negative: client C must not select a file on an unassigned project';
  end if;

  begin
    insert into public.clients (workspace_id, name) values (ws_a, 'Hacked Co');
    raise exception 'negative: client C must not insert a client';
  exception
    when insufficient_privilege then
      null;
  end;

  begin
    update public.projects set name = 'Hacked' where id = pj_a;
    if found then
      raise exception 'negative: client C must not update a project';
    end if;
  exception
    when insufficient_privilege then
      null;
  end;

  reset role;
  select name into ws_name from public.workspaces where id = ws_a;
  if ws_name <> 'Alpha Agency' then
    raise exception 'negative: client C must not update workspace A';
  end if;

  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', user_d::text, 'email', 'rls-d@example.com', 'role', 'authenticated')::text,
    true
  );
  perform set_config('request.jwt.claim.sub', user_d::text, true);
  perform set_config('request.jwt.claim.email', 'rls-d@example.com', true);
  execute 'set local role authenticated';

  select count(*) into seen from public.profiles where id = user_a;
  if seen <> 0 then
    raise exception 'negative: unrelated D must not select profile A';
  end if;

  begin
    perform public.accept_invitation(invite_wrong);
    raise exception 'negative: D must not accept invite for another email';
  exception
    when others then
      if sqlerrm not like '%different email%' then
        raise;
      end if;
  end;

  accepted_ws := public.accept_invitation(invite_ok);
  if accepted_ws <> ws_a then
    raise exception 'positive: D should accept matching invite into workspace A';
  end if;

  select count(*) into seen
  from public.memberships
  where workspace_id = ws_a and profile_id = user_d and role = 'member';
  if seen <> 1 then
    raise exception 'positive: D should have a member row after accept';
  end if;

  begin
    update public.workspaces set theme = '{"preset":"clay"}'::jsonb where id = ws_a;
    if found then
      raise exception 'negative: member D must not update workspace theme';
    end if;
  exception
    when insufficient_privilege then
      null;
  end;

  insert into public.clients (workspace_id, name)
  values (ws_a, 'Member Client');

  select count(*) into seen from public.clients where workspace_id = ws_a and name = 'Member Client';
  if seen <> 1 then
    raise exception 'positive: member D should insert a client in workspace A';
  end if;

  reset role;

  insert into public.client_contacts (id, workspace_id, client_id, profile_id, name, email)
  values (ct_c, ws_a, cl_a, user_c, 'Client C', 'rls-c@example.com');

  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', user_c::text, 'email', 'rls-c@example.com', 'role', 'authenticated')::text,
    true
  );
  perform set_config('request.jwt.claim.sub', user_c::text, true);
  perform set_config('request.jwt.claim.email', 'rls-c@example.com', true);
  execute 'set local role authenticated';

  select count(*) into seen from public.projects where id = pj_a;
  if seen <> 1 then
    raise exception 'positive: assigned client C should select their company project';
  end if;

  select count(*) into seen from public.projects where id = pj_b;
  if seen <> 0 then
    raise exception 'negative: assigned client C must not select another company project';
  end if;

  select count(*) into seen from public.milestones where id = ms_a;
  if seen <> 1 then
    raise exception 'positive: assigned client C should select milestones on their project';
  end if;

  select count(*) into seen from public.tasks where id = tk_a;
  if seen <> 1 then
    raise exception 'positive: assigned client C should select tasks on their project';
  end if;

  select count(*) into seen from public.files where id = fl_cli;
  if seen <> 1 then
    raise exception 'positive: assigned client C should select a client-shared file';
  end if;

  select count(*) into seen from public.files where id = fl_int;
  if seen <> 0 then
    raise exception 'negative: assigned client C must not select a team-only file';
  end if;

  select count(*) into seen from public.activity_events where id = act_a;
  if seen <> 1 then
    raise exception 'positive: assigned client C should select activity on their project';
  end if;

  select count(*) into seen
  from public.activity_events
  where id = '00000000-0000-4000-8000-0000000000f6';
  if seen <> 0 then
    raise exception 'negative: assigned client C must not select team-only file activity';
  end if;

  select count(*) into seen from public.deliverables where id = dl_open;
  if seen <> 1 then
    raise exception 'positive: assigned client C should select a submitted deliverable';
  end if;

  select count(*) into seen from public.deliverables where id = dl_draft;
  if seen <> 0 then
    raise exception 'negative: assigned client C must not select a draft deliverable';
  end if;

  select count(*) into seen from public.invoices where id = inv_sent;
  if seen <> 1 then
    raise exception 'positive: assigned client C should select a sent invoice';
  end if;

  select count(*) into seen from public.invoices where id = inv_draft;
  if seen <> 0 then
    raise exception 'negative: assigned client C must not select a draft invoice';
  end if;

  select count(*) into seen from public.invoice_items where invoice_id = inv_sent;
  if seen <> 1 then
    raise exception 'positive: assigned client C should select sent invoice lines';
  end if;

  select count(*) into seen from public.notifications where id = notif_c;
  if seen <> 1 then
    raise exception 'positive: assigned client C should select their notification';
  end if;

  insert into public.deliverable_comments (workspace_id, project_id, deliverable_id, author_id, body)
  values (ws_a, pj_a, dl_open, user_c, 'Please enlarge the allergen line.');

  insert into public.approvals (
    workspace_id, project_id, deliverable_id, actor_id, decision, note
  )
  values (ws_a, pj_a, dl_open, user_c, 'changes_requested', 'Swap the pastry photo.');

  select count(*) into seen from public.approvals where deliverable_id = dl_open;
  if seen <> 1 then
    raise exception 'positive: assigned client C should insert an approval decision';
  end if;

  begin
    insert into public.milestones (workspace_id, project_id, name)
    values (ws_a, pj_a, 'Hacked milestone');
    raise exception 'negative: assigned client C must not insert a milestone';
  exception
    when insufficient_privilege then
      null;
  end;

  begin
    insert into public.files (
      workspace_id, project_id, original_name, storage_path, mime_type, byte_size, visibility
    )
    values (
      ws_a, pj_a, 'stolen.txt',
      ws_a::text || '/' || pj_a::text || '/00000000-0000-4000-8000-0000000000ff',
      'text/plain', 8, 'client'
    );
    raise exception 'negative: assigned client C must not insert a file';
  exception
    when insufficient_privilege then
      null;
  end;

  begin
    insert into public.deliverables (workspace_id, project_id, title, status)
    values (ws_a, pj_a, 'Hacked deliverable', 'awaiting_approval');
    raise exception 'negative: assigned client C must not insert a deliverable';
  exception
    when insufficient_privilege then
      null;
  end;

  begin
    insert into public.invoices (
      workspace_id, client_id, project_id, number, status, issue_date
    )
    values (ws_a, cl_a, pj_a, 'INV-2026-0099', 'sent', current_date);
    raise exception 'negative: assigned client C must not insert an invoice';
  exception
    when insufficient_privilege then
      null;
  end;

  select count(*) into seen from public.clients where id = cl_a;
  if seen <> 1 then
    raise exception 'positive: assigned client C should select their company';
  end if;

  begin
    update public.projects set name = 'Hacked' where id = pj_a;
    if found then
      raise exception 'negative: assigned client C must not update their project';
    end if;
  exception
    when insufficient_privilege then
      null;
  end;

  reset role;

  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', user_b::text, 'email', 'rls-b@example.com', 'role', 'authenticated')::text,
    true
  );
  perform set_config('request.jwt.claim.sub', user_b::text, true);
  perform set_config('request.jwt.claim.email', 'rls-b@example.com', true);
  execute 'set local role authenticated';

  select count(*) into seen from public.clients where id = cl_a;
  if seen <> 0 then
    raise exception 'negative: owner B must not select workspace A clients';
  end if;

  select count(*) into seen from public.milestones where id = ms_a;
  if seen <> 0 then
    raise exception 'negative: owner B must not select workspace A milestones';
  end if;

  select count(*) into seen from public.files where project_id = pj_a;
  if seen <> 0 then
    raise exception 'negative: owner B must not select workspace A files';
  end if;

  select count(*) into seen from public.activity_events where id = act_a;
  if seen <> 0 then
    raise exception 'negative: owner B must not select workspace A activity';
  end if;

  select count(*) into seen from public.deliverables where project_id = pj_a;
  if seen <> 0 then
    raise exception 'negative: owner B must not select workspace A deliverables';
  end if;

  select count(*) into seen from public.invoices where workspace_id = ws_a;
  if seen <> 0 then
    raise exception 'negative: owner B must not select workspace A invoices';
  end if;

  select count(*) into seen from public.notifications where id = notif_c;
  if seen <> 0 then
    raise exception 'negative: owner B must not select C notifications';
  end if;

  begin
    insert into public.clients (workspace_id, name) values (ws_a, 'Stolen');
    raise exception 'negative: owner B must not insert a client into workspace A';
  exception
    when insufficient_privilege then
      null;
  end;

  reset role;

  delete from public.workspaces where slug in ('rls-alpha', 'rls-beta');
  delete from auth.users where email like 'rls-%@example.com';

  raise notice 'RLS_OK';
exception
  when others then
    delete from public.workspaces where slug in ('rls-alpha', 'rls-beta');
    delete from auth.users where email like 'rls-%@example.com';
    raise;
end;
$rls$;

select 'RLS_OK' as result;

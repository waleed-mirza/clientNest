"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentMembership } from "@/features/auth/session";
import { actorLabel, recordActivity } from "@/features/activity/record";
import { persistProjectFile } from "@/features/files/store";
import {
  listClientRecipients,
  listProjectTeamRecipients,
  notifyPeople,
} from "@/features/notifications/notify";
import { formFile, formString } from "@/lib/form-data";
import {
  canDecideDeliverable,
  canRequestApproval,
  isDeliverableStatus,
} from "@/lib/deliverables/status";
import { demoWriteBlocked } from "@/lib/demo/guard";
import { canManageRecords, isInternalRole } from "@/lib/security/roles";
import {
  commentDeliverableSchema,
  createDeliverableSchema,
  decideDeliverableSchema,
  deliverableIdSchema,
  updateDeliverableSchema,
} from "@/lib/validation/records";

export type RecordState = { ok: boolean; message: string };

function deny(kind: "change" | "decide"): RecordState {
  return {
    ok: false,
    message:
      kind === "decide"
        ? "You don't have permission to approve this work."
        : "You don't have permission to change deliverables.",
  };
}

async function requireMembershipOrError() {
  const blocked = demoWriteBlocked();
  if (blocked) return { error: blocked, membership: null };
  if (!isSupabaseConfigured()) {
    return {
      error: { ok: false, message: "Supabase is not configured." } as RecordState,
      membership: null,
    };
  }
  const membership = await getCurrentMembership();
  if (!membership) {
    return { error: { ok: false, message: "You need a workspace first." }, membership: null };
  }
  return { error: null, membership };
}

function refreshDeliverable(projectId: string, id?: string) {
  revalidatePath("/app", "layout");
  revalidatePath(`/app/projects/${projectId}`);
  if (id) revalidatePath(`/app/deliverables/${id}`);
}

export async function createDeliverable(
  _prev: RecordState,
  formData: FormData,
): Promise<RecordState> {
  const { error, membership } = await requireMembershipOrError();
  if (error || !membership) return error ?? deny("change");
  if (!canManageRecords(membership.role)) return deny("change");

  const parsed = createDeliverableSchema.safeParse({
    projectId: formString(formData, "projectId"),
    title: formString(formData, "title"),
    note: formString(formData, "note"),
    intent: formString(formData, "intent") || "draft",
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the deliverable." };
  }

  if (parsed.data.intent === "request" && !parsed.data.note) {
    return { ok: false, message: "Add a note before requesting approval." };
  }

  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("id, client_id, archived_at")
    .eq("id", parsed.data.projectId)
    .eq("workspace_id", membership.workspaceId)
    .maybeSingle();
  if (!project || project.archived_at) {
    return { ok: false, message: "That project isn't available." };
  }

  const file = formFile(formData, "file");
  let fileId: string | null = null;
  if (file) {
    const stored = await persistProjectFile(supabase, {
      workspaceId: membership.workspaceId,
      projectId: parsed.data.projectId,
      userId: membership.userId,
      file,
      visibility: "client",
    });
    if (!stored.ok) return { ok: false, message: stored.message };
    fileId = stored.id;
  }

  const requesting = parsed.data.intent === "request";
  const { data, error: insertError } = await supabase
    .from("deliverables")
    .insert({
      workspace_id: membership.workspaceId,
      project_id: parsed.data.projectId,
      title: parsed.data.title,
      note: parsed.data.note,
      file_id: fileId,
      status: requesting ? "awaiting_approval" : "draft",
      requested_at: requesting ? new Date().toISOString() : null,
      created_by: membership.userId,
    })
    .select("id")
    .single();

  if (insertError) return { ok: false, message: insertError.message };
  if (!data) return { ok: false, message: "Deliverable could not be created." };

  const who = await actorLabel(supabase, membership.userId);
  await recordActivity(supabase, {
    workspaceId: membership.workspaceId,
    projectId: parsed.data.projectId,
    actorId: membership.userId,
    type: requesting ? "deliverable.submitted" : "deliverable.created",
    summary: requesting
      ? `${who} requested approval on ${parsed.data.title}`
      : `${who} created ${parsed.data.title}`,
  });

  if (requesting) {
    await notifyPeople(supabase, {
      workspaceId: membership.workspaceId,
      actorId: membership.userId,
      recipients: await listClientRecipients(supabase, project.client_id),
      eventType: "deliverable.submitted",
      title: `${parsed.data.title} needs a review`,
      body: `${who} asked you to approve this deliverable.`,
      href: `/app/deliverables/${data.id}`,
    });
  }

  refreshDeliverable(parsed.data.projectId, data.id);
  redirect(`/app/deliverables/${data.id}`);
}

export async function updateDeliverable(
  _prev: RecordState,
  formData: FormData,
): Promise<RecordState> {
  const { error, membership } = await requireMembershipOrError();
  if (error || !membership) return error ?? deny("change");
  if (!canManageRecords(membership.role)) return deny("change");

  const parsed = updateDeliverableSchema.safeParse({
    id: formString(formData, "id"),
    projectId: formString(formData, "projectId"),
    title: formString(formData, "title"),
    note: formString(formData, "note"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the deliverable." };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("deliverables")
    .select("id, status")
    .eq("id", parsed.data.id)
    .eq("project_id", parsed.data.projectId)
    .eq("workspace_id", membership.workspaceId)
    .maybeSingle();
  if (!existing) return { ok: false, message: "Deliverable could not be updated." };
  if (existing.status === "approved" || existing.status === "awaiting_approval") {
    return { ok: false, message: "This deliverable cannot be edited right now." };
  }

  const { data, error: updateError } = await supabase
    .from("deliverables")
    .update({ title: parsed.data.title, note: parsed.data.note })
    .eq("id", parsed.data.id)
    .eq("workspace_id", membership.workspaceId)
    .select("id")
    .maybeSingle();

  if (updateError) return { ok: false, message: updateError.message };
  if (!data) return { ok: false, message: "Deliverable could not be updated." };

  refreshDeliverable(parsed.data.projectId, parsed.data.id);
  return { ok: true, message: "Deliverable saved." };
}

export async function requestDeliverableApproval(
  _prev: RecordState,
  formData: FormData,
): Promise<RecordState> {
  const { error, membership } = await requireMembershipOrError();
  if (error || !membership) return error ?? deny("change");
  if (!canManageRecords(membership.role)) return deny("change");

  const parsed = deliverableIdSchema.safeParse({ id: formString(formData, "id") });
  if (!parsed.success) return { ok: false, message: "Missing deliverable." };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("deliverables")
    .select("id, title, note, status, version, project_id, projects!project_id(client_id)")
    .eq("id", parsed.data.id)
    .eq("workspace_id", membership.workspaceId)
    .maybeSingle();
  if (!existing) return { ok: false, message: "Deliverable could not be updated." };
  const status = isDeliverableStatus(existing.status) ? existing.status : "approved";
  if (!canRequestApproval(status)) {
    return { ok: false, message: "This deliverable is not ready to send." };
  }
  if (!existing.note) return { ok: false, message: "Add a note before requesting approval." };

  const nextVersion =
    existing.status === "changes_requested"
      ? Number(existing.version) + 1
      : Number(existing.version);

  const { data, error: updateError } = await supabase
    .from("deliverables")
    .update({
      status: "awaiting_approval",
      requested_at: new Date().toISOString(),
      version: nextVersion,
    })
    .eq("id", parsed.data.id)
    .eq("workspace_id", membership.workspaceId)
    .select("id")
    .maybeSingle();

  if (updateError) return { ok: false, message: updateError.message };
  if (!data) return { ok: false, message: "Deliverable could not be updated." };

  const project = Array.isArray(existing.projects) ? existing.projects[0] : existing.projects;
  const clientId = project && typeof project.client_id === "string" ? project.client_id : null;
  const who = await actorLabel(supabase, membership.userId);
  await recordActivity(supabase, {
    workspaceId: membership.workspaceId,
    projectId: existing.project_id,
    actorId: membership.userId,
    type: "deliverable.submitted",
    summary: `${who} requested approval on ${existing.title}`,
  });

  if (clientId) {
    await notifyPeople(supabase, {
      workspaceId: membership.workspaceId,
      actorId: membership.userId,
      recipients: await listClientRecipients(supabase, clientId),
      eventType: "deliverable.submitted",
      title: `${existing.title} needs a review`,
      body: `${who} asked you to approve this deliverable.`,
      href: `/app/deliverables/${existing.id}`,
    });
  }

  refreshDeliverable(existing.project_id, existing.id);
  return { ok: true, message: "Approval requested." };
}

export async function commentOnDeliverable(
  _prev: RecordState,
  formData: FormData,
): Promise<RecordState> {
  const { error, membership } = await requireMembershipOrError();
  if (error || !membership) return error ?? deny("change");

  const parsed = commentDeliverableSchema.safeParse({
    id: formString(formData, "id"),
    body: formString(formData, "body"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Write a short comment." };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("deliverables")
    .select("id, title, status, project_id, projects!project_id(client_id)")
    .eq("id", parsed.data.id)
    .eq("workspace_id", membership.workspaceId)
    .maybeSingle();
  if (!existing) return { ok: false, message: "That deliverable isn't available." };
  if (existing.status === "draft" && !isInternalRole(membership.role)) {
    return { ok: false, message: "That deliverable isn't available." };
  }

  const { error: insertError } = await supabase.from("deliverable_comments").insert({
    workspace_id: membership.workspaceId,
    project_id: existing.project_id,
    deliverable_id: existing.id,
    author_id: membership.userId,
    body: parsed.data.body,
  });
  if (insertError) return { ok: false, message: insertError.message };

  const who = await actorLabel(supabase, membership.userId);
  await recordActivity(supabase, {
    workspaceId: membership.workspaceId,
    projectId: existing.project_id,
    actorId: membership.userId,
    type: "deliverable.commented",
    summary: `${who} commented on ${existing.title}`,
  });

  const project = Array.isArray(existing.projects) ? existing.projects[0] : existing.projects;
  const clientId = project && typeof project.client_id === "string" ? project.client_id : null;
  const recipients = isInternalRole(membership.role)
    ? clientId
      ? await listClientRecipients(supabase, clientId)
      : []
    : await listProjectTeamRecipients(supabase, existing.project_id, membership.workspaceId);

  await notifyPeople(supabase, {
    workspaceId: membership.workspaceId,
    actorId: membership.userId,
    recipients,
    eventType: "deliverable.commented",
    title: `New comment on ${existing.title}`,
    body: parsed.data.body,
    href: `/app/deliverables/${existing.id}`,
  });

  refreshDeliverable(existing.project_id, existing.id);
  return { ok: true, message: "Comment added." };
}

export async function decideDeliverable(
  _prev: RecordState,
  formData: FormData,
): Promise<RecordState> {
  const { error, membership } = await requireMembershipOrError();
  if (error || !membership) return error ?? deny("decide");
  if (isInternalRole(membership.role)) return deny("decide");

  const parsed = decideDeliverableSchema.safeParse({
    id: formString(formData, "id"),
    decision: formString(formData, "decision"),
    note: formString(formData, "note"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Choose a decision." };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("deliverables")
    .select("id, title, status, project_id")
    .eq("id", parsed.data.id)
    .eq("workspace_id", membership.workspaceId)
    .maybeSingle();
  if (!existing) return { ok: false, message: "That deliverable isn't available." };
  const status = isDeliverableStatus(existing.status) ? existing.status : "draft";
  if (!canDecideDeliverable(status)) {
    return { ok: false, message: "This deliverable is not waiting for a decision." };
  }

  const { error: insertError } = await supabase.from("approvals").insert({
    workspace_id: membership.workspaceId,
    project_id: existing.project_id,
    deliverable_id: existing.id,
    actor_id: membership.userId,
    decision: parsed.data.decision,
    note: parsed.data.note,
  });
  if (insertError) return { ok: false, message: insertError.message };

  const who = await actorLabel(supabase, membership.userId);
  const approved = parsed.data.decision === "approved";
  await recordActivity(supabase, {
    workspaceId: membership.workspaceId,
    projectId: existing.project_id,
    actorId: membership.userId,
    type: approved ? "deliverable.approved" : "deliverable.changes_requested",
    summary: approved
      ? `${who} approved ${existing.title}`
      : `${who} requested changes on ${existing.title}`,
  });

  await notifyPeople(supabase, {
    workspaceId: membership.workspaceId,
    actorId: membership.userId,
    recipients: await listProjectTeamRecipients(
      supabase,
      existing.project_id,
      membership.workspaceId,
    ),
    eventType: approved ? "deliverable.approved" : "deliverable.changes_requested",
    title: approved ? `${existing.title} was approved` : `Changes requested on ${existing.title}`,
    body: parsed.data.note ?? `${who} recorded a decision.`,
    href: `/app/deliverables/${existing.id}`,
  });

  refreshDeliverable(existing.project_id, existing.id);
  return {
    ok: true,
    message: approved ? "Deliverable approved." : "Changes requested.",
  };
}

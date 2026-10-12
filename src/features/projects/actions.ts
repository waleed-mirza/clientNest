"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentMembership } from "@/features/auth/session";
import { actorLabel, recordActivity } from "@/features/activity/record";
import { demoWriteBlocked } from "@/lib/demo/guard";
import { canManageRecords } from "@/lib/security/roles";
import { formString, formStrings } from "@/lib/form-data";
import { projectStatusLabel } from "@/lib/projects/status";
import {
  archiveProjectSchema,
  createProjectSchema,
  updateProjectSchema,
} from "@/lib/validation/records";

export type RecordState = { ok: boolean; message: string };

function deny(): RecordState {
  return { ok: false, message: "You don't have permission to change projects." };
}

async function requireInternal() {
  const blocked = demoWriteBlocked();
  if (blocked) return { error: blocked, membership: null };
  if (!isSupabaseConfigured()) {
    return {
      error: { ok: false, message: "Supabase is not configured." } as RecordState,
      membership: null,
    };
  }
  const membership = await getCurrentMembership();
  if (!membership)
    return { error: { ok: false, message: "You need a workspace first." }, membership: null };
  if (!canManageRecords(membership.role)) return { error: deny(), membership: null };
  return { error: null, membership };
}

function refreshProjects(id?: string) {
  revalidatePath("/app", "layout");
  if (id) revalidatePath(`/app/projects/${id}`);
}

async function replaceProjectMembers(
  supabase: Awaited<ReturnType<typeof createClient>>,
  workspaceId: string,
  projectId: string,
  memberIds: string[],
  fallbackUserId: string,
) {
  const unique = new Set(memberIds.filter(Boolean));
  unique.add(fallbackUserId);

  const { error: deleteError } = await supabase
    .from("project_members")
    .delete()
    .eq("project_id", projectId)
    .eq("workspace_id", workspaceId);
  if (deleteError) return deleteError.message;

  const { error: insertError } = await supabase.from("project_members").insert(
    [...unique].map((profileId) => ({
      workspace_id: workspaceId,
      project_id: projectId,
      profile_id: profileId,
    })),
  );
  if (insertError) return insertError.message;
  return null;
}

export async function createProjectRecord(
  _prev: RecordState,
  formData: FormData,
): Promise<RecordState> {
  const { error, membership } = await requireInternal();
  if (error || !membership) return error ?? deny();

  const parsed = createProjectSchema.safeParse({
    clientId: formString(formData, "clientId"),
    name: formString(formData, "name"),
    description: formString(formData, "description"),
    status: formString(formData, "status"),
    startDate: formString(formData, "startDate"),
    dueDate: formString(formData, "dueDate"),
    memberIds: formStrings(formData, "memberIds"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the project details." };
  }

  const supabase = await createClient();
  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("id", parsed.data.clientId)
    .eq("workspace_id", membership.workspaceId)
    .maybeSingle();
  if (!client) return { ok: false, message: "Choose a client in this workspace." };

  const { data, error: insertError } = await supabase
    .from("projects")
    .insert({
      workspace_id: membership.workspaceId,
      client_id: parsed.data.clientId,
      name: parsed.data.name,
      description: parsed.data.description,
      status: parsed.data.status,
      start_date: parsed.data.startDate,
      due_date: parsed.data.dueDate,
    })
    .select("id")
    .single();

  if (insertError) return { ok: false, message: insertError.message };
  if (!data) return { ok: false, message: "Project could not be created." };

  const memberError = await replaceProjectMembers(
    supabase,
    membership.workspaceId,
    data.id,
    parsed.data.memberIds,
    membership.userId,
  );
  if (memberError) return { ok: false, message: memberError };

  const who = await actorLabel(supabase, membership.userId);
  await recordActivity(supabase, {
    workspaceId: membership.workspaceId,
    projectId: data.id,
    actorId: membership.userId,
    type: "project.created",
    summary: `${who} created ${parsed.data.name}`,
  });

  refreshProjects(data.id);
  redirect(`/app/projects/${data.id}`);
}

export async function updateProjectRecord(
  _prev: RecordState,
  formData: FormData,
): Promise<RecordState> {
  const { error, membership } = await requireInternal();
  if (error || !membership) return error ?? deny();

  const parsed = updateProjectSchema.safeParse({
    id: formString(formData, "id"),
    clientId: formString(formData, "clientId"),
    name: formString(formData, "name"),
    description: formString(formData, "description"),
    status: formString(formData, "status"),
    startDate: formString(formData, "startDate"),
    dueDate: formString(formData, "dueDate"),
    memberIds: formStrings(formData, "memberIds"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the project details." };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("projects")
    .select("status")
    .eq("id", parsed.data.id)
    .eq("workspace_id", membership.workspaceId)
    .maybeSingle();

  const { data, error: updateError } = await supabase
    .from("projects")
    .update({
      client_id: parsed.data.clientId,
      name: parsed.data.name,
      description: parsed.data.description,
      status: parsed.data.status,
      start_date: parsed.data.startDate,
      due_date: parsed.data.dueDate,
    })
    .eq("id", parsed.data.id)
    .eq("workspace_id", membership.workspaceId)
    .select("id")
    .maybeSingle();

  if (updateError) return { ok: false, message: updateError.message };
  if (!data) return { ok: false, message: "Project could not be updated." };

  const memberError = await replaceProjectMembers(
    supabase,
    membership.workspaceId,
    parsed.data.id,
    parsed.data.memberIds,
    membership.userId,
  );
  if (memberError) return { ok: false, message: memberError };

  if (existing && existing.status !== parsed.data.status) {
    const who = await actorLabel(supabase, membership.userId);
    await recordActivity(supabase, {
      workspaceId: membership.workspaceId,
      projectId: parsed.data.id,
      actorId: membership.userId,
      type: "project.status",
      summary: `${who} set status to ${projectStatusLabel(parsed.data.status)}`,
    });
  }

  refreshProjects(parsed.data.id);
  return { ok: true, message: "Project saved." };
}

export async function setProjectArchived(
  _prev: RecordState,
  formData: FormData,
): Promise<RecordState> {
  const { error, membership } = await requireInternal();
  if (error || !membership) return error ?? deny();

  const parsed = archiveProjectSchema.safeParse({
    id: formString(formData, "id"),
    archived: formString(formData, "archived"),
  });
  if (!parsed.success) return { ok: false, message: "Missing project." };

  const supabase = await createClient();
  const { data, error: updateError } = await supabase
    .from("projects")
    .update({ archived_at: parsed.data.archived === "1" ? new Date().toISOString() : null })
    .eq("id", parsed.data.id)
    .eq("workspace_id", membership.workspaceId)
    .select("id")
    .maybeSingle();

  if (updateError) return { ok: false, message: updateError.message };
  if (!data) return { ok: false, message: "Project could not be archived." };

  const who = await actorLabel(supabase, membership.userId);
  await recordActivity(supabase, {
    workspaceId: membership.workspaceId,
    projectId: parsed.data.id,
    actorId: membership.userId,
    type: "project.archived",
    summary:
      parsed.data.archived === "1"
        ? `${who} archived this project`
        : `${who} restored this project`,
  });

  refreshProjects(parsed.data.id);
  return {
    ok: true,
    message: parsed.data.archived === "1" ? "Project archived." : "Project restored.",
  };
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentMembership } from "@/features/auth/session";
import { actorLabel, recordActivity } from "@/features/activity/record";
import { nextSortOrder } from "@/features/projects/workflow-queries";
import { demoWriteBlocked } from "@/lib/demo/guard";
import { canManageRecords } from "@/lib/security/roles";
import { formString } from "@/lib/form-data";
import {
  createMilestoneSchema,
  deleteProjectChildSchema,
  moveProjectChildSchema,
  updateMilestoneSchema,
} from "@/lib/validation/records";
import { milestoneStatusLabel } from "@/lib/projects/workflow";

export type RecordState = { ok: boolean; message: string };

function deny(): RecordState {
  return { ok: false, message: "You don't have permission to change milestones." };
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
  if (!membership) {
    return { error: { ok: false, message: "You need a workspace first." }, membership: null };
  }
  if (!canManageRecords(membership.role)) return { error: deny(), membership: null };
  return { error: null, membership };
}

function refresh(projectId: string) {
  revalidatePath("/app", "layout");
  revalidatePath(`/app/projects/${projectId}`);
}

export async function createMilestone(
  _prev: RecordState,
  formData: FormData,
): Promise<RecordState> {
  const { error, membership } = await requireInternal();
  if (error || !membership) return error ?? deny();

  const parsed = createMilestoneSchema.safeParse({
    projectId: formString(formData, "projectId"),
    name: formString(formData, "name"),
    status: formString(formData, "status"),
    dueDate: formString(formData, "dueDate"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Check the milestone details.",
    };
  }

  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", parsed.data.projectId)
    .eq("workspace_id", membership.workspaceId)
    .maybeSingle();
  if (!project) return { ok: false, message: "That project isn't available." };

  const sortOrder = await nextSortOrder("milestones", parsed.data.projectId);
  const { error: insertError } = await supabase.from("milestones").insert({
    workspace_id: membership.workspaceId,
    project_id: parsed.data.projectId,
    name: parsed.data.name,
    status: parsed.data.status,
    due_date: parsed.data.dueDate,
    sort_order: sortOrder,
  });
  if (insertError) return { ok: false, message: insertError.message };

  const who = await actorLabel(supabase, membership.userId);
  await recordActivity(supabase, {
    workspaceId: membership.workspaceId,
    projectId: parsed.data.projectId,
    actorId: membership.userId,
    type: "milestone.created",
    summary: `${who} added ${parsed.data.name}`,
  });

  refresh(parsed.data.projectId);
  return { ok: true, message: "Milestone added." };
}

export async function updateMilestone(
  _prev: RecordState,
  formData: FormData,
): Promise<RecordState> {
  const { error, membership } = await requireInternal();
  if (error || !membership) return error ?? deny();

  const parsed = updateMilestoneSchema.safeParse({
    id: formString(formData, "id"),
    projectId: formString(formData, "projectId"),
    name: formString(formData, "name"),
    status: formString(formData, "status"),
    dueDate: formString(formData, "dueDate"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Check the milestone details.",
    };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("milestones")
    .select("id, status, name")
    .eq("id", parsed.data.id)
    .eq("project_id", parsed.data.projectId)
    .eq("workspace_id", membership.workspaceId)
    .maybeSingle();
  if (!existing) return { ok: false, message: "Milestone could not be updated." };

  const { data, error: updateError } = await supabase
    .from("milestones")
    .update({
      name: parsed.data.name,
      status: parsed.data.status,
      due_date: parsed.data.dueDate,
    })
    .eq("id", parsed.data.id)
    .eq("workspace_id", membership.workspaceId)
    .select("id")
    .maybeSingle();

  if (updateError) return { ok: false, message: updateError.message };
  if (!data) return { ok: false, message: "Milestone could not be updated." };

  if (existing.status !== parsed.data.status) {
    const who = await actorLabel(supabase, membership.userId);
    await recordActivity(supabase, {
      workspaceId: membership.workspaceId,
      projectId: parsed.data.projectId,
      actorId: membership.userId,
      type: "milestone.status",
      summary: `${who} marked ${parsed.data.name} as ${milestoneStatusLabel(parsed.data.status).toLowerCase()}`,
    });
  }

  refresh(parsed.data.projectId);
  return { ok: true, message: "Milestone saved." };
}

export async function deleteMilestone(
  _prev: RecordState,
  formData: FormData,
): Promise<RecordState> {
  const { error, membership } = await requireInternal();
  if (error || !membership) return error ?? deny();

  const parsed = deleteProjectChildSchema.safeParse({
    id: formString(formData, "id"),
    projectId: formString(formData, "projectId"),
  });
  if (!parsed.success) return { ok: false, message: "Missing milestone." };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("milestones")
    .select("name")
    .eq("id", parsed.data.id)
    .eq("project_id", parsed.data.projectId)
    .eq("workspace_id", membership.workspaceId)
    .maybeSingle();

  const { error: deleteError } = await supabase
    .from("milestones")
    .delete()
    .eq("id", parsed.data.id)
    .eq("project_id", parsed.data.projectId)
    .eq("workspace_id", membership.workspaceId);

  if (deleteError) return { ok: false, message: deleteError.message };

  const who = await actorLabel(supabase, membership.userId);
  await recordActivity(supabase, {
    workspaceId: membership.workspaceId,
    projectId: parsed.data.projectId,
    actorId: membership.userId,
    type: "milestone.deleted",
    summary: `${who} removed ${existing?.name ?? "a milestone"}`,
  });

  refresh(parsed.data.projectId);
  return { ok: true, message: "Milestone removed." };
}

export async function moveMilestone(_prev: RecordState, formData: FormData): Promise<RecordState> {
  const { error, membership } = await requireInternal();
  if (error || !membership) return error ?? deny();

  const parsed = moveProjectChildSchema.safeParse({
    id: formString(formData, "id"),
    projectId: formString(formData, "projectId"),
    direction: formString(formData, "direction"),
  });
  if (!parsed.success) return { ok: false, message: "Missing milestone." };

  const supabase = await createClient();
  const { data: rows, error: listError } = await supabase
    .from("milestones")
    .select("id, sort_order")
    .eq("project_id", parsed.data.projectId)
    .eq("workspace_id", membership.workspaceId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (listError) return { ok: false, message: listError.message };
  const list = rows ?? [];
  const index = list.findIndex((row) => row.id === parsed.data.id);
  const swap = parsed.data.direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swap < 0 || swap >= list.length) {
    return { ok: true, message: "Already at the end." };
  }

  const current = list[index];
  const neighbor = list[swap];
  if (!current || !neighbor) return { ok: false, message: "Milestone could not be moved." };

  const { error: firstError } = await supabase
    .from("milestones")
    .update({ sort_order: neighbor.sort_order })
    .eq("id", current.id)
    .eq("workspace_id", membership.workspaceId);
  if (firstError) return { ok: false, message: firstError.message };

  const { error: secondError } = await supabase
    .from("milestones")
    .update({ sort_order: current.sort_order })
    .eq("id", neighbor.id)
    .eq("workspace_id", membership.workspaceId);
  if (secondError) return { ok: false, message: secondError.message };

  refresh(parsed.data.projectId);
  return { ok: true, message: "Order updated." };
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentMembership } from "@/features/auth/session";
import { actorLabel, recordActivity } from "@/features/activity/record";
import { persistProjectFile } from "@/features/files/store";
import { demoWriteBlocked } from "@/lib/demo/guard";
import { canManageRecords } from "@/lib/security/roles";
import { formFile, formString } from "@/lib/form-data";
import { projectFilesBucket } from "@/lib/files/rules";
import { deleteProjectChildSchema, uploadFileMetaSchema } from "@/lib/validation/records";

export type RecordState = { ok: boolean; message: string };

function deny(): RecordState {
  return { ok: false, message: "You don't have permission to change files." };
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

export async function uploadProjectFile(
  _prev: RecordState,
  formData: FormData,
): Promise<RecordState> {
  const { error, membership } = await requireInternal();
  if (error || !membership) return error ?? deny();

  const parsed = uploadFileMetaSchema.safeParse({
    projectId: formString(formData, "projectId"),
    visibility: formString(formData, "visibility"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the file details." };
  }

  const file = formFile(formData, "file");
  if (!file) return { ok: false, message: "Choose a file to upload." };

  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", parsed.data.projectId)
    .eq("workspace_id", membership.workspaceId)
    .maybeSingle();
  if (!project) return { ok: false, message: "That project isn't available." };

  const stored = await persistProjectFile(supabase, {
    workspaceId: membership.workspaceId,
    projectId: parsed.data.projectId,
    userId: membership.userId,
    file,
    visibility: parsed.data.visibility,
  });
  if (!stored.ok) return { ok: false, message: stored.message };

  const who = await actorLabel(supabase, membership.userId);
  await recordActivity(supabase, {
    workspaceId: membership.workspaceId,
    projectId: parsed.data.projectId,
    actorId: membership.userId,
    type: "file.uploaded",
    summary: `${who} uploaded ${stored.name}`,
    visibility: parsed.data.visibility,
  });

  refresh(parsed.data.projectId);
  return { ok: true, message: "File uploaded." };
}

export async function deleteProjectFile(
  _prev: RecordState,
  formData: FormData,
): Promise<RecordState> {
  const { error, membership } = await requireInternal();
  if (error || !membership) return error ?? deny();

  const parsed = deleteProjectChildSchema.safeParse({
    id: formString(formData, "id"),
    projectId: formString(formData, "projectId"),
  });
  if (!parsed.success) return { ok: false, message: "Missing file." };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("files")
    .select("original_name, storage_path, visibility")
    .eq("id", parsed.data.id)
    .eq("project_id", parsed.data.projectId)
    .eq("workspace_id", membership.workspaceId)
    .maybeSingle();
  if (!existing) return { ok: false, message: "File could not be deleted." };

  const { error: storageError } = await supabase.storage
    .from(projectFilesBucket)
    .remove([existing.storage_path]);
  if (storageError) return { ok: false, message: storageError.message };

  const { error: deleteError } = await supabase
    .from("files")
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
    type: "file.deleted",
    summary: `${who} deleted ${existing.original_name}`,
    visibility: existing.visibility === "internal" ? "internal" : "client",
  });

  refresh(parsed.data.projectId);
  return { ok: true, message: "File deleted." };
}

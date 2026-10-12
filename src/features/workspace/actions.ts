"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getAuthUserId, getCurrentMembership } from "@/features/auth/session";
import { demoWriteBlocked } from "@/lib/demo/guard";
import { canEditWorkspace } from "@/lib/security/roles";
import { createWorkspaceSchema, updateWorkspaceSchema } from "@/lib/validation/auth";
import { logoStoragePath, resolveLogoUpload, workspaceLogosBucket } from "@/lib/workspace/logo";
import { slugifyWorkspaceName } from "@/lib/workspace/slug";

export type WorkspaceState = { ok: boolean; message: string };

export async function createWorkspace(
  _prev: WorkspaceState,
  formData: FormData,
): Promise<WorkspaceState> {
  const blocked = demoWriteBlocked();
  if (blocked) return blocked;
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "Supabase is not configured." };
  }

  const userId = await getAuthUserId();
  if (!userId) {
    return { ok: false, message: "You need to sign in first." };
  }

  const existing = await getCurrentMembership();
  if (existing) redirect("/app");

  const parsed = createWorkspaceSchema.safeParse({
    name: String(formData.get("name") ?? ""),
  });
  if (!parsed.success) {
    return { ok: false, message: "Workspace name must be 2–80 characters." };
  }

  const supabase = await createClient();
  const suffix = userId.replaceAll("-", "").slice(0, 8);
  const slug = slugifyWorkspaceName(parsed.data.name, suffix);

  const { error } = await supabase.from("workspaces").insert({
    name: parsed.data.name,
    slug,
    theme: { preset: "harbor" },
  });
  if (error) return { ok: false, message: error.message };

  redirect("/app");
}

function refreshApp() {
  revalidatePath("/app", "layout");
  revalidatePath("/app/settings");
}

export async function updateWorkspace(
  _prev: WorkspaceState,
  formData: FormData,
): Promise<WorkspaceState> {
  const blocked = demoWriteBlocked();
  if (blocked) return blocked;
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "Supabase is not configured." };
  }
  const membership = await getCurrentMembership();
  if (!membership) return { ok: false, message: "You need a workspace first." };
  if (!canEditWorkspace(membership.role)) {
    return { ok: false, message: "Only the workspace owner can change branding." };
  }

  const parsed = updateWorkspaceSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    preset: String(formData.get("preset") ?? ""),
  });
  if (!parsed.success) {
    return { ok: false, message: "Check the workspace name and theme." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("workspaces")
    .update({ name: parsed.data.name, theme: { preset: parsed.data.preset } })
    .eq("id", membership.workspaceId);
  if (error) return { ok: false, message: error.message };

  refreshApp();
  return { ok: true, message: "Workspace saved." };
}

export async function uploadWorkspaceLogo(
  _prev: WorkspaceState,
  formData: FormData,
): Promise<WorkspaceState> {
  const blocked = demoWriteBlocked();
  if (blocked) return blocked;
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "Supabase is not configured." };
  }
  const membership = await getCurrentMembership();
  if (!membership) return { ok: false, message: "You need a workspace first." };
  if (!canEditWorkspace(membership.role)) {
    return { ok: false, message: "Only the workspace owner can change branding." };
  }

  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Choose a PNG, JPEG, or WebP image." };
  }
  const resolved = resolveLogoUpload({ name: file.name, type: file.type, size: file.size });
  if (!resolved.ok) return resolved;

  const supabase = await createClient();
  const path = logoStoragePath(membership.workspaceId);
  const { error: uploadError } = await supabase.storage
    .from(workspaceLogosBucket)
    .upload(path, file, { contentType: resolved.mime, upsert: true });
  if (uploadError) return { ok: false, message: uploadError.message };

  const { error } = await supabase
    .from("workspaces")
    .update({ logo_path: path })
    .eq("id", membership.workspaceId);
  if (error) return { ok: false, message: error.message };

  refreshApp();
  return { ok: true, message: "Logo uploaded." };
}

export async function removeWorkspaceLogo(
  _previous: WorkspaceState = { ok: false, message: "" },
  _formData?: FormData,
): Promise<WorkspaceState> {
  void _previous;
  void _formData;
  const blocked = demoWriteBlocked();
  if (blocked) return blocked;
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "Supabase is not configured." };
  }
  const membership = await getCurrentMembership();
  if (!membership) return { ok: false, message: "You need a workspace first." };
  if (!canEditWorkspace(membership.role)) {
    return { ok: false, message: "Only the workspace owner can change branding." };
  }

  const supabase = await createClient();
  const path = logoStoragePath(membership.workspaceId);
  await supabase.storage.from(workspaceLogosBucket).remove([path]);
  const { error } = await supabase
    .from("workspaces")
    .update({ logo_path: null })
    .eq("id", membership.workspaceId);
  if (error) return { ok: false, message: error.message };

  refreshApp();
  return { ok: true, message: "Logo removed." };
}

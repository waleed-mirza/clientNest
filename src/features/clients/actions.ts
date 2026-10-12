"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentMembership } from "@/features/auth/session";
import { demoWriteBlocked } from "@/lib/demo/guard";
import { canManageRecords } from "@/lib/security/roles";
import { formString } from "@/lib/form-data";
import {
  archiveClientSchema,
  createClientSchema,
  createContactSchema,
  deleteContactSchema,
  updateClientSchema,
} from "@/lib/validation/records";

export type RecordState = { ok: boolean; message: string };

function deny(): RecordState {
  return { ok: false, message: "You don't have permission to change clients." };
}

function notConfigured(): RecordState {
  return { ok: false, message: "Supabase is not configured." };
}

async function requireInternal() {
  const blocked = demoWriteBlocked();
  if (blocked) return { error: blocked, membership: null };
  if (!isSupabaseConfigured()) return { error: notConfigured() as RecordState, membership: null };
  const membership = await getCurrentMembership();
  if (!membership)
    return { error: { ok: false, message: "You need a workspace first." }, membership: null };
  if (!canManageRecords(membership.role)) return { error: deny(), membership: null };
  return { error: null, membership };
}

function refreshClients(id?: string) {
  revalidatePath("/app", "layout");
  if (id) revalidatePath(`/app/clients/${id}`);
}

export async function createClientRecord(
  _prev: RecordState,
  formData: FormData,
): Promise<RecordState> {
  const { error, membership } = await requireInternal();
  if (error || !membership) return error ?? deny();

  const parsed = createClientSchema.safeParse({
    name: formString(formData, "name"),
    website: formString(formData, "website"),
    notes: formString(formData, "notes"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the client details." };
  }

  const supabase = await createClient();
  const { data, error: insertError } = await supabase
    .from("clients")
    .insert({
      workspace_id: membership.workspaceId,
      name: parsed.data.name,
      website: parsed.data.website,
      notes: parsed.data.notes,
    })
    .select("id")
    .single();

  if (insertError) return { ok: false, message: insertError.message };
  if (!data) return { ok: false, message: "Client could not be created." };

  refreshClients(data.id);
  redirect(`/app/clients/${data.id}`);
}

export async function updateClientRecord(
  _prev: RecordState,
  formData: FormData,
): Promise<RecordState> {
  const { error, membership } = await requireInternal();
  if (error || !membership) return error ?? deny();

  const parsed = updateClientSchema.safeParse({
    id: formString(formData, "id"),
    name: formString(formData, "name"),
    website: formString(formData, "website"),
    notes: formString(formData, "notes"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the client details." };
  }

  const supabase = await createClient();
  const { data, error: updateError } = await supabase
    .from("clients")
    .update({
      name: parsed.data.name,
      website: parsed.data.website,
      notes: parsed.data.notes,
    })
    .eq("id", parsed.data.id)
    .eq("workspace_id", membership.workspaceId)
    .select("id")
    .maybeSingle();

  if (updateError) return { ok: false, message: updateError.message };
  if (!data) return { ok: false, message: "Client could not be updated." };

  refreshClients(parsed.data.id);
  return { ok: true, message: "Client saved." };
}

export async function setClientArchived(
  _prev: RecordState,
  formData: FormData,
): Promise<RecordState> {
  const { error, membership } = await requireInternal();
  if (error || !membership) return error ?? deny();

  const parsed = archiveClientSchema.safeParse({
    id: formString(formData, "id"),
    archived: formString(formData, "archived"),
  });
  if (!parsed.success) return { ok: false, message: "Missing client." };

  const supabase = await createClient();
  const { data, error: updateError } = await supabase
    .from("clients")
    .update({ archived_at: parsed.data.archived === "1" ? new Date().toISOString() : null })
    .eq("id", parsed.data.id)
    .eq("workspace_id", membership.workspaceId)
    .select("id")
    .maybeSingle();

  if (updateError) return { ok: false, message: updateError.message };
  if (!data) return { ok: false, message: "Client could not be archived." };

  refreshClients(parsed.data.id);
  return {
    ok: true,
    message: parsed.data.archived === "1" ? "Client archived." : "Client restored.",
  };
}

export async function createContact(_prev: RecordState, formData: FormData): Promise<RecordState> {
  const { error, membership } = await requireInternal();
  if (error || !membership) return error ?? deny();

  const parsed = createContactSchema.safeParse({
    clientId: formString(formData, "clientId"),
    name: formString(formData, "name"),
    email: formString(formData, "email"),
    title: formString(formData, "title"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the contact details." };
  }

  const supabase = await createClient();
  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("id", parsed.data.clientId)
    .eq("workspace_id", membership.workspaceId)
    .maybeSingle();
  if (!client) return { ok: false, message: "Client not found." };

  const { data: profileId } = await supabase.rpc("profile_id_for_workspace_email", {
    ws: membership.workspaceId,
    lookup_email: parsed.data.email,
  });

  const { error: insertError } = await supabase.from("client_contacts").insert({
    workspace_id: membership.workspaceId,
    client_id: parsed.data.clientId,
    name: parsed.data.name,
    email: parsed.data.email,
    title: parsed.data.title,
    profile_id: typeof profileId === "string" ? profileId : null,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return { ok: false, message: "That email is already a contact on this client." };
    }
    return { ok: false, message: insertError.message };
  }

  refreshClients(parsed.data.clientId);
  return { ok: true, message: "Contact added." };
}

export async function deleteContact(_prev: RecordState, formData: FormData): Promise<RecordState> {
  const { error, membership } = await requireInternal();
  if (error || !membership) return error ?? deny();

  const parsed = deleteContactSchema.safeParse({
    id: formString(formData, "id"),
    clientId: formString(formData, "clientId"),
  });
  if (!parsed.success) return { ok: false, message: "Missing contact." };

  const supabase = await createClient();
  const { data, error: deleteError } = await supabase
    .from("client_contacts")
    .delete()
    .eq("id", parsed.data.id)
    .eq("client_id", parsed.data.clientId)
    .eq("workspace_id", membership.workspaceId)
    .select("id")
    .maybeSingle();

  if (deleteError) return { ok: false, message: deleteError.message };
  if (!data) return { ok: false, message: "Contact could not be removed." };

  refreshClients(parsed.data.clientId);
  return { ok: true, message: "Contact removed." };
}

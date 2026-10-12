"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getAuthUserId, getCurrentMembership } from "@/features/auth/session";
import { demoWriteBlocked } from "@/lib/demo/guard";
import { canManageMembers } from "@/lib/security/roles";
import { createInviteSchema, inviteTokenSchema } from "@/lib/validation/auth";
import { createInviteToken } from "@/lib/invitations/token";

export type InviteState = { ok: boolean; message: string };

const INVITE_DAYS = 7;

function formString(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "");
}

export async function createInvite(_prev: InviteState, formData: FormData): Promise<InviteState> {
  const blocked = demoWriteBlocked();
  if (blocked) return blocked;
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "Supabase is not configured." };
  }

  const membership = await getCurrentMembership();
  if (!membership) {
    return { ok: false, message: "You need a workspace first." };
  }
  if (!canManageMembers(membership.role)) {
    return { ok: false, message: "Only owners and managers can invite people." };
  }

  const parsed = createInviteSchema.safeParse({
    email: formString(formData, "email"),
    role: formString(formData, "role"),
  });
  if (!parsed.success) {
    return { ok: false, message: "Enter a valid email and choose member, manager, or client." };
  }

  const supabase = await createClient();
  const token = createInviteToken();
  const expiresAt = new Date(Date.now() + INVITE_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase.from("invitations").insert({
    workspace_id: membership.workspaceId,
    email: parsed.data.email,
    role: parsed.data.role,
    token,
    expires_at: expiresAt,
    created_by: membership.userId,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, message: "That email already has a pending invite." };
    }
    return { ok: false, message: error.message };
  }

  revalidatePath("/app/team");
  return { ok: true, message: `Invite created. Share /invite/${token}` };
}

export async function revokeInvite(_prev: InviteState, formData: FormData): Promise<InviteState> {
  const blocked = demoWriteBlocked();
  if (blocked) return blocked;
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "Supabase is not configured." };
  }

  const membership = await getCurrentMembership();
  if (!membership) {
    return { ok: false, message: "You need a workspace first." };
  }
  if (!canManageMembers(membership.role)) {
    return { ok: false, message: "Only owners and managers can revoke invites." };
  }

  const id = formString(formData, "id");
  if (!id) return { ok: false, message: "Missing invite." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invitations")
    .delete()
    .eq("id", id)
    .eq("workspace_id", membership.workspaceId)
    .is("accepted_at", null)
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, message: error.message };
  if (!data) return { ok: false, message: "Invite could not be revoked." };

  revalidatePath("/app/team");
  return { ok: true, message: "Invite revoked." };
}

export async function acceptInvite(_prev: InviteState, formData: FormData): Promise<InviteState> {
  const blocked = demoWriteBlocked();
  if (blocked) return blocked;
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "Supabase is not configured." };
  }

  const userId = await getAuthUserId();
  if (!userId) {
    return { ok: false, message: "You need to sign in first." };
  }

  const parsed = inviteTokenSchema.safeParse(formString(formData, "token"));
  if (!parsed.success) {
    return { ok: false, message: "This invite link is not valid." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("accept_invitation", {
    invite_token: parsed.data,
  });
  if (error) return { ok: false, message: error.message };

  revalidatePath("/app");
  redirect("/app");
}

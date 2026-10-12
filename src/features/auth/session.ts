import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { MembershipRole } from "@/lib/security/roles";
import { parseWorkspaceTheme, type ThemePreset } from "@/lib/theme/presets";

export type CurrentMembership = {
  userId: string;
  email: string | undefined;
  membershipId: string;
  role: MembershipRole;
  workspaceId: string;
  workspaceName: string;
  logoPath: string | null;
  themePreset: ThemePreset;
};

export async function requireMembership(): Promise<CurrentMembership> {
  if (!isSupabaseConfigured()) redirect("/login");
  const membership = await getCurrentMembership();
  if (!membership) redirect("/onboarding");
  return membership;
}

export async function getAuthUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const sub = data?.claims?.sub;
  return typeof sub === "string" ? sub : null;
}

export async function getCurrentMembership(): Promise<CurrentMembership | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (typeof userId !== "string") return null;

  const { data: membership } = await supabase
    .from("memberships")
    .select("id, role, workspace_id")
    .eq("profile_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!membership) return null;

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, name, logo_path, theme")
    .eq("id", membership.workspace_id)
    .maybeSingle();

  if (!workspace) return null;

  return {
    userId,
    email: typeof data?.claims?.email === "string" ? data.claims.email : undefined,
    membershipId: membership.id,
    role: membership.role as MembershipRole,
    workspaceId: workspace.id,
    workspaceName: workspace.name,
    logoPath: typeof workspace.logo_path === "string" ? workspace.logo_path : null,
    themePreset: parseWorkspaceTheme(workspace.theme),
  };
}

export type PendingInvite = {
  token: string;
  role: MembershipRole;
  expiresAt: string;
  workspaceName: string;
};

export async function getPendingInvitesForCurrentUser(): Promise<PendingInvite[]> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = data?.claims?.email;
  if (typeof email !== "string" || email.length === 0) return [];

  const { data: rows, error } = await supabase
    .from("invitations")
    .select("token, role, expires_at")
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString())
    .ilike("email", email)
    .order("created_at", { ascending: false });

  if (error || !rows || rows.length === 0) return [];

  const previews = await Promise.all(
    rows.map(async (row) => {
      if (typeof row.token !== "string") return null;
      const { data } = await supabase.rpc("invitation_preview", {
        invite_token: row.token,
      });
      const preview = Array.isArray(data) ? data[0] : data;
      const workspaceName =
        preview && typeof preview === "object" && "workspace_name" in preview
          ? String(preview.workspace_name)
          : "a workspace";
      return {
        token: row.token,
        role: row.role as MembershipRole,
        expiresAt: String(row.expires_at),
        workspaceName,
      };
    }),
  );

  return previews.filter((row): row is PendingInvite => row !== null);
}

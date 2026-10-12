import { headers } from "next/headers";
import { requireMembership } from "@/features/auth/session";
import {
  CreateInviteForm,
  CopyInviteLink,
  RevokeInviteForm,
} from "@/features/invitations/invite-forms";
import { canManageMembers } from "@/lib/security/roles";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Team" };
export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const membership = await requireMembership();

  const supabase = await createClient();
  const [{ data: members }, { data: invites }] = await Promise.all([
    supabase
      .from("memberships")
      .select("id, role, profile_id, profiles(full_name)")
      .eq("workspace_id", membership.workspaceId)
      .order("created_at", { ascending: true }),
    supabase
      .from("invitations")
      .select("id, email, role, token, expires_at, accepted_at")
      .eq("workspace_id", membership.workspaceId)
      .is("accepted_at", null)
      .order("created_at", { ascending: false }),
  ]);

  const canInvite = canManageMembers(membership.role);
  const pending = invites ?? [];
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  const origin = `${proto}://${host}`;

  return (
    <div className="grid gap-10">
      <div>
        <h1 className="text-[1.75rem] font-medium">Team</h1>
        <p className="mt-2 max-w-xl text-muted">
          People who can open this workspace. Clients only see what their role allows.
        </p>
      </div>

      <section aria-labelledby="members-heading" className="grid gap-4">
        <h2 id="members-heading" className="text-xl font-medium">
          Members
        </h2>
        <ul className="divide-y divide-border bg-surface">
          {(members ?? []).map((row) => {
            const profile = row.profiles as
              { full_name: string | null } | { full_name: string | null }[] | null;
            const name = Array.isArray(profile) ? profile[0]?.full_name : profile?.full_name;
            return (
              <li key={row.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <span className="text-sm">{name || "Unnamed member"}</span>
                <span className="text-sm text-muted">{row.role}</span>
              </li>
            );
          })}
        </ul>
      </section>

      {canInvite ? (
        <section aria-labelledby="invite-heading" className="grid gap-4">
          <h2 id="invite-heading" className="text-xl font-medium">
            Invite someone
          </h2>
          <div className="bg-surface p-5">
            <CreateInviteForm />
          </div>
        </section>
      ) : null}

      <section aria-labelledby="invites-heading" className="grid gap-4">
        <h2 id="invites-heading" className="text-xl font-medium">
          Pending invites
        </h2>
        {!canInvite ? (
          <p className="text-sm text-muted">Only owners and managers can send invites.</p>
        ) : null}
        {pending.length === 0 ? (
          <p className="text-sm text-muted">No pending invites.</p>
        ) : (
          <ul className="grid gap-3">
            {pending.map((invite) => (
              <li
                key={invite.id}
                className="grid gap-3 bg-surface p-4 sm:grid-cols-[1fr_auto] sm:items-start"
              >
                <div className="grid gap-2">
                  <p className="text-sm">
                    {invite.email} <span className="text-muted">· {invite.role}</span>
                  </p>
                  <CopyInviteLink path={`${origin}/invite/${invite.token}`} />
                </div>
                {canInvite ? <RevokeInviteForm id={invite.id} /> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

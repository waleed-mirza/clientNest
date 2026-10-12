import Link from "next/link";
import { AuthPage } from "@/components/auth/auth-page";
import { AcceptInviteForm } from "@/features/invitations/invite-forms";
import { signOut } from "@/features/auth/actions";
import { getAuthUserId } from "@/features/auth/session";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { inviteTokenSchema } from "@/lib/validation/auth";

export const metadata = { title: "Accept invite" };
export const dynamic = "force-dynamic";

type Preview = {
  workspace_name: string;
  email: string;
  role: string;
  expires_at: string;
  status: string;
};

async function loadPreview(token: string): Promise<Preview | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("invitation_preview", {
    invite_token: token,
  });
  if (error || !data) return null;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== "object") return null;
  return row as Preview;
}

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const parsed = inviteTokenSchema.safeParse(token);

  if (!parsed.success) {
    return (
      <AuthPage
        title="Invite not found"
        description="This link is missing or malformed. Ask the workspace owner for a new invite."
      >
        <p className="text-sm text-muted">No invite is attached to this URL.</p>
      </AuthPage>
    );
  }

  const preview = await loadPreview(parsed.data);
  if (!preview) {
    return (
      <AuthPage
        title="Invite not found"
        description="This invite does not exist. It may have been revoked."
      >
        <p className="text-sm text-muted">Ask the owner to send a new link.</p>
      </AuthPage>
    );
  }

  if (preview.status === "accepted") {
    return (
      <AuthPage
        title="Invite already used"
        description={`${preview.workspace_name} already accepted this invite.`}
        footer={
          <p>
            <Link href="/login" className="text-accent underline-offset-2 hover:underline">
              Sign in
            </Link>
          </p>
        }
      >
        <p className="text-sm text-muted">If you already joined, go to the dashboard.</p>
      </AuthPage>
    );
  }

  if (preview.status === "expired") {
    return (
      <AuthPage
        title="Invite expired"
        description={`This invite to ${preview.workspace_name} is no longer valid.`}
      >
        <p className="text-sm text-muted">Ask an owner or manager to send a new invite.</p>
      </AuthPage>
    );
  }

  const userId = isSupabaseConfigured() ? await getAuthUserId() : null;
  const next = `/invite/${parsed.data}`;

  if (!userId) {
    return (
      <AuthPage
        title={`Join ${preview.workspace_name}`}
        description={`You were invited as ${preview.role}. Sign in or create an account with ${preview.email}.`}
        footer={<p>Wrong inbox? Ask the owner to invite the email you actually use.</p>}
      >
        <div className="grid gap-3">
          <Link
            href={`/login?next=${encodeURIComponent(next)}`}
            className="inline-flex h-10 items-center justify-center rounded-sm bg-accent px-4 text-center text-sm font-medium text-accent-foreground"
          >
            Sign in to accept
          </Link>
          <Link
            href={`/signup?next=${encodeURIComponent(next)}`}
            className="text-center text-sm text-accent underline-offset-2 hover:underline"
          >
            Create an account
          </Link>
        </div>
      </AuthPage>
    );
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = typeof data?.claims?.email === "string" ? data.claims.email : "";
  const emailMatches = email.toLowerCase() === preview.email.toLowerCase();

  if (!emailMatches) {
    return (
      <AuthPage
        title="Wrong account"
        description={`This invite is for ${preview.email}. You are signed in as ${email || "a different account"}.`}
      >
        <form action={signOut}>
          <button
            type="submit"
            className="text-sm text-accent underline-offset-2 transition-colors duration-150 hover:underline"
          >
            Sign out and use the invited email
          </button>
        </form>
      </AuthPage>
    );
  }

  return (
    <AuthPage
      title={`Join ${preview.workspace_name}`}
      description={`Accept to join as ${preview.role}.`}
    >
      <AcceptInviteForm token={parsed.data} />
    </AuthPage>
  );
}

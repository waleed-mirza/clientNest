import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthPage } from "@/components/auth/auth-page";
import { OnboardingForm } from "@/features/workspace/onboarding-form";
import { getCurrentMembership, getPendingInvitesForCurrentUser } from "@/features/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata = { title: "Set up workspace" };
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  if (!isSupabaseConfigured()) redirect("/login");
  const membership = await getCurrentMembership();
  if (membership) redirect("/app");

  const invites = await getPendingInvitesForCurrentUser();
  const primaryInvite = invites[0];

  if (primaryInvite) {
    return (
      <AuthPage
        title="You have an invite"
        description={`${primaryInvite.workspaceName} invited you as ${primaryInvite.role}. Accept that instead of creating a new workspace.`}
      >
        <div className="grid gap-3">
          <Link
            href={`/invite/${primaryInvite.token}`}
            className="inline-flex h-10 items-center justify-center rounded-sm bg-accent px-4 text-center text-sm font-medium text-accent-foreground"
          >
            Review invite
          </Link>
          <details className="text-sm text-muted">
            <summary className="cursor-pointer hover:text-foreground">
              Create a new workspace instead
            </summary>
            <div className="mt-4">
              <OnboardingForm />
            </div>
          </details>
        </div>
      </AuthPage>
    );
  }

  return (
    <AuthPage
      title="Name your workspace"
      description="This is the agency account. After you create it, Settings lets the owner set a logo and theme."
    >
      <OnboardingForm />
    </AuthPage>
  );
}

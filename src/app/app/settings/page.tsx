import { AccessDenied } from "@/components/app/access-denied";
import { PageHeader } from "@/components/app/page-header";
import { requireMembership } from "@/features/auth/session";
import { WorkspaceBrandForm, WorkspaceLogoForm } from "@/features/workspace/settings-forms";
import { canEditWorkspace } from "@/lib/security/roles";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const membership = await requireMembership();
  if (!canEditWorkspace(membership.role)) {
    return (
      <AccessDenied
        title="Settings"
        message="Only the workspace owner can change the name, logo, and theme."
      />
    );
  }

  return (
    <div className="grid max-w-xl gap-10">
      <PageHeader
        title="Settings"
        description="Name, logo, and a preset. These apply to everyone in this workspace. Light and dark stay a personal choice."
      />
      <section aria-labelledby="brand-heading" className="grid gap-4">
        <h2 id="brand-heading" className="text-xl font-medium">
          Brand
        </h2>
        <WorkspaceBrandForm name={membership.workspaceName} preset={membership.themePreset} />
      </section>
      <section aria-labelledby="logo-heading" className="grid gap-4">
        <h2 id="logo-heading" className="text-xl font-medium">
          Logo
        </h2>
        <WorkspaceLogoForm hasLogo={Boolean(membership.logoPath)} />
      </section>
    </div>
  );
}

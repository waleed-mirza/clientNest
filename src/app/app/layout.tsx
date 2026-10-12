import type { ReactNode } from "react";
import { AppSidebar } from "@/features/app-shell/app-sidebar";
import { requireMembership } from "@/features/auth/session";
import { countActiveClients } from "@/features/clients/queries";
import { countInvoices } from "@/features/invoices/queries";
import { countUnreadNotifications } from "@/features/notifications/queries";
import { countActiveProjects } from "@/features/projects/queries";
import { getWorkspaceLogoUrl } from "@/features/workspace/logo";
import { DemoNotice } from "@/components/app/demo-notice";
import { isInternalRole } from "@/lib/security/roles";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const membership = await requireMembership();
  const internal = isInternalRole(membership.role);
  const [unreadNotifications, clientCount, projectCount, invoiceCount, logoUrl] = await Promise.all(
    [
      countUnreadNotifications(membership.userId),
      internal ? countActiveClients(membership.workspaceId) : Promise.resolve(undefined),
      countActiveProjects(membership.workspaceId),
      countInvoices(membership.workspaceId),
      getWorkspaceLogoUrl(membership.workspaceId, membership.logoPath),
    ],
  );

  return (
    <div
      data-theme={membership.themePreset}
      className="flex h-svh flex-col overflow-hidden bg-background md:flex-row print:h-auto print:overflow-visible"
    >
      <AppSidebar
        workspaceName={membership.workspaceName}
        role={membership.role}
        logoUrl={logoUrl}
        counts={{
          clients: clientCount,
          projects: projectCount,
          invoices: invoiceCount,
          notifications: unreadNotifications,
        }}
      />
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain print:overflow-visible">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-10 md:py-10">
          <DemoNotice />
          {children}
        </div>
      </div>
    </div>
  );
}

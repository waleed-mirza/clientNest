import { AccessDenied } from "@/components/app/access-denied";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { requireMembership } from "@/features/auth/session";
import { InvoiceCreateForm } from "@/features/invoices/forms";
import { listProjects } from "@/features/projects/queries";
import { isInternalRole } from "@/lib/security/roles";
import { firstParam } from "@/lib/search";

export const metadata = { title: "New invoice" };

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string | string[] }>;
}) {
  const membership = await requireMembership();
  if (!isInternalRole(membership.role)) {
    return (
      <AccessDenied
        title="New invoice"
        message="Only the agency team can create invoices. Open Invoices to print copies that were sent to you."
      />
    );
  }

  const params = await searchParams;
  const defaultProjectId = firstParam(params.projectId);
  const projects = await listProjects({ workspaceId: membership.workspaceId });

  return (
    <div className="grid gap-8">
      <PageHeader
        title="New invoice"
        description="A record the client can print. No payment is collected in ClientNest."
      />
      {projects.length === 0 ? (
        <EmptyState title="Create a project first">
          Invoices belong to a project so the client and timeline stay aligned.
        </EmptyState>
      ) : (
        <div className="max-w-xl bg-surface p-5">
          <InvoiceCreateForm
            projects={projects.map((project) => ({
              id: project.id,
              name: project.name,
              clientName: project.clientName,
            }))}
            defaultProjectId={defaultProjectId || undefined}
          />
        </div>
      )}
    </div>
  );
}

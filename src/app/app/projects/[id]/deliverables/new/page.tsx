import Link from "next/link";
import { notFound } from "next/navigation";
import { AccessDenied } from "@/components/app/access-denied";
import { PageHeader } from "@/components/app/page-header";
import { requireMembership } from "@/features/auth/session";
import { DeliverableCreateForm } from "@/features/deliverables/forms";
import { getProject } from "@/features/projects/queries";
import { isInternalRole } from "@/lib/security/roles";
import { parseUuid } from "@/lib/validation/id";

export const metadata = { title: "New deliverable" };

export default async function NewDeliverablePage({ params }: { params: Promise<{ id: string }> }) {
  const membership = await requireMembership();
  if (!isInternalRole(membership.role)) {
    return (
      <AccessDenied
        title="New deliverable"
        message="Only the agency team can submit work for approval."
      />
    );
  }

  const { id: rawId } = await params;
  const id = parseUuid(rawId);
  if (!id) notFound();

  const project = await getProject(membership.workspaceId, id);
  if (!project) {
    return (
      <AccessDenied
        title="New deliverable"
        message="This project isn't available. It may not exist, or your role cannot see it."
      />
    );
  }

  if (project.archivedAt) {
    return (
      <AccessDenied
        title="New deliverable"
        message="Archived projects cannot take new deliverables. Restore the project first."
      />
    );
  }

  return (
    <div className="grid gap-8">
      <PageHeader
        title="New deliverable"
        description={`Submit work on ${project.name} for ${project.clientName}.`}
      />
      <p className="text-sm text-muted">
        <Link href={`/app/projects/${project.id}`} className="hover:text-accent hover:underline">
          Back to project
        </Link>
      </p>
      <div className="max-w-xl bg-surface p-5">
        <DeliverableCreateForm projectId={project.id} />
      </div>
    </div>
  );
}

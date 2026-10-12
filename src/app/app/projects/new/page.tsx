import Link from "next/link";
import { AccessDenied } from "@/components/app/access-denied";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { requireMembership } from "@/features/auth/session";
import { listClientOptions, listWorkspacePeople } from "@/features/clients/queries";
import { ProjectForm } from "@/features/projects/forms";
import { firstParam } from "@/lib/search";
import { isInternalRole } from "@/lib/security/roles";
import { parseUuid } from "@/lib/validation/id";

export const metadata = { title: "New project" };

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string | string[] }>;
}) {
  const membership = await requireMembership();
  if (!isInternalRole(membership.role)) {
    return (
      <AccessDenied title="New project" message="Only agency team members can create projects." />
    );
  }

  const params = await searchParams;
  const requestedClient = parseUuid(firstParam(params.clientId));
  const [clients, people] = await Promise.all([
    listClientOptions(membership.workspaceId),
    listWorkspacePeople(membership.workspaceId),
  ]);

  if (clients.length === 0) {
    return (
      <div className="grid gap-8">
        <PageHeader title="New project" description="A project belongs to a client company." />
        <EmptyState title="Add a client first">
          <Link href="/app/clients/new" className="text-accent underline-offset-2 hover:underline">
            Create a client
          </Link>{" "}
          then come back to start a project.
        </EmptyState>
      </div>
    );
  }

  const defaultClient = clients.some((client) => client.id === requestedClient)
    ? requestedClient
    : clients[0]?.id;

  return (
    <div className="grid gap-8">
      <PageHeader
        title="New project"
        description="Assign a client company and the internal people who will work on it."
      />
      <div className="max-w-xl bg-surface p-5">
        <ProjectForm
          defaultClientId={defaultClient ?? undefined}
          clients={clients}
          people={people}
          selectedMemberIds={[membership.userId]}
        />
      </div>
    </div>
  );
}

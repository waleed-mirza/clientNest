import Link from "next/link";
import { Attention } from "@/components/app/attention";
import { EmptyState } from "@/components/app/empty-state";
import { MetaLine } from "@/components/app/meta-line";
import { PageHeader } from "@/components/app/page-header";
import { StatusPill } from "@/components/app/status-pill";
import { listClass, primaryButtonClass, rowClass } from "@/components/app/styles";
import { requireMembership } from "@/features/auth/session";
import { countActiveClients } from "@/features/clients/queries";
import { listRecentActivity } from "@/features/activity/queries";
import { listAwaitingDeliverables } from "@/features/deliverables/queries";
import { countSharedFiles } from "@/features/files/queries";
import { countOpenInvoices } from "@/features/invoices/queries";
import {
  countActiveProjects,
  countAwaitingApproval,
  listRecentProjects,
} from "@/features/projects/queries";
import { formatWhen } from "@/lib/activity/time";
import { formatDay, projectStatusLabel } from "@/lib/projects/status";
import { isInternalRole } from "@/lib/security/roles";

export const metadata = { title: "Dashboard" };

export default async function AppHomePage() {
  const membership = await requireMembership();
  const internal = isInternalRole(membership.role);

  const [
    projects,
    projectCount,
    awaiting,
    clientCount,
    sharedFiles,
    openInvoices,
    activity,
    pending,
  ] = await Promise.all([
    listRecentProjects(membership.workspaceId),
    countActiveProjects(membership.workspaceId),
    countAwaitingApproval(membership.workspaceId),
    internal ? countActiveClients(membership.workspaceId) : Promise.resolve(0),
    internal ? countSharedFiles(membership.workspaceId) : Promise.resolve(0),
    countOpenInvoices(membership.workspaceId),
    listRecentActivity(membership.workspaceId),
    listAwaitingDeliverables(membership.workspaceId),
  ]);

  const stats = internal
    ? [
        { label: "Projects", value: String(projectCount) },
        { label: "Clients", value: String(clientCount) },
        { label: "Awaiting", value: String(awaiting) },
        { label: "Open invoices", value: String(openInvoices) },
        { label: "Shared files", value: String(sharedFiles) },
      ]
    : [
        { label: "Your projects", value: String(projectCount) },
        { label: "Awaiting", value: String(pending.length) },
        { label: "Open invoices", value: String(openInvoices) },
      ];

  return (
    <div className="grid gap-12">
      <PageHeader
        title={internal ? "Dashboard" : "Your projects"}
        description={
          internal
            ? "Clients, projects, and work that still needs a decision."
            : "Work assigned to your company. You only see projects you are a contact on."
        }
        action={
          internal ? (
            <Link href="/app/projects/new" className={primaryButtonClass}>
              New project
            </Link>
          ) : null
        }
      />

      <MetaLine items={stats} />

      <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-12">
          {pending.length > 0 ? (
            <Attention title={internal ? "Awaiting a client decision" : "Needs your decision"}>
              <ul className={listClass}>
                {pending.map((item) => (
                  <li key={item.id} className={rowClass}>
                    <div>
                      <Link
                        href={`/app/deliverables/${item.id}`}
                        className="font-medium hover:text-accent"
                      >
                        {item.title}
                      </Link>
                      <p className="text-sm text-muted">{item.projectName}</p>
                    </div>
                    <StatusPill>Awaiting approval</StatusPill>
                  </li>
                ))}
              </ul>
            </Attention>
          ) : null}

          <section aria-labelledby="recent-projects-heading" className="grid gap-4">
            <div className="flex items-center justify-between gap-4">
              <h2 id="recent-projects-heading" className="text-xl font-medium">
                {internal ? "Recent projects" : "Assigned projects"}
              </h2>
              <Link
                href="/app/projects"
                className="text-sm text-accent underline-offset-2 hover:underline"
              >
                View all
              </Link>
            </div>
            {projects.length === 0 ? (
              <EmptyState title="No projects yet">
                {internal ? (
                  <p>
                    Create a client, then add a project.{" "}
                    <Link
                      href="/app/clients/new"
                      className="text-accent underline-offset-2 hover:underline"
                    >
                      Add a client
                    </Link>
                  </p>
                ) : (
                  <p>When the agency assigns your company to a project, it will show up here.</p>
                )}
              </EmptyState>
            ) : (
              <ul className={listClass}>
                {projects.map((project) => (
                  <li key={project.id} className={rowClass}>
                    <div>
                      <Link
                        href={`/app/projects/${project.id}`}
                        className="font-medium hover:text-accent"
                      >
                        {project.name}
                      </Link>
                      <p className="text-sm text-muted">{project.clientName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusPill>
                        {projectStatusLabel(project.status, project.archivedAt)}
                      </StatusPill>
                      {project.dueDate ? (
                        <span className="text-sm text-muted">Due {formatDay(project.dueDate)}</span>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <section aria-labelledby="activity-heading" className="grid gap-4">
          <h2 id="activity-heading" className="text-xl font-medium">
            Activity
          </h2>
          {activity.length === 0 ? (
            <EmptyState title="No activity yet">
              Project changes, files, and status updates will appear here.
            </EmptyState>
          ) : (
            <ol className={listClass}>
              {activity.map((event) => (
                <li key={event.id} className="grid gap-1 px-4 py-3">
                  <p className="text-sm">{event.summary}</p>
                  <p className="text-sm text-muted">
                    <Link
                      href={`/app/projects/${event.projectId}`}
                      className="hover:text-accent hover:underline"
                    >
                      {event.projectName}
                    </Link>
                    <span aria-hidden> · </span>
                    <time dateTime={event.createdAt}>{formatWhen(event.createdAt)}</time>
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}

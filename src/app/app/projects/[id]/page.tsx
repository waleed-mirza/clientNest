import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AccessDenied } from "@/components/app/access-denied";
import { EmptyState } from "@/components/app/empty-state";
import { MetaLine } from "@/components/app/meta-line";
import { PageHeader } from "@/components/app/page-header";
import { StatusPill } from "@/components/app/status-pill";
import { listClass, primaryButtonClass, rowClass } from "@/components/app/styles";
import { requireMembership } from "@/features/auth/session";
import { listClientOptions, listWorkspacePeople } from "@/features/clients/queries";
import { listProjectActivity } from "@/features/activity/queries";
import { listProjectDeliverables } from "@/features/deliverables/queries";
import { FileDeleteForm, FileUploadForm } from "@/features/files/forms";
import { listProjectFiles } from "@/features/files/queries";
import { listInvoices } from "@/features/invoices/queries";
import { ArchiveProjectForm, ProjectForm } from "@/features/projects/forms";
import { getProject, listProjectMembers } from "@/features/projects/queries";
import {
  MilestoneCreateForm,
  MilestoneRow,
  TaskCreateForm,
  TaskRow,
} from "@/features/projects/workflow-forms";
import { listMilestones, listTasks } from "@/features/projects/workflow-queries";
import { formatWhen } from "@/lib/activity/time";
import { fileVisibilityLabel, formatBytes } from "@/lib/files/rules";
import { deliverableStatusLabel } from "@/lib/deliverables/status";
import { invoiceStatusLabel } from "@/lib/invoices/status";
import { formatDay, projectStatusLabel } from "@/lib/projects/status";
import { firstParam } from "@/lib/search";
import { isInternalRole } from "@/lib/security/roles";
import { parseUuid } from "@/lib/validation/id";

export const metadata = { title: "Project" };

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "files", label: "Files" },
  { id: "deliverables", label: "Deliverables" },
  { id: "invoices", label: "Invoices" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function isTab(value: string | undefined): value is TabId {
  return tabs.some((tab) => tab.id === value);
}

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const membership = await requireMembership();
  const internal = isInternalRole(membership.role);
  const { id: rawId } = await params;
  const id = parseUuid(rawId);
  if (!id) notFound();

  const project = await getProject(membership.workspaceId, id);
  if (!project) {
    return (
      <AccessDenied
        title="Project"
        message="This project isn't available. It may not exist, or your role cannot see it."
      />
    );
  }

  const tabParam = firstParam((await searchParams).tab);
  const tab: TabId = isTab(tabParam) ? tabParam : "overview";

  const [members, clients, people, milestones, tasks, files, deliverables, invoices, activity] =
    await Promise.all([
      listProjectMembers(project.id),
      internal ? listClientOptions(membership.workspaceId) : Promise.resolve([]),
      internal ? listWorkspacePeople(membership.workspaceId) : Promise.resolve([]),
      listMilestones(project.id),
      listTasks(project.id),
      listProjectFiles(project.id),
      listProjectDeliverables(project.id),
      listInvoices({ workspaceId: membership.workspaceId, projectId: project.id }),
      listProjectActivity(project.id, 12),
    ]);

  const clientOptions =
    clients.some((client) => client.id === project.clientId) || !internal
      ? clients
      : [{ id: project.clientId, name: project.clientName }, ...clients];
  const canEdit = internal && !project.archivedAt;
  const peopleOptions = people.map((person) => ({ id: person.id, fullName: person.fullName }));
  const milestoneOptions = milestones.map((milestone) => ({
    id: milestone.id,
    name: milestone.name,
  }));
  const status = projectStatusLabel(project.status, project.archivedAt);
  const workflowColumnClass = `grid min-w-0 items-start content-start gap-4 lg:grid-rows-subgrid lg:gap-x-0 lg:gap-y-4 ${
    canEdit ? "lg:row-span-3" : "lg:row-span-2"
  }`;

  return (
    <div className="grid gap-10">
      <PageHeader title={project.name} action={<StatusPill>{status}</StatusPill>} />
      <MetaLine
        items={[
          { label: "Client", value: project.clientName },
          { label: "Start", value: formatDay(project.startDate) },
          { label: "Due", value: formatDay(project.dueDate) },
        ]}
      />
      {internal ? (
        <p className="text-sm text-muted">
          <Link
            href={`/app/clients/${project.clientId}`}
            className="hover:text-accent hover:underline"
          >
            {project.clientName}
          </Link>
          {project.description ? ` · ${project.description}` : ""}
        </p>
      ) : project.description ? (
        <p className="text-sm text-muted">{project.description}</p>
      ) : null}

      <nav aria-label="Project sections" className="flex flex-wrap gap-1 border-b border-border">
        {tabs.map((item) => {
          const current = tab === item.id;
          const href =
            item.id === "overview"
              ? `/app/projects/${project.id}`
              : `/app/projects/${project.id}?tab=${item.id}`;
          return (
            <Link
              key={item.id}
              href={href}
              aria-current={current ? "page" : undefined}
              className={`-mb-px border-b-2 px-3 py-2 text-sm transition-colors duration-150 ${
                current
                  ? "border-accent font-medium text-foreground"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {tab === "overview" ? (
        <div className="grid gap-10">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-4">
            <section aria-labelledby="milestones-heading" className={workflowColumnClass}>
              <h2 id="milestones-heading" className="text-xl font-medium">
                Milestones
              </h2>
              {milestones.length === 0 ? (
                <EmptyState title="No milestones yet">
                  {canEdit ? "Add a few checkpoints so the client can see progress." : null}
                </EmptyState>
              ) : (
                <ul className={listClass}>
                  {milestones.map((milestone) => (
                    <li key={milestone.id}>
                      <MilestoneRow milestone={milestone} canEdit={canEdit} />
                    </li>
                  ))}
                </ul>
              )}
              {canEdit ? <MilestoneCreateForm projectId={project.id} /> : null}
            </section>

            <section aria-labelledby="tasks-heading" className={workflowColumnClass}>
              <h2 id="tasks-heading" className="text-xl font-medium">
                Tasks
              </h2>
              {tasks.length === 0 ? (
                <EmptyState title="No tasks yet">
                  {canEdit ? "Keep this list short. Status, owner, and due date are enough." : null}
                </EmptyState>
              ) : (
                <ul className={listClass}>
                  {tasks.map((task) => (
                    <li key={task.id}>
                      <TaskRow
                        task={task}
                        milestones={milestoneOptions}
                        people={peopleOptions}
                        canEdit={canEdit}
                      />
                    </li>
                  ))}
                </ul>
              )}
              {canEdit ? (
                <TaskCreateForm
                  projectId={project.id}
                  milestones={milestoneOptions}
                  people={peopleOptions}
                />
              ) : null}
            </section>
          </div>

          <section aria-labelledby="activity-heading" className="grid gap-4">
            <h2 id="activity-heading" className="text-xl font-medium">
              Activity
            </h2>
            {activity.length === 0 ? (
              <EmptyState title="No activity yet">
                Creating a milestone, task, or file will start this timeline.
              </EmptyState>
            ) : (
              <ol className={listClass}>
                {activity.map((event) => (
                  <li key={event.id} className={rowClass}>
                    <p>{event.summary}</p>
                    <time className="text-sm text-muted" dateTime={event.createdAt}>
                      {formatWhen(event.createdAt)}
                    </time>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section aria-labelledby="team-heading" className="grid gap-4">
            <h2 id="team-heading" className="text-xl font-medium">
              Team
            </h2>
            {members.length === 0 ? (
              <EmptyState title="No one assigned yet">
                {internal ? "Save the project with at least one internal member." : null}
              </EmptyState>
            ) : (
              <ul className={listClass}>
                {members.map((member) => (
                  <li key={member.id} className="px-4 py-3 text-sm">
                    {member.fullName || "Unnamed member"}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {internal ? (
            <details className="group max-w-xl">
              <summary className="w-fit cursor-pointer list-none rounded-sm">
                <h2
                  id="project-settings-heading"
                  className="inline-flex items-center gap-2 text-xl font-medium !leading-none"
                >
                  Project settings
                  <ChevronDown
                    aria-hidden
                    className="block size-[1em] shrink-0 text-muted transition-transform duration-150 group-open:rotate-180"
                    strokeWidth={1.75}
                  />
                </h2>
              </summary>
              <div className="mt-4 grid gap-4">
                <div className="bg-surface p-5">
                  <ProjectForm
                    project={project}
                    clients={clientOptions}
                    people={people}
                    selectedMemberIds={members.map((member) => member.profileId)}
                  />
                </div>
                <ArchiveProjectForm id={project.id} archived={Boolean(project.archivedAt)} />
              </div>
            </details>
          ) : (
            <p className="text-sm text-muted">
              You can view this project. Ask the agency team if something needs to change.
            </p>
          )}
        </div>
      ) : null}

      {tab === "files" ? (
        <section aria-labelledby="files-heading" className="grid gap-4">
          <h2 id="files-heading" className="text-xl font-medium">
            Files
          </h2>
          {canEdit ? <FileUploadForm projectId={project.id} /> : null}
          {files.length === 0 ? (
            <EmptyState title="No files yet">
              {canEdit
                ? "Upload a PDF or image. Team-only files stay hidden from the client."
                : "When the agency shares a file, it will show up here."}
            </EmptyState>
          ) : (
            <ul className={listClass}>
              {files.map((file) => (
                <li key={file.id} className={rowClass}>
                  <div>
                    <a
                      href={`/app/files/${file.id}/download`}
                      className="font-medium hover:text-accent"
                    >
                      {file.originalName}
                    </a>
                    <p className="text-sm text-muted">
                      {fileVisibilityLabel(file.visibility)} · {formatBytes(file.byteSize)}
                      {file.uploadedByName ? ` · ${file.uploadedByName}` : ""}
                    </p>
                  </div>
                  {canEdit ? <FileDeleteForm id={file.id} projectId={project.id} /> : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {tab === "deliverables" ? (
        <section aria-labelledby="deliverables-heading" className="grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="deliverables-heading" className="text-xl font-medium">
              Deliverables
            </h2>
            {canEdit ? (
              <Link
                href={`/app/projects/${project.id}/deliverables/new`}
                className={primaryButtonClass}
              >
                New deliverable
              </Link>
            ) : null}
          </div>
          {deliverables.length === 0 ? (
            <EmptyState title="No deliverables yet">
              {canEdit
                ? "Submit a version, add a note, and request client approval."
                : "When the agency sends work for review, it will show up here."}
            </EmptyState>
          ) : (
            <ul className={listClass}>
              {deliverables.map((item) => (
                <li key={item.id} className={rowClass}>
                  <div>
                    <Link
                      href={`/app/deliverables/${item.id}`}
                      className="font-medium hover:text-accent"
                    >
                      {item.title}
                    </Link>
                    <p className="text-sm text-muted">Version {item.version}</p>
                  </div>
                  <StatusPill>{deliverableStatusLabel(item.status)}</StatusPill>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {tab === "invoices" ? (
        <section aria-labelledby="invoices-heading" className="grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="invoices-heading" className="text-xl font-medium">
              Invoices
            </h2>
            {internal ? (
              <Link
                href={`/app/invoices/new?projectId=${project.id}`}
                className="text-sm text-accent underline-offset-2 hover:underline"
              >
                New invoice
              </Link>
            ) : null}
          </div>
          {invoices.length === 0 ? (
            <EmptyState title="No invoices yet">
              {internal
                ? "Create a record the client can print. Online payment is not included."
                : "When the agency sends an invoice, it will show up here."}
            </EmptyState>
          ) : (
            <ul className={listClass}>
              {invoices.map((invoice) => (
                <li key={invoice.id} className={rowClass}>
                  <Link
                    href={`/app/invoices/${invoice.id}`}
                    className="font-medium hover:text-accent"
                  >
                    {invoice.number}
                  </Link>
                  <StatusPill>{invoiceStatusLabel(invoice.status)}</StatusPill>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}

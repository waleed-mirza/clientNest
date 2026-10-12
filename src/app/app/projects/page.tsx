import Link from "next/link";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { StatusPill } from "@/components/app/status-pill";
import {
  inputClass,
  listClass,
  primaryButtonClass,
  rowClass,
  secondaryButtonClass,
} from "@/components/app/styles";
import { requireMembership } from "@/features/auth/session";
import { listProjects } from "@/features/projects/queries";
import { formatDay, projectStatusLabel, projectStatuses } from "@/lib/projects/status";
import { firstParam } from "@/lib/search";
import { isInternalRole } from "@/lib/security/roles";

export const metadata = { title: "Projects" };

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    status?: string | string[];
    archived?: string | string[];
  }>;
}) {
  const membership = await requireMembership();
  const internal = isInternalRole(membership.role);
  const params = await searchParams;
  const query = firstParam(params.q);
  const status = firstParam(params.status);
  const archived = firstParam(params.archived) === "1";

  const projects = await listProjects({
    workspaceId: membership.workspaceId,
    query,
    status,
    archived,
  });

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Projects"
        description={
          internal
            ? "Work for each client. Status is a word, not a colour code."
            : "Projects assigned to your company."
        }
        action={
          internal ? (
            <Link href="/app/projects/new" className={primaryButtonClass}>
              New project
            </Link>
          ) : null
        }
      />

      <form className="flex flex-wrap items-end gap-3" method="get">
        {archived ? <input type="hidden" name="archived" value="1" /> : null}
        <label className="grid gap-1 text-sm">
          <span>Search</span>
          <input name="q" defaultValue={query} placeholder="Project name" className={inputClass} />
        </label>
        <label className="grid gap-1 text-sm">
          <span>Status</span>
          <select name="status" defaultValue={status} className={inputClass}>
            <option value="">Any</option>
            {projectStatuses.map((value) => (
              <option key={value} value={value}>
                {projectStatusLabel(value)}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className={secondaryButtonClass}>
          Filter
        </button>
        <Link
          href={archived ? "/app/projects" : "/app/projects?archived=1"}
          className="text-sm text-muted underline-offset-2 hover:text-foreground hover:underline"
        >
          {archived ? "Hide archived" : "Show archived"}
        </Link>
      </form>

      {projects.length === 0 ? (
        <EmptyState
          title={
            query || status
              ? "No projects match those filters"
              : archived
                ? "No archived projects"
                : "No projects yet"
          }
        >
          {internal && !query && !status && !archived ? (
            <p>
              <Link
                href="/app/projects/new"
                className="text-accent underline-offset-2 hover:underline"
              >
                Create a project
              </Link>{" "}
              after you add a client.
            </p>
          ) : (
            <p>Try another filter, or wait until a project is assigned to you.</p>
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
                <StatusPill>{projectStatusLabel(project.status, project.archivedAt)}</StatusPill>
                {project.dueDate ? (
                  <span className="text-sm text-muted">Due {formatDay(project.dueDate)}</span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

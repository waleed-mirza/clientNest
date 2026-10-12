import Link from "next/link";
import { AccessDenied } from "@/components/app/access-denied";
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
import { listClients } from "@/features/clients/queries";
import { firstParam } from "@/lib/search";
import { isInternalRole } from "@/lib/security/roles";

export const metadata = { title: "Clients" };

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; archived?: string | string[] }>;
}) {
  const membership = await requireMembership();
  if (!isInternalRole(membership.role)) {
    return (
      <AccessDenied
        title="Clients"
        message="Client accounts don't have the agency client list. Open Projects to see your work."
      />
    );
  }

  const params = await searchParams;
  const query = firstParam(params.q);
  const archived = firstParam(params.archived) === "1";
  const clients = await listClients({
    workspaceId: membership.workspaceId,
    query,
    archived,
  });

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Clients"
        description="Companies you work with. Archive a client to hide them from the default list."
        action={
          <Link href="/app/clients/new" className={primaryButtonClass}>
            New client
          </Link>
        }
      />

      <form className="flex flex-wrap items-end gap-3" method="get">
        {archived ? <input type="hidden" name="archived" value="1" /> : null}
        <label className="grid gap-1 text-sm">
          <span>Search</span>
          <input name="q" defaultValue={query} placeholder="Company name" className={inputClass} />
        </label>
        <button type="submit" className={secondaryButtonClass}>
          Search
        </button>
        <Link
          href={archived ? "/app/clients" : "/app/clients?archived=1"}
          className="text-sm text-muted underline-offset-2 hover:text-foreground hover:underline"
        >
          {archived ? "Hide archived" : "Show archived"}
        </Link>
      </form>

      {clients.length === 0 ? (
        <EmptyState
          title={
            query
              ? "No clients match that search"
              : archived
                ? "No archived clients"
                : "No clients yet"
          }
        >
          {query || archived ? (
            <p>Try another search or switch back to active clients.</p>
          ) : (
            <p>
              <Link
                href="/app/clients/new"
                className="text-accent underline-offset-2 hover:underline"
              >
                Add a company
              </Link>{" "}
              to start a project.
            </p>
          )}
        </EmptyState>
      ) : (
        <ul className={listClass}>
          {clients.map((client) => (
            <li key={client.id} className={rowClass}>
              <div>
                <Link href={`/app/clients/${client.id}`} className="font-medium hover:text-accent">
                  {client.name}
                </Link>
                {client.website ? <p className="text-sm text-muted">{client.website}</p> : null}
              </div>
              {client.archivedAt ? <StatusPill>Archived</StatusPill> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

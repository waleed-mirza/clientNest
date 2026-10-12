import Link from "next/link";
import { notFound } from "next/navigation";
import { AccessDenied } from "@/components/app/access-denied";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { StatusPill } from "@/components/app/status-pill";
import { listClass, rowClass } from "@/components/app/styles";
import { requireMembership } from "@/features/auth/session";
import { getClient, listClientContacts } from "@/features/clients/queries";
import {
  ArchiveClientForm,
  ClientForm,
  CreateContactForm,
  DeleteContactForm,
} from "@/features/clients/forms";
import { listInvoices } from "@/features/invoices/queries";
import { listProjects } from "@/features/projects/queries";
import { invoiceStatusLabel } from "@/lib/invoices/status";
import { formatDay, projectStatusLabel } from "@/lib/projects/status";
import { firstParam } from "@/lib/search";
import { isInternalRole } from "@/lib/security/roles";
import { parseUuid } from "@/lib/validation/id";

export const metadata = { title: "Client" };

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "contacts", label: "Contacts" },
  { id: "projects", label: "Projects" },
  { id: "invoices", label: "Invoices" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function isTab(value: string | undefined): value is TabId {
  return tabs.some((tab) => tab.id === value);
}

export default async function ClientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const membership = await requireMembership();
  if (!isInternalRole(membership.role)) {
    return (
      <AccessDenied
        title="Client"
        message="Client accounts don't have the agency client list. Open Projects to see your work."
      />
    );
  }

  const { id: rawId } = await params;
  const id = parseUuid(rawId);
  if (!id) notFound();

  const client = await getClient(membership.workspaceId, id);
  if (!client) notFound();

  const tabParam = firstParam((await searchParams).tab);
  const tab: TabId = isTab(tabParam) ? tabParam : "overview";

  const [contacts, projects, invoices] = await Promise.all([
    listClientContacts(client.id),
    listProjects({ workspaceId: membership.workspaceId, clientId: client.id }),
    listInvoices({ workspaceId: membership.workspaceId, clientId: client.id }),
  ]);

  const websiteHref = client.website?.trim() || "";
  const websiteLabel = websiteHref.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <div className="grid gap-10">
      <PageHeader
        title={client.name}
        action={client.archivedAt ? <StatusPill>Archived</StatusPill> : null}
      />
      {websiteHref ? (
        <p className="text-sm text-muted">
          <a href={websiteHref} className="hover:text-accent hover:underline">
            {websiteLabel}
          </a>
        </p>
      ) : null}

      <nav aria-label="Client sections" className="flex flex-wrap gap-1 border-b border-border">
        {tabs.map((item) => {
          const current = tab === item.id;
          const href =
            item.id === "overview"
              ? `/app/clients/${client.id}`
              : `/app/clients/${client.id}?tab=${item.id}`;
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
        <section aria-labelledby="client-details-heading" className="grid gap-4">
          <h2 id="client-details-heading" className="text-xl font-medium">
            Details
          </h2>
          <div className="max-w-xl bg-surface p-5">
            <ClientForm client={client} />
          </div>
          <ArchiveClientForm id={client.id} archived={Boolean(client.archivedAt)} />
        </section>
      ) : null}

      {tab === "contacts" ? (
        <section aria-labelledby="contacts-heading" className="grid gap-4">
          <h2 id="contacts-heading" className="text-xl font-medium">
            Contacts
          </h2>
          {contacts.length === 0 ? (
            <EmptyState title="No contacts yet">
              Add someone at this company. If they already have a ClientNest login in this
              workspace, they will be linked automatically.
            </EmptyState>
          ) : (
            <ul className={listClass}>
              {contacts.map((contact) => (
                <li key={contact.id} className="flex items-start justify-between gap-4 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{contact.name}</p>
                    <p className="text-sm text-muted">
                      {contact.email}
                      {contact.title ? ` · ${contact.title}` : ""}
                      {contact.profileId ? " · linked account" : ""}
                    </p>
                  </div>
                  <DeleteContactForm id={contact.id} clientId={client.id} />
                </li>
              ))}
            </ul>
          )}
          <div className="max-w-xl bg-surface p-5">
            <CreateContactForm clientId={client.id} />
          </div>
        </section>
      ) : null}

      {tab === "projects" ? (
        <section aria-labelledby="client-projects-heading" className="grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="client-projects-heading" className="text-xl font-medium">
              Projects
            </h2>
            <Link
              href={`/app/projects/new?clientId=${client.id}`}
              className="text-sm text-accent underline-offset-2 hover:underline"
            >
              New project
            </Link>
          </div>
          {projects.length === 0 ? (
            <EmptyState title="No projects for this client">
              <Link
                href={`/app/projects/new?clientId=${client.id}`}
                className="text-accent underline-offset-2 hover:underline"
              >
                Create a project
              </Link>
            </EmptyState>
          ) : (
            <ul className={listClass}>
              {projects.map((project) => (
                <li key={project.id} className={rowClass}>
                  <Link
                    href={`/app/projects/${project.id}`}
                    className="font-medium hover:text-accent"
                  >
                    {project.name}
                  </Link>
                  <div className="flex items-center gap-3">
                    <StatusPill>
                      {projectStatusLabel(project.status, project.archivedAt)}
                    </StatusPill>
                    <span className="text-sm text-muted">Due {formatDay(project.dueDate)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {tab === "invoices" ? (
        <section aria-labelledby="client-invoices-heading" className="grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="client-invoices-heading" className="text-xl font-medium">
              Invoices
            </h2>
            <Link
              href="/app/invoices/new"
              className="text-sm text-accent underline-offset-2 hover:underline"
            >
              New invoice
            </Link>
          </div>
          {invoices.length === 0 ? (
            <EmptyState title="No invoices for this client">
              Create a record after work is ready to bill. Online payment is not included.
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

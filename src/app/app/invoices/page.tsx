import Link from "next/link";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { StatusPill } from "@/components/app/status-pill";
import { listClass, primaryButtonClass, rowClass } from "@/components/app/styles";
import { requireMembership } from "@/features/auth/session";
import { listInvoices } from "@/features/invoices/queries";
import { invoiceStatusLabel } from "@/lib/invoices/status";
import { formatDay } from "@/lib/projects/status";
import { isInternalRole } from "@/lib/security/roles";

export const metadata = { title: "Invoices" };

export default async function InvoicesPage() {
  const membership = await requireMembership();
  const internal = isInternalRole(membership.role);
  const invoices = await listInvoices({ workspaceId: membership.workspaceId });

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Invoices"
        description={
          internal
            ? "Records and print layouts. Online payment is not included."
            : "Invoices the agency has sent for your company. Print a copy; nothing is charged here."
        }
        action={
          internal ? (
            <Link href="/app/invoices/new" className={primaryButtonClass}>
              New invoice
            </Link>
          ) : null
        }
      />

      {invoices.length === 0 ? (
        <EmptyState title={internal ? "No invoices yet" : "No invoices to show"}>
          {internal ? (
            <p>
              <Link
                href="/app/invoices/new"
                className="text-accent underline-offset-2 hover:underline"
              >
                Create an invoice
              </Link>{" "}
              for a project. Clients only see invoices after you send them.
            </p>
          ) : (
            <p>When the agency sends an invoice, it will show up here.</p>
          )}
        </EmptyState>
      ) : (
        <ul className={listClass}>
          {invoices.map((invoice) => (
            <li key={invoice.id} className={rowClass}>
              <div>
                <Link
                  href={`/app/invoices/${invoice.id}`}
                  className="font-medium hover:text-accent"
                >
                  {invoice.number}
                </Link>
                <p className="text-sm text-muted">
                  {invoice.clientName} · {invoice.projectName}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusPill>{invoiceStatusLabel(invoice.status)}</StatusPill>
                <span className="text-sm text-muted">Issued {formatDay(invoice.issueDate)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

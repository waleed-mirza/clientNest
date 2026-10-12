import Link from "next/link";
import { notFound } from "next/navigation";
import { AccessDenied } from "@/components/app/access-denied";
import { EmptyState } from "@/components/app/empty-state";
import { MetaLine } from "@/components/app/meta-line";
import { PageHeader } from "@/components/app/page-header";
import { StatusPill } from "@/components/app/status-pill";
import { secondaryButtonClass } from "@/components/app/styles";
import { requireMembership } from "@/features/auth/session";
import {
  AddInvoiceItemForm,
  DeleteInvoiceItemForm,
  InvoiceStatusForms,
} from "@/features/invoices/forms";
import { getInvoice, invoiceTotal, listInvoiceItems } from "@/features/invoices/queries";
import { formatCents, formatQuantity, lineTotalCents } from "@/lib/invoices/money";
import {
  canEditInvoiceItems,
  invoiceStatusLabel,
  isClientVisibleInvoice,
} from "@/lib/invoices/status";
import { formatDay } from "@/lib/projects/status";
import { isInternalRole } from "@/lib/security/roles";
import { parseUuid } from "@/lib/validation/id";

export const metadata = { title: "Invoice" };

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const membership = await requireMembership();
  const internal = isInternalRole(membership.role);
  const { id: rawId } = await params;
  const id = parseUuid(rawId);
  if (!id) notFound();

  const invoice = await getInvoice(membership.workspaceId, id);
  if (!invoice) {
    return (
      <AccessDenied
        title="Invoice"
        message="This invoice isn't available. Drafts stay with the agency until they are sent."
      />
    );
  }

  const items = await listInvoiceItems(invoice.id);
  const total = invoiceTotal(items);
  const canPrint = internal || isClientVisibleInvoice(invoice.status);

  return (
    <div className="grid gap-10">
      <PageHeader
        title={invoice.number}
        description={`${invoice.clientName} · ${invoice.projectName}`}
        action={<StatusPill>{invoiceStatusLabel(invoice.status)}</StatusPill>}
      />

      <MetaLine
        items={[
          { label: "Issued", value: formatDay(invoice.issueDate) },
          { label: "Due", value: formatDay(invoice.dueDate) },
          { label: "Total", value: formatCents(total) },
        ]}
      />

      {invoice.notes ? <p className="max-w-2xl text-sm text-muted">{invoice.notes}</p> : null}

      <section aria-labelledby="lines-heading" className="grid gap-4">
        <h2 id="lines-heading" className="text-xl font-medium">
          Line items
        </h2>
        {items.length === 0 ? (
          <EmptyState title="No lines yet">
            {internal && canEditInvoiceItems(invoice.status)
              ? "Add at least one line before sending."
              : null}
          </EmptyState>
        ) : (
          <ul className="divide-y divide-border bg-surface">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="font-medium">{item.description}</p>
                  <p className="text-sm text-muted">
                    {formatQuantity(item.quantity)} × {formatCents(item.unitAmountCents)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-medium">
                    {formatCents(lineTotalCents(item.quantity, item.unitAmountCents))}
                  </p>
                  {internal && canEditInvoiceItems(invoice.status) ? (
                    <DeleteInvoiceItemForm id={item.id} invoiceId={invoice.id} />
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
        {internal && canEditInvoiceItems(invoice.status) ? (
          <AddInvoiceItemForm invoiceId={invoice.id} />
        ) : null}
      </section>

      <div className="flex flex-wrap items-center gap-3">
        {canPrint ? (
          <Link href={`/app/invoices/${invoice.id}/print`} className={secondaryButtonClass}>
            Print view
          </Link>
        ) : null}
        {internal ? <InvoiceStatusForms id={invoice.id} status={invoice.status} /> : null}
      </div>

      <p className="text-sm text-muted">
        This is a record only. ClientNest does not collect online payment.
      </p>
    </div>
  );
}

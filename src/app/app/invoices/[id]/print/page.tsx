import Link from "next/link";
import { notFound } from "next/navigation";
import { AccessDenied } from "@/components/app/access-denied";
import { requireMembership } from "@/features/auth/session";
import { PrintInvoiceButton } from "@/features/invoices/print-button";
import { getInvoice, invoiceTotal, listInvoiceItems } from "@/features/invoices/queries";
import { formatCents, formatQuantity, lineTotalCents } from "@/lib/invoices/money";
import { invoiceStatusLabel, isClientVisibleInvoice } from "@/lib/invoices/status";
import { formatDay } from "@/lib/projects/status";
import { isInternalRole } from "@/lib/security/roles";
import { parseUuid } from "@/lib/validation/id";

export const metadata = { title: "Print invoice" };

export default async function InvoicePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const membership = await requireMembership();
  const internal = isInternalRole(membership.role);
  const { id: rawId } = await params;
  const id = parseUuid(rawId);
  if (!id) notFound();

  const invoice = await getInvoice(membership.workspaceId, id);
  if (!invoice || (!internal && !isClientVisibleInvoice(invoice.status))) {
    return <AccessDenied title="Invoice" message="This invoice isn't available to print." />;
  }

  const items = await listInvoiceItems(invoice.id);
  const total = invoiceTotal(items);

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href={`/app/invoices/${invoice.id}`}
          className="text-sm hover:text-accent hover:underline"
        >
          Back to invoice
        </Link>
        <PrintInvoiceButton />
      </div>

      <article className="bg-surface p-6 print:bg-transparent print:p-0">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-serif text-lg font-semibold">{membership.workspaceName}</p>
            <h1 className="mt-1 font-mono text-[1.75rem] font-medium">{invoice.number}</h1>
            <p className="mt-1 text-sm text-muted">{invoiceStatusLabel(invoice.status)}</p>
          </div>
          <div className="text-sm">
            <p>Issued {formatDay(invoice.issueDate)}</p>
            {invoice.dueDate ? <p>Due {formatDay(invoice.dueDate)}</p> : null}
          </div>
        </header>

        <section className="mt-8 grid gap-1 text-sm">
          <p className="text-muted">Bill to</p>
          <p className="font-medium">{invoice.clientName}</p>
          <p>{invoice.projectName}</p>
        </section>

        <table className="mt-8 w-full text-left text-sm">
          <caption className="sr-only">Invoice line items</caption>
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="py-2 font-medium">
                Description
              </th>
              <th scope="col" className="py-2 font-medium">
                Qty
              </th>
              <th scope="col" className="py-2 font-medium">
                Amount
              </th>
              <th scope="col" className="py-2 text-right font-medium">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-border">
                <td className="py-2">{item.description}</td>
                <td className="py-2">{formatQuantity(item.quantity)}</td>
                <td className="py-2">{formatCents(item.unitAmountCents)}</td>
                <td className="py-2 text-right">
                  {formatCents(lineTotalCents(item.quantity, item.unitAmountCents))}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" colSpan={3} className="py-3 text-right font-medium">
                Total
              </th>
              <td className="py-3 text-right font-semibold">{formatCents(total)}</td>
            </tr>
          </tfoot>
        </table>

        {invoice.notes ? <p className="mt-6 text-sm">{invoice.notes}</p> : null}

        <p className="mt-8 text-sm text-muted">
          This invoice is a record only. Online payment is not included in ClientNest.
        </p>
      </article>
    </div>
  );
}

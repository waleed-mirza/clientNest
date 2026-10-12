export const invoiceStatuses = ["draft", "sent", "paid", "void"] as const;
export type InvoiceStatus = (typeof invoiceStatuses)[number];

const labels: Record<InvoiceStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  void: "Void",
};

export function isInvoiceStatus(value: string): value is InvoiceStatus {
  return (invoiceStatuses as readonly string[]).includes(value);
}

export function invoiceStatusLabel(status: InvoiceStatus): string {
  return labels[status];
}

export function canEditInvoiceItems(status: InvoiceStatus): boolean {
  return status === "draft";
}

export function canSendInvoice(status: InvoiceStatus): boolean {
  return status === "draft";
}

export function canMarkInvoicePaid(status: InvoiceStatus): boolean {
  return status === "sent";
}

export function canVoidInvoice(status: InvoiceStatus): boolean {
  return status === "draft" || status === "sent";
}

export function isClientVisibleInvoice(status: InvoiceStatus): boolean {
  return status === "sent" || status === "paid";
}

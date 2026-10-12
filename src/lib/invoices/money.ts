export type InvoiceLineInput = { quantity: number; unitAmountCents: number };

export function parseMoneyToCents(raw: string): number | null {
  const trimmed = raw.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  const [dollars, cents = "00"] = trimmed.split(".");
  const value = Number(dollars) * 100 + Number(cents.padEnd(2, "0"));
  if (!Number.isInteger(value) || value < 0 || value > 10_000_000) return null;
  return value;
}

export function parseQuantity(raw: string): number | null {
  const trimmed = raw.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value <= 0 || value > 9999.99) return null;
  return value;
}

export function lineTotalCents(quantity: number, unitAmountCents: number): number {
  return Math.round(quantity * unitAmountCents);
}

export function invoiceTotalCents(lines: InvoiceLineInput[]): number {
  return lines.reduce((sum, line) => sum + lineTotalCents(line.quantity, line.unitAmountCents), 0);
}

export function formatCents(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export function formatQuantity(quantity: number): string {
  return Number.isInteger(quantity)
    ? String(quantity)
    : quantity.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

export function nextInvoiceNumber(
  existingCount: number,
  year = new Date().getUTCFullYear(),
): string {
  const sequence = Math.max(1, existingCount + 1);
  return `INV-${year}-${String(sequence).padStart(4, "0")}`;
}

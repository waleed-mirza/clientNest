import { createClient } from "@/lib/supabase/server";
import { relationOne } from "@/lib/supabase/relation";
import { invoiceTotalCents } from "@/lib/invoices/money";
import { isInvoiceStatus, type InvoiceStatus } from "@/lib/invoices/status";

export type InvoiceRecord = {
  id: string;
  number: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string | null;
  notes: string | null;
  projectId: string;
  projectName: string;
  clientId: string;
  clientName: string;
  createdAt: string;
};

export type InvoiceItemRecord = {
  id: string;
  description: string;
  quantity: number;
  unitAmountCents: number;
  sortOrder: number;
};

function asStatus(value: string): InvoiceStatus {
  return isInvoiceStatus(value) ? value : "draft";
}

function mapInvoice(row: {
  id: string;
  number: string;
  status: string;
  issue_date: string;
  due_date: string | null;
  notes: string | null;
  project_id: string;
  client_id: string;
  created_at: string;
  projects: { name: string } | { name: string }[] | null;
  clients: { name: string } | { name: string }[] | null;
}): InvoiceRecord {
  const project = relationOne(row.projects);
  const client = relationOne(row.clients);
  return {
    id: row.id,
    number: row.number,
    status: asStatus(row.status),
    issueDate: row.issue_date,
    dueDate: row.due_date,
    notes: row.notes,
    projectId: row.project_id,
    projectName: project?.name ?? "Project",
    clientId: row.client_id,
    clientName: client?.name ?? "Client",
    createdAt: row.created_at,
  };
}

const invoiceSelect =
  "id, number, status, issue_date, due_date, notes, project_id, client_id, created_at, projects!project_id(name), clients!client_id(name)";

export async function listInvoices(input: {
  workspaceId: string;
  clientId?: string;
  projectId?: string;
}): Promise<InvoiceRecord[]> {
  const supabase = await createClient();
  let request = supabase
    .from("invoices")
    .select(invoiceSelect)
    .eq("workspace_id", input.workspaceId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (input.clientId) request = request.eq("client_id", input.clientId);
  if (input.projectId) request = request.eq("project_id", input.projectId);

  const { data, error } = await request;
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapInvoice);
}

export async function getInvoice(workspaceId: string, id: string): Promise<InvoiceRecord | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select(invoiceSelect)
    .eq("workspace_id", workspaceId)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapInvoice(data);
}

export async function listInvoiceItems(invoiceId: string): Promise<InvoiceItemRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoice_items")
    .select("id, description, quantity, unit_amount_cents, sort_order")
    .eq("invoice_id", invoiceId)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    description: row.description,
    quantity: Number(row.quantity),
    unitAmountCents: row.unit_amount_cents,
    sortOrder: row.sort_order,
  }));
}

export async function countOpenInvoices(workspaceId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .eq("status", "sent");

  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function countInvoices(workspaceId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

export function invoiceTotal(items: InvoiceItemRecord[]): number {
  return invoiceTotalCents(
    items.map((item) => ({ quantity: item.quantity, unitAmountCents: item.unitAmountCents })),
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentMembership } from "@/features/auth/session";
import { actorLabel, recordActivity } from "@/features/activity/record";
import {
  listClientRecipients,
  listProjectTeamRecipients,
  notifyPeople,
} from "@/features/notifications/notify";
import { formString } from "@/lib/form-data";
import { nextInvoiceNumber, parseMoneyToCents, parseQuantity } from "@/lib/invoices/money";
import {
  canMarkInvoicePaid,
  canSendInvoice,
  canVoidInvoice,
  isInvoiceStatus,
} from "@/lib/invoices/status";
import { demoWriteBlocked } from "@/lib/demo/guard";
import { canManageRecords } from "@/lib/security/roles";
import {
  addInvoiceItemSchema,
  createInvoiceSchema,
  deleteInvoiceItemSchema,
  invoiceIdSchema,
} from "@/lib/validation/records";

export type RecordState = { ok: boolean; message: string };

function deny(): RecordState {
  return { ok: false, message: "You don't have permission to change invoices." };
}

async function requireInternal() {
  const blocked = demoWriteBlocked();
  if (blocked) return { error: blocked, membership: null };
  if (!isSupabaseConfigured()) {
    return {
      error: { ok: false, message: "Supabase is not configured." } as RecordState,
      membership: null,
    };
  }
  const membership = await getCurrentMembership();
  if (!membership) {
    return { error: { ok: false, message: "You need a workspace first." }, membership: null };
  }
  if (!canManageRecords(membership.role)) return { error: deny(), membership: null };
  return { error: null, membership };
}

function refreshInvoice(id?: string) {
  revalidatePath("/app", "layout");
  revalidatePath("/app/invoices");
  if (id) {
    revalidatePath(`/app/invoices/${id}`);
    revalidatePath(`/app/invoices/${id}/print`);
  }
}

export async function createInvoiceRecord(
  _prev: RecordState,
  formData: FormData,
): Promise<RecordState> {
  const { error, membership } = await requireInternal();
  if (error || !membership) return error ?? deny();

  const parsed = createInvoiceSchema.safeParse({
    projectId: formString(formData, "projectId"),
    issueDate: formString(formData, "issueDate"),
    dueDate: formString(formData, "dueDate"),
    notes: formString(formData, "notes"),
    description: formString(formData, "description"),
    quantity: formString(formData, "quantity"),
    unitAmount: formString(formData, "unitAmount"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the invoice details." };
  }

  const quantity = parseQuantity(parsed.data.quantity);
  const unitAmountCents = parseMoneyToCents(parsed.data.unitAmount);
  if (quantity === null || unitAmountCents === null) {
    return { ok: false, message: "Check the quantity and amount." };
  }

  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("id, client_id")
    .eq("id", parsed.data.projectId)
    .eq("workspace_id", membership.workspaceId)
    .maybeSingle();
  if (!project) return { ok: false, message: "Choose a project in this workspace." };

  const { count } = await supabase
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", membership.workspaceId);

  const { data, error: insertError } = await supabase
    .from("invoices")
    .insert({
      workspace_id: membership.workspaceId,
      client_id: project.client_id,
      project_id: project.id,
      number: nextInvoiceNumber(count ?? 0),
      issue_date: parsed.data.issueDate,
      due_date: parsed.data.dueDate,
      notes: parsed.data.notes,
      created_by: membership.userId,
      status: "draft",
    })
    .select("id")
    .single();

  if (insertError) return { ok: false, message: insertError.message };
  if (!data) return { ok: false, message: "Invoice could not be created." };

  const { error: itemError } = await supabase.from("invoice_items").insert({
    workspace_id: membership.workspaceId,
    invoice_id: data.id,
    description: parsed.data.description,
    quantity,
    unit_amount_cents: unitAmountCents,
    sort_order: 0,
  });
  if (itemError) return { ok: false, message: itemError.message };

  refreshInvoice(data.id);
  redirect(`/app/invoices/${data.id}`);
}

export async function addInvoiceItem(_prev: RecordState, formData: FormData): Promise<RecordState> {
  const { error, membership } = await requireInternal();
  if (error || !membership) return error ?? deny();

  const parsed = addInvoiceItemSchema.safeParse({
    invoiceId: formString(formData, "invoiceId"),
    description: formString(formData, "description"),
    quantity: formString(formData, "quantity"),
    unitAmount: formString(formData, "unitAmount"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the line item." };
  }

  const quantity = parseQuantity(parsed.data.quantity);
  const unitAmountCents = parseMoneyToCents(parsed.data.unitAmount);
  if (quantity === null || unitAmountCents === null) {
    return { ok: false, message: "Check the quantity and amount." };
  }

  const supabase = await createClient();
  const { data: invoice } = await supabase
    .from("invoices")
    .select("id, status")
    .eq("id", parsed.data.invoiceId)
    .eq("workspace_id", membership.workspaceId)
    .maybeSingle();
  if (!invoice) return { ok: false, message: "Invoice could not be updated." };
  if (invoice.status !== "draft")
    return { ok: false, message: "Only draft invoices can be edited." };

  const { count } = await supabase
    .from("invoice_items")
    .select("id", { count: "exact", head: true })
    .eq("invoice_id", invoice.id);

  const { error: insertError } = await supabase.from("invoice_items").insert({
    workspace_id: membership.workspaceId,
    invoice_id: invoice.id,
    description: parsed.data.description,
    quantity,
    unit_amount_cents: unitAmountCents,
    sort_order: count ?? 0,
  });
  if (insertError) return { ok: false, message: insertError.message };

  refreshInvoice(invoice.id);
  return { ok: true, message: "Line added." };
}

export async function deleteInvoiceItem(
  _prev: RecordState,
  formData: FormData,
): Promise<RecordState> {
  const { error, membership } = await requireInternal();
  if (error || !membership) return error ?? deny();

  const parsed = deleteInvoiceItemSchema.safeParse({
    id: formString(formData, "id"),
    invoiceId: formString(formData, "invoiceId"),
  });
  if (!parsed.success) return { ok: false, message: "Missing line item." };

  const supabase = await createClient();
  const { data: invoice } = await supabase
    .from("invoices")
    .select("id, status")
    .eq("id", parsed.data.invoiceId)
    .eq("workspace_id", membership.workspaceId)
    .maybeSingle();
  if (!invoice || invoice.status !== "draft") {
    return { ok: false, message: "Only draft invoices can be edited." };
  }

  const { error: deleteError } = await supabase
    .from("invoice_items")
    .delete()
    .eq("id", parsed.data.id)
    .eq("invoice_id", invoice.id)
    .eq("workspace_id", membership.workspaceId);
  if (deleteError) return { ok: false, message: deleteError.message };

  refreshInvoice(invoice.id);
  return { ok: true, message: "Line removed." };
}

export async function sendInvoice(_prev: RecordState, formData: FormData): Promise<RecordState> {
  const { error, membership } = await requireInternal();
  if (error || !membership) return error ?? deny();

  const parsed = invoiceIdSchema.safeParse({ id: formString(formData, "id") });
  if (!parsed.success) return { ok: false, message: "Missing invoice." };

  const supabase = await createClient();
  const { data: invoice } = await supabase
    .from("invoices")
    .select("id, number, status, client_id, project_id")
    .eq("id", parsed.data.id)
    .eq("workspace_id", membership.workspaceId)
    .maybeSingle();
  if (!invoice) return { ok: false, message: "Invoice could not be updated." };
  if (!isInvoiceStatus(invoice.status) || !canSendInvoice(invoice.status)) {
    return { ok: false, message: "Only draft invoices can be sent." };
  }

  const { count } = await supabase
    .from("invoice_items")
    .select("id", { count: "exact", head: true })
    .eq("invoice_id", invoice.id);
  if (!count) return { ok: false, message: "Add at least one line item before sending." };

  const { data, error: updateError } = await supabase
    .from("invoices")
    .update({ status: "sent" })
    .eq("id", invoice.id)
    .eq("workspace_id", membership.workspaceId)
    .select("id")
    .maybeSingle();
  if (updateError) return { ok: false, message: updateError.message };
  if (!data) return { ok: false, message: "Invoice could not be updated." };

  const who = await actorLabel(supabase, membership.userId);
  await recordActivity(supabase, {
    workspaceId: membership.workspaceId,
    projectId: invoice.project_id,
    actorId: membership.userId,
    type: "invoice.sent",
    summary: `${who} sent ${invoice.number}`,
  });

  await notifyPeople(supabase, {
    workspaceId: membership.workspaceId,
    actorId: membership.userId,
    recipients: await listClientRecipients(supabase, invoice.client_id),
    eventType: "invoice.sent",
    title: `${invoice.number} is ready`,
    body: `${who} sent an invoice for your project.`,
    href: `/app/invoices/${invoice.id}`,
  });

  refreshInvoice(invoice.id);
  return { ok: true, message: "Invoice sent." };
}

export async function markInvoicePaid(
  _prev: RecordState,
  formData: FormData,
): Promise<RecordState> {
  const { error, membership } = await requireInternal();
  if (error || !membership) return error ?? deny();

  const parsed = invoiceIdSchema.safeParse({ id: formString(formData, "id") });
  if (!parsed.success) return { ok: false, message: "Missing invoice." };

  const supabase = await createClient();
  const { data: invoice } = await supabase
    .from("invoices")
    .select("id, number, status, client_id, project_id")
    .eq("id", parsed.data.id)
    .eq("workspace_id", membership.workspaceId)
    .maybeSingle();
  if (!invoice) return { ok: false, message: "Invoice could not be updated." };
  if (!isInvoiceStatus(invoice.status) || !canMarkInvoicePaid(invoice.status)) {
    return { ok: false, message: "Only sent invoices can be marked paid." };
  }

  const { data, error: updateError } = await supabase
    .from("invoices")
    .update({ status: "paid" })
    .eq("id", invoice.id)
    .eq("workspace_id", membership.workspaceId)
    .select("id")
    .maybeSingle();
  if (updateError) return { ok: false, message: updateError.message };
  if (!data) return { ok: false, message: "Invoice could not be updated." };

  const who = await actorLabel(supabase, membership.userId);
  await recordActivity(supabase, {
    workspaceId: membership.workspaceId,
    projectId: invoice.project_id,
    actorId: membership.userId,
    type: "invoice.paid",
    summary: `${who} marked ${invoice.number} as paid`,
  });

  await notifyPeople(supabase, {
    workspaceId: membership.workspaceId,
    actorId: membership.userId,
    recipients: [
      ...(await listClientRecipients(supabase, invoice.client_id)),
      ...(await listProjectTeamRecipients(supabase, invoice.project_id, membership.workspaceId)),
    ],
    eventType: "invoice.paid",
    title: `${invoice.number} marked paid`,
    body: `${who} recorded this invoice as paid. No online payment was collected.`,
    href: `/app/invoices/${invoice.id}`,
  });

  refreshInvoice(invoice.id);
  return { ok: true, message: "Invoice marked as paid." };
}

export async function voidInvoice(_prev: RecordState, formData: FormData): Promise<RecordState> {
  const { error, membership } = await requireInternal();
  if (error || !membership) return error ?? deny();

  const parsed = invoiceIdSchema.safeParse({ id: formString(formData, "id") });
  if (!parsed.success) return { ok: false, message: "Missing invoice." };

  const supabase = await createClient();
  const { data: invoice } = await supabase
    .from("invoices")
    .select("id, status")
    .eq("id", parsed.data.id)
    .eq("workspace_id", membership.workspaceId)
    .maybeSingle();
  if (!invoice) return { ok: false, message: "Invoice could not be updated." };
  if (!isInvoiceStatus(invoice.status) || !canVoidInvoice(invoice.status)) {
    return { ok: false, message: "This invoice cannot be voided." };
  }

  const { data, error: updateError } = await supabase
    .from("invoices")
    .update({ status: "void" })
    .eq("id", invoice.id)
    .eq("workspace_id", membership.workspaceId)
    .select("id")
    .maybeSingle();
  if (updateError) return { ok: false, message: updateError.message };
  if (!data) return { ok: false, message: "Invoice could not be updated." };

  refreshInvoice(invoice.id);
  return { ok: true, message: "Invoice voided." };
}

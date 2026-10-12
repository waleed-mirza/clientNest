"use client";

import { useActionState } from "react";
import {
  addInvoiceItem,
  createInvoiceRecord,
  deleteInvoiceItem,
  markInvoicePaid,
  sendInvoice,
  voidInvoice,
  type RecordState,
} from "@/features/invoices/actions";
import { ActionButton } from "@/components/app/action-button";
import { inputClass, primaryButtonClass, secondaryButtonClass } from "@/components/app/styles";
import {
  canMarkInvoicePaid,
  canSendInvoice,
  canVoidInvoice,
  type InvoiceStatus,
} from "@/lib/invoices/status";

const empty: RecordState = { ok: false, message: "" };

function FormStatus({ state }: { state: RecordState }) {
  if (!state.message) return null;
  return (
    <p role="status" className={state.ok ? "text-sm text-accent" : "text-sm text-danger"}>
      {state.message}
    </p>
  );
}

export function InvoiceCreateForm({
  projects,
  defaultProjectId,
}: {
  projects: { id: string; name: string; clientName: string }[];
  defaultProjectId?: string;
}) {
  const [state, action, pending] = useActionState(createInvoiceRecord, empty);
  const today = new Date().toISOString().slice(0, 10);
  return (
    <form noValidate action={action} className="grid gap-4">
      <label className="grid gap-1 text-sm">
        <span>Project</span>
        <select
          name="projectId"
          required
          defaultValue={defaultProjectId ?? ""}
          className={inputClass}
        >
          <option value="" disabled>
            Choose a project
          </option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name} · {project.clientName}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          <span>Issue date</span>
          <input
            name="issueDate"
            type="date"
            required
            defaultValue={today}
            className={inputClass}
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span>Due date (optional)</span>
          <input name="dueDate" type="date" className={inputClass} />
        </label>
      </div>
      <label className="grid gap-1 text-sm">
        <span>Notes (optional)</span>
        <textarea name="notes" rows={3} maxLength={2000} className={inputClass} />
      </label>
      <fieldset className="grid gap-3 rounded-md border border-border p-3">
        <legend className="px-1 text-sm">First line item</legend>
        <label className="grid gap-1 text-sm">
          <span>Description</span>
          <input name="description" required minLength={2} maxLength={80} className={inputClass} />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span>Quantity</span>
            <input
              name="quantity"
              required
              defaultValue="1"
              inputMode="decimal"
              className={inputClass}
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span>Amount (USD)</span>
            <input
              name="unitAmount"
              required
              placeholder="0.00"
              inputMode="decimal"
              className={inputClass}
            />
          </label>
        </div>
      </fieldset>
      <ActionButton
        pending={pending}
        pendingLabel="Creating…"
        className={`justify-self-start ${primaryButtonClass}`}
      >
        Create invoice
      </ActionButton>
      <FormStatus state={state} />
    </form>
  );
}

export function AddInvoiceItemForm({ invoiceId }: { invoiceId: string }) {
  const [state, action, pending] = useActionState(addInvoiceItem, empty);
  return (
    <form action={action} className="grid gap-3 bg-surface p-4">
      <input type="hidden" name="invoiceId" value={invoiceId} />
      <label className="grid gap-1 text-sm">
        <span>Description</span>
        <input name="description" required minLength={2} maxLength={80} className={inputClass} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          <span>Quantity</span>
          <input
            name="quantity"
            required
            defaultValue="1"
            inputMode="decimal"
            className={inputClass}
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span>Amount (USD)</span>
          <input
            name="unitAmount"
            required
            placeholder="0.00"
            inputMode="decimal"
            className={inputClass}
          />
        </label>
      </div>
      <ActionButton
        pending={pending}
        pendingLabel="Adding…"
        className={`justify-self-start ${primaryButtonClass}`}
      >
        Add line
      </ActionButton>
      <FormStatus state={state} />
    </form>
  );
}

export function DeleteInvoiceItemForm({ id, invoiceId }: { id: string; invoiceId: string }) {
  const [state, action, pending] = useActionState(deleteInvoiceItem, empty);
  return (
    <form action={action} className="grid gap-2">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="invoiceId" value={invoiceId} />
      <ActionButton pending={pending} pendingLabel="Removing…" className={secondaryButtonClass}>
        Remove
      </ActionButton>
      <FormStatus state={state} />
    </form>
  );
}

export function InvoiceStatusForms({ id, status }: { id: string; status: InvoiceStatus }) {
  const [sendState, sendAction, sendPending] = useActionState(sendInvoice, empty);
  const [paidState, paidAction, paidPending] = useActionState(markInvoicePaid, empty);
  const [voidState, voidAction, voidPending] = useActionState(voidInvoice, empty);

  return (
    <div className="flex flex-wrap items-start gap-3">
      {canSendInvoice(status) ? (
        <form action={sendAction} className="grid gap-2">
          <input type="hidden" name="id" value={id} />
          <ActionButton pending={sendPending} pendingLabel="Sending…">
            Send invoice
          </ActionButton>
          <FormStatus state={sendState} />
        </form>
      ) : null}
      {canMarkInvoicePaid(status) ? (
        <form action={paidAction} className="grid gap-2">
          <input type="hidden" name="id" value={id} />
          <ActionButton pending={paidPending} pendingLabel="Saving…">
            Mark as paid
          </ActionButton>
          <FormStatus state={paidState} />
        </form>
      ) : null}
      {canVoidInvoice(status) ? (
        <form action={voidAction} className="grid gap-2">
          <input type="hidden" name="id" value={id} />
          <ActionButton
            pending={voidPending}
            pendingLabel="Voiding…"
            className={secondaryButtonClass}
          >
            Void invoice
          </ActionButton>
          <FormStatus state={voidState} />
        </form>
      ) : null}
    </div>
  );
}

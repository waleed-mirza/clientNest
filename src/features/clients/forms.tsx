"use client";

import { useActionState } from "react";
import {
  createClientRecord,
  createContact,
  deleteContact,
  setClientArchived,
  updateClientRecord,
  type RecordState,
} from "@/features/clients/actions";
import { ActionButton } from "@/components/app/action-button";
import {
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
  textButtonClass,
} from "@/components/app/styles";

const empty: RecordState = { ok: false, message: "" };

export function ClientForm({
  client,
}: {
  client?: { id: string; name: string; website: string | null; notes: string | null };
}) {
  const action = client ? updateClientRecord : createClientRecord;
  const [state, formAction, pending] = useActionState(action, empty);

  return (
    <form noValidate action={formAction} className="grid gap-4">
      {client ? <input type="hidden" name="id" value={client.id} /> : null}
      <label className="grid gap-1 text-sm">
        <span>Company name</span>
        <input
          name="name"
          required
          minLength={2}
          maxLength={80}
          defaultValue={client?.name ?? ""}
          className={inputClass}
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span>Website (optional)</span>
        <input
          name="website"
          type="url"
          placeholder="https://"
          defaultValue={client?.website ?? ""}
          className={inputClass}
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span>Notes (optional)</span>
        <textarea
          name="notes"
          rows={4}
          maxLength={2000}
          defaultValue={client?.notes ?? ""}
          className={inputClass}
        />
      </label>
      <ActionButton
        pending={pending}
        pendingLabel="Saving…"
        className={`justify-self-start ${primaryButtonClass}`}
      >
        {client ? "Save client" : "Create client"}
      </ActionButton>
      {state.message ? (
        <p role="status" className={state.ok ? "text-sm text-accent" : "text-sm text-danger"}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

export function ArchiveClientForm({ id, archived }: { id: string; archived: boolean }) {
  const [state, action, pending] = useActionState(setClientArchived, empty);
  return (
    <form action={action} className="grid gap-2">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="archived" value={archived ? "0" : "1"} />
      <ActionButton
        pending={pending}
        pendingLabel="Updating…"
        className={`justify-self-start ${secondaryButtonClass}`}
      >
        {archived ? "Restore client" : "Archive client"}
      </ActionButton>
      {state.message ? (
        <p role="status" className={state.ok ? "text-sm text-accent" : "text-sm text-danger"}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

export function CreateContactForm({ clientId }: { clientId: string }) {
  const [state, action, pending] = useActionState(createContact, empty);
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="clientId" value={clientId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          <span>Name</span>
          <input name="name" required minLength={2} maxLength={80} className={inputClass} />
        </label>
        <label className="grid gap-1 text-sm">
          <span>Email</span>
          <input name="email" type="email" required autoComplete="email" className={inputClass} />
        </label>
      </div>
      <label className="grid gap-1 text-sm">
        <span>Title (optional)</span>
        <input name="title" maxLength={80} className={inputClass} />
      </label>
      <ActionButton
        pending={pending}
        pendingLabel="Adding…"
        className={`justify-self-start ${primaryButtonClass}`}
      >
        Add contact
      </ActionButton>
      {state.message ? (
        <p role="status" className={state.ok ? "text-sm text-accent" : "text-sm text-danger"}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

export function DeleteContactForm({ id, clientId }: { id: string; clientId: string }) {
  const [state, action, pending] = useActionState(deleteContact, empty);
  return (
    <form action={action} className="flex flex-col items-end gap-1">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="clientId" value={clientId} />
      <ActionButton
        pending={pending}
        pendingLabel="Removing…"
        className={`${textButtonClass} hover:text-danger`}
      >
        Remove
      </ActionButton>
      {state.message && !state.ok ? (
        <p role="status" className="text-sm text-danger">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

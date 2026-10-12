"use client";

import { useActionState } from "react";
import {
  commentOnDeliverable,
  createDeliverable,
  decideDeliverable,
  requestDeliverableApproval,
  updateDeliverable,
  type RecordState,
} from "@/features/deliverables/actions";
import { ActionButton } from "@/components/app/action-button";
import { inputClass, primaryButtonClass, secondaryButtonClass } from "@/components/app/styles";
import { fileAccept } from "@/lib/files/rules";
import type { DeliverableStatus } from "@/lib/deliverables/status";
import { canRequestApproval } from "@/lib/deliverables/status";

const empty: RecordState = { ok: false, message: "" };

function FormStatus({ state }: { state: RecordState }) {
  if (!state.message) return null;
  return (
    <p role="status" className={state.ok ? "text-sm text-accent" : "text-sm text-danger"}>
      {state.message}
    </p>
  );
}

export function DeliverableCreateForm({ projectId }: { projectId: string }) {
  const [state, action, pending] = useActionState(createDeliverable, empty);
  return (
    <form noValidate action={action} className="grid gap-4">
      <input type="hidden" name="projectId" value={projectId} />
      <label className="grid gap-1 text-sm">
        <span>Title</span>
        <input name="title" required minLength={2} maxLength={80} className={inputClass} />
      </label>
      <label className="grid gap-1 text-sm">
        <span>Note</span>
        <textarea name="note" rows={5} maxLength={2000} className={inputClass} />
      </label>
      <label className="grid gap-1 text-sm">
        <span>File (optional)</span>
        <input name="file" type="file" accept={fileAccept} className={inputClass} />
      </label>
      <div className="flex flex-wrap gap-3">
        <ActionButton name="intent" value="request" pending={pending} pendingLabel="Saving…">
          Request approval
        </ActionButton>
        <ActionButton
          name="intent"
          value="draft"
          pending={pending}
          className={secondaryButtonClass}
        >
          Save draft
        </ActionButton>
      </div>
      <FormStatus state={state} />
    </form>
  );
}

export function DeliverableEditForm({
  deliverable,
}: {
  deliverable: { id: string; projectId: string; title: string; note: string | null };
}) {
  const [state, action, pending] = useActionState(updateDeliverable, empty);
  return (
    <form noValidate action={action} className="grid gap-4">
      <input type="hidden" name="id" value={deliverable.id} />
      <input type="hidden" name="projectId" value={deliverable.projectId} />
      <label className="grid gap-1 text-sm">
        <span>Title</span>
        <input
          name="title"
          required
          minLength={2}
          maxLength={80}
          defaultValue={deliverable.title}
          className={inputClass}
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span>Note</span>
        <textarea
          name="note"
          rows={5}
          maxLength={2000}
          defaultValue={deliverable.note ?? ""}
          className={inputClass}
        />
      </label>
      <ActionButton
        pending={pending}
        pendingLabel="Saving…"
        className={`justify-self-start ${primaryButtonClass}`}
      >
        Save deliverable
      </ActionButton>
      <FormStatus state={state} />
    </form>
  );
}

export function RequestApprovalForm({ id, status }: { id: string; status: DeliverableStatus }) {
  const [state, action, pending] = useActionState(requestDeliverableApproval, empty);
  if (!canRequestApproval(status)) return null;
  return (
    <form action={action} className="grid gap-2">
      <input type="hidden" name="id" value={id} />
      <ActionButton
        pending={pending}
        pendingLabel="Sending…"
        className={`justify-self-start ${primaryButtonClass}`}
      >
        Request approval
      </ActionButton>
      <FormStatus state={state} />
    </form>
  );
}

export function DeliverableCommentForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(commentOnDeliverable, empty);
  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="id" value={id} />
      <label className="grid gap-1 text-sm">
        <span>Comment</span>
        <textarea
          name="body"
          required
          minLength={2}
          maxLength={2000}
          rows={4}
          className={inputClass}
        />
      </label>
      <ActionButton
        pending={pending}
        pendingLabel="Posting…"
        className={`justify-self-start ${primaryButtonClass}`}
      >
        Add comment
      </ActionButton>
      <FormStatus state={state} />
    </form>
  );
}

export function DeliverableDecisionForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(decideDeliverable, empty);
  return (
    <form noValidate action={action} className="grid gap-4">
      <input type="hidden" name="id" value={id} />
      <label className="grid gap-1 text-sm">
        <span>Note (required for changes)</span>
        <textarea name="note" rows={4} maxLength={2000} className={inputClass} />
      </label>
      <div className="flex flex-wrap gap-3">
        <ActionButton name="decision" value="approved" pending={pending} pendingLabel="Saving…">
          Approve
        </ActionButton>
        <ActionButton
          name="decision"
          value="changes_requested"
          pending={pending}
          className={secondaryButtonClass}
        >
          Request changes
        </ActionButton>
      </div>
      <FormStatus state={state} />
    </form>
  );
}

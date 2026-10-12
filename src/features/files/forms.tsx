"use client";

import { useActionState } from "react";
import { deleteProjectFile, uploadProjectFile, type RecordState } from "@/features/files/actions";
import { ActionButton } from "@/components/app/action-button";
import { inputClass, primaryButtonClass, textButtonClass } from "@/components/app/styles";
import { fileAccept } from "@/lib/files/rules";

const empty: RecordState = { ok: false, message: "" };

export function FileUploadForm({ projectId }: { projectId: string }) {
  const [state, action, pending] = useActionState(uploadProjectFile, empty);
  return (
    <form action={action} className="grid gap-3 bg-surface p-4">
      <input type="hidden" name="projectId" value={projectId} />
      <label className="grid gap-1 text-sm">
        <span>File</span>
        <input name="file" type="file" required accept={fileAccept} className={inputClass} />
      </label>
      <fieldset className="grid gap-2">
        <legend className="text-sm">Visibility</legend>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="visibility" value="internal" defaultChecked />
          Team only
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="visibility" value="client" />
          Shared with client
        </label>
      </fieldset>
      <ActionButton
        pending={pending}
        pendingLabel="Uploading…"
        className={`justify-self-start ${primaryButtonClass}`}
      >
        Upload file
      </ActionButton>
      {state.message ? (
        <p role="status" className={state.ok ? "text-sm text-accent" : "text-sm text-danger"}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

export function FileDeleteForm({ id, projectId }: { id: string; projectId: string }) {
  const [state, action, pending] = useActionState(deleteProjectFile, empty);
  return (
    <form action={action} className="grid gap-2">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="projectId" value={projectId} />
      <ActionButton
        pending={pending}
        pendingLabel="Deleting…"
        className={`${textButtonClass} hover:text-danger`}
      >
        Delete
      </ActionButton>
      {state.message ? (
        <p role="status" className={state.ok ? "text-sm text-accent" : "text-sm text-danger"}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

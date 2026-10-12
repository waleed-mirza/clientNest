"use client";

import { useActionState } from "react";
import { ActionButton } from "@/components/app/action-button";
import { inputClass } from "@/components/app/styles";
import { createWorkspace, type WorkspaceState } from "@/features/workspace/actions";

const empty: WorkspaceState = { ok: false, message: "" };

export function OnboardingForm() {
  const [state, action, pending] = useActionState(createWorkspace, empty);
  return (
    <form noValidate action={action} className="grid gap-4">
      <label className="grid gap-1 text-sm">
        <span>Workspace name</span>
        <input
          name="name"
          required
          minLength={2}
          maxLength={80}
          placeholder="Harbor Studio"
          className={inputClass}
        />
      </label>
      <ActionButton pending={pending} pendingLabel="Creating…">
        Create workspace
      </ActionButton>
      {state.message ? (
        <p role="status" className="text-sm text-danger">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

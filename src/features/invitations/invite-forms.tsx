"use client";

import { useActionState } from "react";
import { ActionButton } from "@/components/app/action-button";
import { inputClass, primaryButtonClass, textButtonClass } from "@/components/app/styles";
import {
  acceptInvite,
  createInvite,
  revokeInvite,
  type InviteState,
} from "@/features/invitations/actions";
import { inviteRoles } from "@/lib/security/roles";

const empty: InviteState = { ok: false, message: "" };

export function CreateInviteForm() {
  const [state, action, pending] = useActionState(createInvite, empty);
  return (
    <form noValidate action={action} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" required className={inputClass} />
        </label>
        <label className="grid gap-1 text-sm">
          <span>Role</span>
          <select name="role" defaultValue="member" className={inputClass}>
            {inviteRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </label>
      </div>
      <ActionButton
        pending={pending}
        pendingLabel="Sending…"
        className={`justify-self-start ${primaryButtonClass}`}
      >
        Create invite
      </ActionButton>
      {state.message ? (
        <p role="status" className={state.ok ? "text-sm text-accent" : "text-sm text-danger"}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

export function RevokeInviteForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(revokeInvite, empty);
  return (
    <form action={action} className="flex flex-col items-end gap-1">
      <input type="hidden" name="id" value={id} />
      <ActionButton
        pending={pending}
        pendingLabel="Revoking…"
        className={`${textButtonClass} hover:text-danger`}
      >
        Revoke
      </ActionButton>
      {state.message && !state.ok ? (
        <p role="status" className="text-sm text-danger">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

export function AcceptInviteForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(acceptInvite, empty);
  return (
    <form noValidate action={action} className="grid gap-4">
      <input type="hidden" name="token" value={token} />
      <ActionButton pending={pending} pendingLabel="Joining…">
        Accept invite
      </ActionButton>
      {state.message ? (
        <p role="status" className="text-sm text-danger">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

export function CopyInviteLink({ path }: { path: string }) {
  return (
    <label className="grid gap-1 text-sm">
      <span>Invite link</span>
      <input
        readOnly
        value={path}
        aria-label="Invite link"
        onFocus={(event) => event.currentTarget.select()}
        className={`${inputClass} font-mono text-xs`}
      />
    </label>
  );
}

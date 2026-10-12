"use client";

import { useActionState } from "react";
import { ActionButton } from "@/components/app/action-button";
import { inputClass, primaryButtonClass, secondaryButtonClass } from "@/components/app/styles";
import {
  removeWorkspaceLogo,
  updateWorkspace,
  uploadWorkspaceLogo,
  type WorkspaceState,
} from "@/features/workspace/actions";
import { logoAccept } from "@/lib/workspace/logo";
import { themePresetMeta, themePresets, type ThemePreset } from "@/lib/theme/presets";

const empty: WorkspaceState = { ok: false, message: "" };

export function WorkspaceBrandForm({ name, preset }: { name: string; preset: ThemePreset }) {
  const [state, action, pending] = useActionState(updateWorkspace, empty);
  return (
    <form noValidate action={action} className="grid gap-6">
      <label className="grid gap-1 text-sm">
        <span>Workspace name</span>
        <input
          name="name"
          required
          minLength={2}
          maxLength={80}
          defaultValue={name}
          className={inputClass}
        />
      </label>
      <fieldset className="grid gap-3">
        <legend className="text-sm">Theme</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {themePresets.map((id) => {
            const meta = themePresetMeta[id];
            return (
              <label
                key={id}
                className="flex cursor-pointer items-start gap-3 bg-surface px-3 py-3 text-sm transition-colors duration-150 hover:bg-surface-2 has-[:checked]:outline has-[:checked]:outline-2 has-[:checked]:outline-accent"
              >
                <input
                  type="radio"
                  name="preset"
                  value={id}
                  defaultChecked={preset === id}
                  className="mt-1"
                />
                <span className="grid gap-1">
                  <span className="flex items-center gap-2 font-medium">
                    <span
                      aria-hidden
                      className="size-4 rounded-sm"
                      style={{
                        background: meta.paper,
                        boxShadow: `inset 0 0 0 8px ${meta.accent}`,
                      }}
                    />
                    {meta.label}
                  </span>
                  <span className="text-muted">{meta.note}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <ActionButton
        pending={pending}
        pendingLabel="Saving…"
        className={`justify-self-start ${primaryButtonClass}`}
      >
        Save workspace
      </ActionButton>
      {state.message ? (
        <p role="status" className={state.ok ? "text-sm text-accent" : "text-sm text-danger"}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

export function WorkspaceLogoForm({ hasLogo }: { hasLogo: boolean }) {
  const [uploadState, uploadAction, uploading] = useActionState(uploadWorkspaceLogo, empty);
  const [removeState, removeAction, removing] = useActionState(removeWorkspaceLogo, empty);
  const message = uploadState.message || removeState.message;
  const ok = uploadState.message ? uploadState.ok : removeState.ok;

  return (
    <div className="grid gap-4">
      <form action={uploadAction} className="grid gap-3">
        <label className="grid gap-1 text-sm">
          <span>Logo</span>
          <input name="logo" type="file" required accept={logoAccept} className={inputClass} />
        </label>
        <p className="text-sm text-muted">
          PNG, JPEG, or WebP. 512 KB or smaller. SVG is not allowed.
        </p>
        <ActionButton
          pending={uploading}
          pendingLabel="Uploading…"
          className={`justify-self-start ${primaryButtonClass}`}
        >
          {hasLogo ? "Replace logo" : "Upload logo"}
        </ActionButton>
      </form>
      {hasLogo ? (
        <form action={removeAction}>
          <ActionButton
            pending={removing}
            pendingLabel="Removing…"
            className={secondaryButtonClass}
          >
            Remove logo
          </ActionButton>
        </form>
      ) : null}
      {message ? (
        <p role="status" className={ok ? "text-sm text-accent" : "text-sm text-danger"}>
          {message}
        </p>
      ) : null}
    </div>
  );
}

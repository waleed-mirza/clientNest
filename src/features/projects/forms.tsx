"use client";

import { useActionState } from "react";
import {
  createProjectRecord,
  setProjectArchived,
  updateProjectRecord,
  type RecordState,
} from "@/features/projects/actions";
import { ActionButton } from "@/components/app/action-button";
import { inputClass, primaryButtonClass, secondaryButtonClass } from "@/components/app/styles";
import { projectStatuses, projectStatusLabel, type ProjectStatus } from "@/lib/projects/status";
import { isInternalRole, type MembershipRole } from "@/lib/security/roles";

const empty: RecordState = { ok: false, message: "" };

export function ProjectForm({
  project,
  defaultClientId,
  clients,
  people,
  selectedMemberIds,
}: {
  project?: {
    id: string;
    name: string;
    description: string | null;
    status: ProjectStatus;
    startDate: string | null;
    dueDate: string | null;
    clientId: string;
  };
  defaultClientId?: string;
  clients: { id: string; name: string }[];
  people: { id: string; fullName: string | null; role: MembershipRole | string }[];
  selectedMemberIds: string[];
}) {
  const action = project ? updateProjectRecord : createProjectRecord;
  const [state, formAction, pending] = useActionState(action, empty);
  const selected = new Set(selectedMemberIds);
  const team = people.filter((person) => isInternalRole(person.role as MembershipRole));
  const clientId = project?.clientId ?? defaultClientId ?? "";

  return (
    <form noValidate action={formAction} className="grid gap-4">
      {project ? <input type="hidden" name="id" value={project.id} /> : null}
      <label className="grid gap-1 text-sm">
        <span>Project name</span>
        <input
          name="name"
          required
          minLength={2}
          maxLength={80}
          defaultValue={project?.name ?? ""}
          className={inputClass}
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span>Client</span>
        <select name="clientId" required defaultValue={clientId} className={inputClass}>
          <option value="" disabled>
            Choose a client
          </option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        <span>Status</span>
        <select name="status" defaultValue={project?.status ?? "planned"} className={inputClass}>
          {projectStatuses.map((status) => (
            <option key={status} value={status}>
              {projectStatusLabel(status)}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          <span>Start date (optional)</span>
          <input
            name="startDate"
            type="date"
            defaultValue={project?.startDate ?? ""}
            className={inputClass}
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span>Due date (optional)</span>
          <input
            name="dueDate"
            type="date"
            defaultValue={project?.dueDate ?? ""}
            className={inputClass}
          />
        </label>
      </div>
      <label className="grid gap-1 text-sm">
        <span>Description (optional)</span>
        <textarea
          name="description"
          rows={4}
          maxLength={2000}
          defaultValue={project?.description ?? ""}
          className={inputClass}
        />
      </label>
      <fieldset className="grid gap-2">
        <legend className="text-sm">Team</legend>
        {team.length === 0 ? (
          <p className="text-sm text-muted">No internal members to assign yet.</p>
        ) : (
          <ul className="grid gap-2">
            {team.map((person) => (
              <li key={person.id}>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="memberIds"
                    value={person.id}
                    defaultChecked={selected.has(person.id)}
                  />
                  <span>{person.fullName || "Unnamed member"}</span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </fieldset>
      <ActionButton
        pending={pending}
        pendingLabel="Saving…"
        className={`justify-self-start ${primaryButtonClass}`}
      >
        {project ? "Save project" : "Create project"}
      </ActionButton>
      {state.message ? (
        <p role="status" className={state.ok ? "text-sm text-accent" : "text-sm text-danger"}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

export function ArchiveProjectForm({ id, archived }: { id: string; archived: boolean }) {
  const [state, action, pending] = useActionState(setProjectArchived, empty);
  return (
    <form action={action} className="grid gap-2">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="archived" value={archived ? "0" : "1"} />
      <ActionButton
        pending={pending}
        pendingLabel="Updating…"
        className={`justify-self-start ${secondaryButtonClass}`}
      >
        {archived ? "Restore project" : "Archive project"}
      </ActionButton>
      {state.message ? (
        <p role="status" className={state.ok ? "text-sm text-accent" : "text-sm text-danger"}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

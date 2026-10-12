"use client";

import { useActionState } from "react";
import {
  createMilestone,
  deleteMilestone,
  moveMilestone,
  updateMilestone,
  type RecordState as MilestoneState,
} from "@/features/projects/milestone-actions";
import {
  createTask,
  deleteTask,
  moveTask,
  updateTask,
  type RecordState as TaskState,
} from "@/features/projects/task-actions";
import { ActionButton } from "@/components/app/action-button";
import {
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
  textButtonClass,
} from "@/components/app/styles";
import { StatusPill } from "@/components/app/status-pill";
import { formatDay } from "@/lib/projects/status";
import {
  milestoneStatuses,
  milestoneStatusLabel,
  taskStatuses,
  taskStatusLabel,
  type MilestoneStatus,
  type TaskStatus,
} from "@/lib/projects/workflow";

const empty: MilestoneState = { ok: false, message: "" };

function FormStatus({ state }: { state: MilestoneState | TaskState }) {
  if (!state.message) return null;
  return (
    <p role="status" className={state.ok ? "text-sm text-accent" : "text-sm text-danger"}>
      {state.message}
    </p>
  );
}

function Due({ value }: { value: string | null }) {
  if (!value) return null;
  return <span>{formatDay(value)}</span>;
}

export function MilestoneCreateForm({ projectId }: { projectId: string }) {
  const [state, action, pending] = useActionState(createMilestone, empty);
  return (
    <form noValidate action={action} className="grid gap-3 bg-surface p-4">
      <input type="hidden" name="projectId" value={projectId} />
      <label className="grid gap-1 text-sm">
        <span>Milestone name</span>
        <input name="name" required minLength={2} maxLength={80} className={inputClass} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid min-w-0 gap-1 text-sm">
          <span>Status</span>
          <select name="status" defaultValue="planned" className={inputClass}>
            {milestoneStatuses.map((status) => (
              <option key={status} value={status}>
                {milestoneStatusLabel(status)}
              </option>
            ))}
          </select>
        </label>
        <label className="grid min-w-0 gap-1 text-sm">
          <span>Due date (optional)</span>
          <input name="dueDate" type="date" className={inputClass} />
        </label>
      </div>
      <ActionButton
        pending={pending}
        pendingLabel="Adding…"
        className={`justify-self-start ${primaryButtonClass}`}
      >
        Add milestone
      </ActionButton>
      <FormStatus state={state} />
    </form>
  );
}

export function MilestoneRow({
  milestone,
  canEdit,
}: {
  milestone: {
    id: string;
    projectId: string;
    name: string;
    status: MilestoneStatus;
    dueDate: string | null;
  };
  canEdit: boolean;
}) {
  const [saveState, saveAction, saving] = useActionState(updateMilestone, empty);
  const [deleteState, deleteAction, deleting] = useActionState(deleteMilestone, empty);
  const [moveState, moveAction, moving] = useActionState(moveMilestone, empty);

  const summary = (
    <div className="flex items-center justify-between gap-3">
      <span className="min-w-0">{milestone.name}</span>
      <span className="flex shrink-0 items-center gap-2 text-sm text-muted">
        <StatusPill>{milestoneStatusLabel(milestone.status)}</StatusPill>
        <Due value={milestone.dueDate} />
        {canEdit ? <span className="text-xs text-accent group-open:hidden">Edit</span> : null}
      </span>
    </div>
  );

  if (!canEdit) {
    return <div className="px-4 py-3">{summary}</div>;
  }

  return (
    <details className="group">
      <summary className="cursor-pointer list-none px-4 py-3 marker:content-none [&::-webkit-details-marker]:hidden">
        {summary}
      </summary>
      <div className="grid gap-3 border-t border-border px-4 py-3">
        <form noValidate action={saveAction} className="grid gap-3">
          <input type="hidden" name="id" value={milestone.id} />
          <input type="hidden" name="projectId" value={milestone.projectId} />
          <label className="grid gap-1 text-sm">
            <span>Name</span>
            <input
              name="name"
              required
              minLength={2}
              maxLength={80}
              defaultValue={milestone.name}
              className={inputClass}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid min-w-0 gap-1 text-sm">
              <span>Status</span>
              <select name="status" defaultValue={milestone.status} className={inputClass}>
                {milestoneStatuses.map((status) => (
                  <option key={status} value={status}>
                    {milestoneStatusLabel(status)}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid min-w-0 gap-1 text-sm">
              <span>Due</span>
              <input
                name="dueDate"
                type="date"
                defaultValue={milestone.dueDate ?? ""}
                className={inputClass}
              />
            </label>
          </div>
          <ActionButton
            pending={saving}
            pendingLabel="Saving…"
            className={`justify-self-start ${secondaryButtonClass}`}
          >
            Save
          </ActionButton>
        </form>
        <div className="flex flex-wrap gap-4">
          <form action={moveAction}>
            <input type="hidden" name="id" value={milestone.id} />
            <input type="hidden" name="projectId" value={milestone.projectId} />
            <input type="hidden" name="direction" value="up" />
            <ActionButton pending={moving} className={textButtonClass}>
              Move up
            </ActionButton>
          </form>
          <form action={moveAction}>
            <input type="hidden" name="id" value={milestone.id} />
            <input type="hidden" name="projectId" value={milestone.projectId} />
            <input type="hidden" name="direction" value="down" />
            <ActionButton pending={moving} className={textButtonClass}>
              Move down
            </ActionButton>
          </form>
          <form action={deleteAction}>
            <input type="hidden" name="id" value={milestone.id} />
            <input type="hidden" name="projectId" value={milestone.projectId} />
            <ActionButton
              pending={deleting}
              pendingLabel="Removing…"
              className={`${textButtonClass} hover:text-danger`}
            >
              Delete
            </ActionButton>
          </form>
        </div>
        <FormStatus
          state={saveState.message ? saveState : deleteState.message ? deleteState : moveState}
        />
      </div>
    </details>
  );
}

export function TaskCreateForm({
  projectId,
  milestones,
  people,
}: {
  projectId: string;
  milestones: { id: string; name: string }[];
  people: { id: string; fullName: string | null }[];
}) {
  const [state, action, pending] = useActionState(createTask, empty);
  return (
    <form noValidate action={action} className="grid gap-3 bg-surface p-4">
      <input type="hidden" name="projectId" value={projectId} />
      <label className="grid gap-1 text-sm">
        <span>Task name</span>
        <input name="name" required minLength={2} maxLength={80} className={inputClass} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid min-w-0 gap-1 text-sm">
          <span>Status</span>
          <select name="status" defaultValue="todo" className={inputClass}>
            {taskStatuses.map((status) => (
              <option key={status} value={status}>
                {taskStatusLabel(status)}
              </option>
            ))}
          </select>
        </label>
        <label className="grid min-w-0 gap-1 text-sm">
          <span>Due date (optional)</span>
          <input name="dueDate" type="date" className={inputClass} />
        </label>
        <label className="grid min-w-0 gap-1 text-sm">
          <span>Milestone (optional)</span>
          <select name="milestoneId" defaultValue="" className={inputClass}>
            <option value="">No milestone</option>
            {milestones.map((milestone) => (
              <option key={milestone.id} value={milestone.id}>
                {milestone.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid min-w-0 gap-1 text-sm">
          <span>Assignee (optional)</span>
          <select name="assigneeId" defaultValue="" className={inputClass}>
            <option value="">Unassigned</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.fullName || "Unnamed member"}
              </option>
            ))}
          </select>
        </label>
      </div>
      <ActionButton
        pending={pending}
        pendingLabel="Adding…"
        className={`justify-self-start ${primaryButtonClass}`}
      >
        Add task
      </ActionButton>
      <FormStatus state={state} />
    </form>
  );
}

export function TaskRow({
  task,
  milestones,
  people,
  canEdit,
}: {
  task: {
    id: string;
    projectId: string;
    name: string;
    status: TaskStatus;
    dueDate: string | null;
    milestoneId: string | null;
    milestoneName: string | null;
    assigneeId: string | null;
    assigneeName: string | null;
  };
  milestones: { id: string; name: string }[];
  people: { id: string; fullName: string | null }[];
  canEdit: boolean;
}) {
  const [saveState, saveAction, saving] = useActionState(updateTask, empty);
  const [deleteState, deleteAction, deleting] = useActionState(deleteTask, empty);
  const [moveState, moveAction, moving] = useActionState(moveTask, empty);

  const meta = [
    task.assigneeName || "Unassigned",
    task.milestoneName,
    task.dueDate ? formatDay(task.dueDate) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const summary = (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-1">
      <p>{task.name}</p>
      <span className="flex items-center gap-2">
        <StatusPill>{taskStatusLabel(task.status)}</StatusPill>
        {canEdit ? <span className="text-xs text-accent group-open:hidden">Edit</span> : null}
      </span>
      <p className="col-span-2 text-sm text-muted">{meta}</p>
    </div>
  );

  if (!canEdit) {
    return <div className="px-4 py-3">{summary}</div>;
  }

  return (
    <details className="group">
      <summary className="cursor-pointer list-none px-4 py-3 marker:content-none [&::-webkit-details-marker]:hidden">
        {summary}
      </summary>
      <div className="grid gap-3 border-t border-border px-4 py-3">
        <form noValidate action={saveAction} className="grid gap-3">
          <input type="hidden" name="id" value={task.id} />
          <input type="hidden" name="projectId" value={task.projectId} />
          <label className="grid gap-1 text-sm">
            <span>Name</span>
            <input
              name="name"
              required
              minLength={2}
              maxLength={80}
              defaultValue={task.name}
              className={inputClass}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid min-w-0 gap-1 text-sm">
              <span>Status</span>
              <select name="status" defaultValue={task.status} className={inputClass}>
                {taskStatuses.map((status) => (
                  <option key={status} value={status}>
                    {taskStatusLabel(status)}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid min-w-0 gap-1 text-sm">
              <span>Due</span>
              <input
                name="dueDate"
                type="date"
                defaultValue={task.dueDate ?? ""}
                className={inputClass}
              />
            </label>
            <label className="grid min-w-0 gap-1 text-sm">
              <span>Milestone</span>
              <select
                name="milestoneId"
                defaultValue={task.milestoneId ?? ""}
                className={inputClass}
              >
                <option value="">No milestone</option>
                {milestones.map((milestone) => (
                  <option key={milestone.id} value={milestone.id}>
                    {milestone.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid min-w-0 gap-1 text-sm">
              <span>Assignee</span>
              <select name="assigneeId" defaultValue={task.assigneeId ?? ""} className={inputClass}>
                <option value="">Unassigned</option>
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.fullName || "Unnamed member"}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <ActionButton
            pending={saving}
            pendingLabel="Saving…"
            className={`justify-self-start ${secondaryButtonClass}`}
          >
            Save task
          </ActionButton>
        </form>
        <div className="flex flex-wrap gap-4">
          <form action={moveAction}>
            <input type="hidden" name="id" value={task.id} />
            <input type="hidden" name="projectId" value={task.projectId} />
            <input type="hidden" name="direction" value="up" />
            <ActionButton pending={moving} className={textButtonClass}>
              Move up
            </ActionButton>
          </form>
          <form action={moveAction}>
            <input type="hidden" name="id" value={task.id} />
            <input type="hidden" name="projectId" value={task.projectId} />
            <input type="hidden" name="direction" value="down" />
            <ActionButton pending={moving} className={textButtonClass}>
              Move down
            </ActionButton>
          </form>
          <form action={deleteAction}>
            <input type="hidden" name="id" value={task.id} />
            <input type="hidden" name="projectId" value={task.projectId} />
            <ActionButton
              pending={deleting}
              pendingLabel="Removing…"
              className={`${textButtonClass} hover:text-danger`}
            >
              Delete
            </ActionButton>
          </form>
        </div>
        <FormStatus
          state={saveState.message ? saveState : deleteState.message ? deleteState : moveState}
        />
      </div>
    </details>
  );
}

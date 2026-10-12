export const milestoneStatuses = ["planned", "in_progress", "in_review", "done"] as const;
export type MilestoneStatus = (typeof milestoneStatuses)[number];

const milestoneLabels: Record<MilestoneStatus, string> = {
  planned: "Up next",
  in_progress: "In progress",
  in_review: "In review",
  done: "Done",
};

export function isMilestoneStatus(value: string): value is MilestoneStatus {
  return (milestoneStatuses as readonly string[]).includes(value);
}

export function milestoneStatusLabel(status: MilestoneStatus): string {
  return milestoneLabels[status];
}

export const taskStatuses = ["todo", "in_progress", "waiting_on_client", "done"] as const;
export type TaskStatus = (typeof taskStatuses)[number];

const taskLabels: Record<TaskStatus, string> = {
  todo: "Todo",
  in_progress: "In progress",
  waiting_on_client: "Waiting on client",
  done: "Done",
};

export function isTaskStatus(value: string): value is TaskStatus {
  return (taskStatuses as readonly string[]).includes(value);
}

export function taskStatusLabel(status: TaskStatus): string {
  return taskLabels[status];
}

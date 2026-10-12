export const projectStatuses = ["planned", "in_progress", "awaiting_approval", "approved"] as const;

export type ProjectStatus = (typeof projectStatuses)[number];

const labels: Record<ProjectStatus, string> = {
  planned: "Planned",
  in_progress: "In progress",
  awaiting_approval: "Awaiting approval",
  approved: "Approved",
};

export function isProjectStatus(value: string): value is ProjectStatus {
  return (projectStatuses as readonly string[]).includes(value);
}

export function projectStatusLabel(status: ProjectStatus, archivedAt?: string | null): string {
  if (archivedAt) return "Archived";
  return labels[status];
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDay(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return "—";
  return `${date.getUTCDate()} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

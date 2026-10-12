export const deliverableStatuses = [
  "draft",
  "awaiting_approval",
  "changes_requested",
  "approved",
] as const;

export type DeliverableStatus = (typeof deliverableStatuses)[number];

const labels: Record<DeliverableStatus, string> = {
  draft: "Draft",
  awaiting_approval: "Awaiting approval",
  changes_requested: "Changes requested",
  approved: "Approved",
};

export function isDeliverableStatus(value: string): value is DeliverableStatus {
  return (deliverableStatuses as readonly string[]).includes(value);
}

export function deliverableStatusLabel(status: DeliverableStatus): string {
  return labels[status];
}

export const approvalDecisions = ["approved", "changes_requested"] as const;
export type ApprovalDecision = (typeof approvalDecisions)[number];

export function isApprovalDecision(value: string): value is ApprovalDecision {
  return (approvalDecisions as readonly string[]).includes(value);
}

export function approvalDecisionLabel(decision: ApprovalDecision): string {
  return decision === "approved" ? "Approved" : "Changes requested";
}

export function canRequestApproval(status: DeliverableStatus): boolean {
  return status === "draft" || status === "changes_requested";
}

export function canDecideDeliverable(status: DeliverableStatus): boolean {
  return status === "awaiting_approval";
}

export function canCommentOnDeliverable(status: DeliverableStatus, internal: boolean): boolean {
  return internal || status !== "draft";
}

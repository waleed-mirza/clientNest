export const membershipRoles = ["owner", "manager", "member", "client"] as const;

export type MembershipRole = (typeof membershipRoles)[number];

export const inviteRoles = ["manager", "member", "client"] as const;

export type InviteRole = (typeof inviteRoles)[number];

export function canManageMembers(role: MembershipRole): boolean {
  return role === "owner" || role === "manager";
}

export function canEditWorkspace(role: MembershipRole): boolean {
  return role === "owner";
}

export function isInternalRole(role: MembershipRole): boolean {
  return role !== "client";
}

export function canManageRecords(role: MembershipRole): boolean {
  return isInternalRole(role);
}

export function roleLabel(role: MembershipRole): string {
  if (role === "owner") return "Owner";
  if (role === "manager") return "Manager";
  if (role === "member") return "Member";
  return "Client";
}

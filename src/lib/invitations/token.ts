import { randomBytes } from "node:crypto";

export function createInviteToken(): string {
  return randomBytes(32).toString("hex");
}

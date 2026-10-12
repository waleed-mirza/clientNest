import { describe, expect, it } from "vitest";
import {
  canEditWorkspace,
  canManageMembers,
  canManageRecords,
  isInternalRole,
  roleLabel,
} from "./roles";

describe("roles", () => {
  it("lets owners and managers invite", () => {
    expect(canManageMembers("owner")).toBe(true);
    expect(canManageMembers("manager")).toBe(true);
    expect(canManageMembers("member")).toBe(false);
    expect(canManageMembers("client")).toBe(false);
  });

  it("lets only owners edit the workspace", () => {
    expect(canEditWorkspace("owner")).toBe(true);
    expect(canEditWorkspace("manager")).toBe(false);
  });

  it("treats clients as external", () => {
    expect(isInternalRole("member")).toBe(true);
    expect(isInternalRole("client")).toBe(false);
  });

  it("lets internal roles manage clients and projects", () => {
    expect(canManageRecords("owner")).toBe(true);
    expect(canManageRecords("manager")).toBe(true);
    expect(canManageRecords("member")).toBe(true);
    expect(canManageRecords("client")).toBe(false);
  });

  it("labels roles in sentence case", () => {
    expect(roleLabel("owner")).toBe("Owner");
    expect(roleLabel("client")).toBe("Client");
  });
});

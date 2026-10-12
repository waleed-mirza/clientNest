import { describe, expect, it } from "vitest";
import { createInviteSchema, inviteTokenSchema, signUpSchema, updateWorkspaceSchema } from "./auth";

describe("auth validation", () => {
  it("accepts a normal sign-up", () => {
    const parsed = signUpSchema.safeParse({
      fullName: "Sam Reed",
      email: "sam.reed@example.com",
      password: "Harbor-Demo-24",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects a short password", () => {
    const parsed = signUpSchema.safeParse({
      fullName: "Sam Reed",
      email: "sam.reed@example.com",
      password: "short",
    });
    expect(parsed.success).toBe(false);
  });

  it("does not allow inviting an owner", () => {
    const parsed = createInviteSchema.safeParse({
      email: "alex.marin@example.com",
      role: "owner",
    });
    expect(parsed.success).toBe(false);
  });

  it("accepts member invites", () => {
    const parsed = createInviteSchema.safeParse({
      email: "riley.chen@example.com",
      role: "member",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects a short invite token", () => {
    expect(inviteTokenSchema.safeParse("abc").success).toBe(false);
    expect(inviteTokenSchema.safeParse("a".repeat(64)).success).toBe(true);
  });

  it("accepts a workspace theme preset", () => {
    expect(updateWorkspaceSchema.safeParse({ name: "Harbor Studio", preset: "clay" }).success).toBe(
      true,
    );
    expect(
      updateWorkspaceSchema.safeParse({ name: "Harbor Studio", preset: "purple" }).success,
    ).toBe(false);
  });
});

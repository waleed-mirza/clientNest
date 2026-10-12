import { describe, expect, it } from "vitest";
import { createInviteToken } from "./token";

describe("createInviteToken", () => {
  it("returns 64 hex characters", () => {
    const token = createInviteToken();
    expect(token).toMatch(/^[a-f0-9]{64}$/);
  });

  it("is unique per call", () => {
    expect(createInviteToken()).not.toBe(createInviteToken());
  });
});

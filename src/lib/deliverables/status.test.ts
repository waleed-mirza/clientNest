import { describe, expect, it } from "vitest";
import {
  canCommentOnDeliverable,
  canDecideDeliverable,
  canRequestApproval,
  deliverableStatusLabel,
  isApprovalDecision,
} from "./status";

describe("deliverable status", () => {
  it("uses explicit labels", () => {
    expect(deliverableStatusLabel("awaiting_approval")).toBe("Awaiting approval");
    expect(deliverableStatusLabel("changes_requested")).toBe("Changes requested");
  });

  it("lets the team request approval from draft or changes", () => {
    expect(canRequestApproval("draft")).toBe(true);
    expect(canRequestApproval("changes_requested")).toBe(true);
    expect(canRequestApproval("awaiting_approval")).toBe(false);
    expect(canRequestApproval("approved")).toBe(false);
  });

  it("lets the client decide only while awaiting approval", () => {
    expect(canDecideDeliverable("awaiting_approval")).toBe(true);
    expect(canDecideDeliverable("draft")).toBe(false);
    expect(canDecideDeliverable("approved")).toBe(false);
  });

  it("hides draft comments from clients", () => {
    expect(canCommentOnDeliverable("draft", false)).toBe(false);
    expect(canCommentOnDeliverable("draft", true)).toBe(true);
    expect(canCommentOnDeliverable("awaiting_approval", false)).toBe(true);
  });

  it("rejects unknown decisions", () => {
    expect(isApprovalDecision("approved")).toBe(true);
    expect(isApprovalDecision("rejected")).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { milestoneStatusLabel, taskStatusLabel } from "./workflow";

describe("workflow labels", () => {
  it("uses explicit milestone words", () => {
    expect(milestoneStatusLabel("planned")).toBe("Up next");
    expect(milestoneStatusLabel("in_review")).toBe("In review");
    expect(milestoneStatusLabel("done")).toBe("Done");
  });

  it("uses explicit task words", () => {
    expect(taskStatusLabel("todo")).toBe("Todo");
    expect(taskStatusLabel("waiting_on_client")).toBe("Waiting on client");
  });
});

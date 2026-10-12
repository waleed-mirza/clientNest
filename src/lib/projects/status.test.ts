import { describe, expect, it } from "vitest";
import { formatDay, isProjectStatus, projectStatusLabel } from "./status";

describe("project status", () => {
  it("labels explicit statuses", () => {
    expect(projectStatusLabel("awaiting_approval")).toBe("Awaiting approval");
    expect(projectStatusLabel("in_progress", "2026-08-23T00:00:00Z")).toBe("Archived");
  });

  it("rejects unknown statuses", () => {
    expect(isProjectStatus("done")).toBe(false);
    expect(isProjectStatus("planned")).toBe(true);
  });

  it("formats ISO dates in UTC", () => {
    expect(formatDay("2026-09-18")).toBe("18 Sep 2026");
    expect(formatDay(null)).toBe("—");
  });
});

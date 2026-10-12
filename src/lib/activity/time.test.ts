import { describe, expect, it } from "vitest";
import { formatWhen } from "./time";

describe("formatWhen", () => {
  const now = Date.parse("2026-08-23T12:00:00.000Z");

  it("uses relative words for recent events", () => {
    expect(formatWhen("2026-08-23T11:59:00.000Z", now)).toBe("1 min ago");
    expect(formatWhen("2026-08-23T10:00:00.000Z", now)).toBe("2 hours ago");
    expect(formatWhen("2026-08-22T12:00:00.000Z", now)).toBe("Yesterday");
    expect(formatWhen("2026-08-20T12:00:00.000Z", now)).toBe("3 days ago");
  });

  it("falls back to a calendar day after a week", () => {
    expect(formatWhen("2026-08-04T12:00:00.000Z", now)).toBe("4 Aug 2026");
  });
});

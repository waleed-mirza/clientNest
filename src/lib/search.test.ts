import { describe, expect, it } from "vitest";
import { firstParam, searchPattern } from "./search";

describe("searchPattern", () => {
  it("wraps a query for ilike", () => {
    expect(searchPattern("Pine")).toBe("%Pine%");
  });

  it("strips wildcard characters", () => {
    expect(searchPattern("%oak_")).toBe("% oak %");
  });

  it("returns null for empty input", () => {
    expect(searchPattern("  ")).toBeNull();
    expect(searchPattern(undefined)).toBeNull();
  });
});

describe("firstParam", () => {
  it("reads the first search value", () => {
    expect(firstParam(["a", "b"])).toBe("a");
    expect(firstParam(undefined)).toBe("");
  });
});

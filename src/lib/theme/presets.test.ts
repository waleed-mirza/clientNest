import { describe, expect, it } from "vitest";
import { parseThemePreset, parseWorkspaceTheme } from "./presets";

describe("theme presets", () => {
  it("accepts a known preset", () => {
    expect(parseThemePreset("slate")).toBe("slate");
  });

  it("falls back to harbor for unknown values", () => {
    expect(parseThemePreset("neon")).toBe("harbor");
    expect(parseThemePreset("")).toBe("harbor");
  });

  it("reads preset from workspace theme json", () => {
    expect(parseWorkspaceTheme({ preset: "clay" })).toBe("clay");
    expect(parseWorkspaceTheme({})).toBe("harbor");
    expect(parseWorkspaceTheme({ preset: "purple", extra: "no" })).toBe("harbor");
    expect(parseWorkspaceTheme(null)).toBe("harbor");
  });
});

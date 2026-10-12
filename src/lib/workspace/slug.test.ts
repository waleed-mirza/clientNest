import { describe, expect, it } from "vitest";
import { slugifyWorkspaceName } from "./slug";

describe("slugifyWorkspaceName", () => {
  it("builds a lowercase hyphenated slug with suffix", () => {
    expect(slugifyWorkspaceName("Harbor Studio", "ab12cd34")).toBe("harbor-studio-ab12cd34");
  });

  it("falls back when the name has no ascii letters", () => {
    expect(slugifyWorkspaceName("!!!", "zz")).toBe("workspace-zz");
  });
});

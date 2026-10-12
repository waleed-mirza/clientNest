import { describe, expect, it } from "vitest";
import { logoStoragePath, resolveLogoUpload } from "./logo";

describe("workspace logo", () => {
  it("accepts a small png", () => {
    const result = resolveLogoUpload({
      name: "mark.png",
      type: "image/png",
      size: 12000,
    });
    expect(result.ok).toBe(true);
  });

  it("rejects svg", () => {
    const result = resolveLogoUpload({
      name: "mark.svg",
      type: "image/svg+xml",
      size: 100,
    });
    expect(result.ok).toBe(false);
  });

  it("rejects files over 512 KB", () => {
    const result = resolveLogoUpload({
      name: "mark.png",
      type: "image/png",
      size: 600_000,
    });
    expect(result.ok).toBe(false);
  });

  it("stores logos at workspace/logo", () => {
    expect(logoStoragePath("11111111-aaaa-4111-8111-aaaaaaaaaaaa")).toBe(
      "11111111-aaaa-4111-8111-aaaaaaaaaaaa/logo",
    );
  });
});

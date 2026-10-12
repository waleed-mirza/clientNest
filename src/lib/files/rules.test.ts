import { describe, expect, it } from "vitest";
import { fileVisibilityLabel, formatBytes, resolveUpload, sanitizeFileName } from "./rules";

describe("file names", () => {
  it("strips paths and unsafe characters", () => {
    expect(sanitizeFileName("C:\\\\uploads\\\\Menu board v3.pdf")).toBe("Menu board v3.pdf");
    expect(sanitizeFileName("../../secret.txt")).toBe("secret.txt");
    expect(sanitizeFileName("hero<script>.png")).toBe("hero-script-.png");
  });
});

describe("upload rules", () => {
  it("accepts a matching PDF", () => {
    const result = resolveUpload({
      name: "Menu-board.pdf",
      type: "application/pdf",
      size: 420_000,
    });
    expect(result).toEqual({ ok: true, name: "Menu-board.pdf", mime: "application/pdf" });
  });

  it("rejects a mismatched extension", () => {
    const result = resolveUpload({
      name: "notes.txt",
      type: "application/pdf",
      size: 12,
    });
    expect(result.ok).toBe(false);
  });

  it("rejects files over 10 MB", () => {
    const result = resolveUpload({
      name: "huge.png",
      type: "image/png",
      size: 10 * 1024 * 1024 + 1,
    });
    expect(result.ok).toBe(false);
  });

  it("infers a text type when the browser omits it", () => {
    const result = resolveUpload({ name: "brief.txt", type: "", size: 20 });
    expect(result).toEqual({ ok: true, name: "brief.txt", mime: "text/plain" });
  });
});

describe("file formatting", () => {
  it("labels visibility and sizes", () => {
    expect(fileVisibilityLabel("internal")).toBe("Team only");
    expect(fileVisibilityLabel("client")).toBe("Shared with client");
    expect(formatBytes(12)).toBe("12 B");
    expect(formatBytes(420_000)).toBe("410 KB");
    expect(formatBytes(1_800_000)).toBe("1.7 MB");
  });
});

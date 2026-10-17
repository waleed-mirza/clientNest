import { describe, expect, it } from "vitest";
import { resolveDocHref } from "./markdown";

describe("resolveDocHref", () => {
  it("rewrites relative markdown links to live docs routes", () => {
    expect(resolveDocHref("./supabase.md")).toBe("/docs/supabase");
    expect(resolveDocHref("./troubleshooting.md")).toBe("/docs/troubleshooting");
  });

  it("leaves absolute docs routes and external urls unchanged", () => {
    expect(resolveDocHref("/docs/supabase")).toBe("/docs/supabase");
    expect(resolveDocHref("https://example.com/docs")).toBe("https://example.com/docs");
    expect(resolveDocHref("http://localhost:3000")).toBe("http://localhost:3000");
  });
});

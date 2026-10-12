import { describe, expect, it } from "vitest";
import { isAuthForm, isPublicPath } from "./public-path";

describe("public paths", () => {
  it("lets buyers read docs and the license without a session", () => {
    expect(isPublicPath("/")).toBe(true);
    expect(isPublicPath("/docs")).toBe(true);
    expect(isPublicPath("/docs/quick-start")).toBe(true);
    expect(isPublicPath("/license")).toBe(true);
    expect(isPublicPath("/mockups/dashboard")).toBe(true);
    expect(isPublicPath("/login")).toBe(true);
  });

  it("protects the app", () => {
    expect(isPublicPath("/app")).toBe(false);
    expect(isPublicPath("/onboarding")).toBe(false);
    expect(isPublicPath("/app/projects")).toBe(false);
  });

  it("treats auth forms as signed-in bounce targets", () => {
    expect(isAuthForm("/login")).toBe(true);
    expect(isAuthForm("/docs")).toBe(false);
  });
});

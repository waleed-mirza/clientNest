import { afterEach, describe, expect, it } from "vitest";
import { publicDemoUrl } from "./storefront";

const demoKey = "NEXT_PUBLIC_DEMO_URL";
const original = process.env[demoKey];

afterEach(() => {
  if (original === undefined) delete process.env[demoKey];
  else process.env[demoKey] = original;
});

describe("public demo url", () => {
  it("accepts an http(s) demo link", () => {
    process.env.NEXT_PUBLIC_DEMO_URL = "https://demo.example.com/login";
    expect(publicDemoUrl()).toContain("demo.example.com");
  });

  it("rejects a missing or non-http value", () => {
    process.env.NEXT_PUBLIC_DEMO_URL = "javascript:alert(1)";
    expect(publicDemoUrl()).toBeNull();
    process.env.NEXT_PUBLIC_DEMO_URL = "";
    expect(publicDemoUrl()).toBeNull();
  });
});

import { afterEach, describe, expect, it } from "vitest";
import { demoWriteBlocked } from "./guard";
import { isDemoAccount, isDemoMode, publicDemoAccount } from "./mode";

const originalDemo = process.env.DEMO_MODE;
const originalPublic = process.env.NEXT_PUBLIC_DEMO_MODE;

afterEach(() => {
  if (originalDemo === undefined) delete process.env.DEMO_MODE;
  else process.env.DEMO_MODE = originalDemo;
  if (originalPublic === undefined) delete process.env.NEXT_PUBLIC_DEMO_MODE;
  else process.env.NEXT_PUBLIC_DEMO_MODE = originalPublic;
});

describe("demo mode", () => {
  it("treats Harbor emails as demo accounts", () => {
    expect(isDemoAccount("sam.reed@example.com")).toBe(true);
    expect(isDemoAccount("Sam.Reed@example.com")).toBe(true);
    expect(isDemoAccount("buyer@example.net")).toBe(false);
  });

  it("only exposes owner and client views for one-click access", () => {
    expect(publicDemoAccount("owner")?.email).toBe("sam.reed@example.com");
    expect(publicDemoAccount("client")?.email).toBe("alex.marin@example.com");
    expect(publicDemoAccount("member")).toBeNull();
  });

  it("is off unless DEMO_MODE is true", () => {
    delete process.env.DEMO_MODE;
    delete process.env.NEXT_PUBLIC_DEMO_MODE;
    expect(isDemoMode()).toBe(false);
    expect(demoWriteBlocked()).toBeNull();

    process.env.DEMO_MODE = "true";
    expect(isDemoMode()).toBe(true);
    expect(demoWriteBlocked()?.ok).toBe(false);
  });
});

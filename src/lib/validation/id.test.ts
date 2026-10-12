import { describe, expect, it } from "vitest";
import { parseUuid } from "./id";

describe("parseUuid", () => {
  it("accepts a v4 uuid", () => {
    expect(parseUuid("11111111-cccc-4111-8111-ccccccccccc1")).toBe(
      "11111111-cccc-4111-8111-ccccccccccc1",
    );
  });

  it("rejects junk", () => {
    expect(parseUuid("not-a-uuid")).toBeNull();
    expect(parseUuid(undefined)).toBeNull();
  });
});

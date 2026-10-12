import { afterEach, describe, expect, it } from "vitest";
import { isEmailConfigured, notificationFromAddress, sendNotificationEmail } from "./email";

const originalKey = process.env.RESEND_API_KEY;
const originalFrom = process.env.RESEND_FROM;

afterEach(() => {
  if (originalKey === undefined) delete process.env.RESEND_API_KEY;
  else process.env.RESEND_API_KEY = originalKey;
  if (originalFrom === undefined) delete process.env.RESEND_FROM;
  else process.env.RESEND_FROM = originalFrom;
});

describe("notification email adapter", () => {
  it("skips sending when no API key is configured", async () => {
    delete process.env.RESEND_API_KEY;
    expect(isEmailConfigured()).toBe(false);
    const result = await sendNotificationEmail({
      to: "alex.marin@example.com",
      subject: "Homepage hero v3 is waiting",
      text: "Review the deliverable in ClientNest.",
    });
    expect(result).toEqual({ ok: true, skipped: true, reason: "not_configured" });
  });

  it("uses the optional from address when set", () => {
    process.env.RESEND_FROM = "Harbor Studio <hello@harbor.example>";
    expect(notificationFromAddress()).toBe("Harbor Studio <hello@harbor.example>");
  });
});

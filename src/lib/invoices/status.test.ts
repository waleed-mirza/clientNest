import { describe, expect, it } from "vitest";
import {
  canEditInvoiceItems,
  canMarkInvoicePaid,
  canSendInvoice,
  canVoidInvoice,
  invoiceStatusLabel,
  isClientVisibleInvoice,
} from "./status";

describe("invoice status", () => {
  it("uses explicit labels", () => {
    expect(invoiceStatusLabel("sent")).toBe("Sent");
    expect(invoiceStatusLabel("void")).toBe("Void");
  });

  it("only lets the team edit drafts and send them", () => {
    expect(canEditInvoiceItems("draft")).toBe(true);
    expect(canSendInvoice("draft")).toBe(true);
    expect(canEditInvoiceItems("sent")).toBe(false);
    expect(canSendInvoice("sent")).toBe(false);
  });

  it("marks paid from sent, and voids draft or sent", () => {
    expect(canMarkInvoicePaid("sent")).toBe(true);
    expect(canMarkInvoicePaid("draft")).toBe(false);
    expect(canVoidInvoice("draft")).toBe(true);
    expect(canVoidInvoice("paid")).toBe(false);
  });

  it("hides drafts and voids from clients", () => {
    expect(isClientVisibleInvoice("sent")).toBe(true);
    expect(isClientVisibleInvoice("paid")).toBe(true);
    expect(isClientVisibleInvoice("draft")).toBe(false);
    expect(isClientVisibleInvoice("void")).toBe(false);
  });
});

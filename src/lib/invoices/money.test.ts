import { describe, expect, it } from "vitest";
import {
  formatCents,
  formatQuantity,
  invoiceTotalCents,
  lineTotalCents,
  nextInvoiceNumber,
  parseMoneyToCents,
  parseQuantity,
} from "./money";

describe("invoice money", () => {
  it("parses dollar amounts into cents", () => {
    expect(parseMoneyToCents("12")).toBe(1200);
    expect(parseMoneyToCents("12.5")).toBe(1250);
    expect(parseMoneyToCents("12.50")).toBe(1250);
    expect(parseMoneyToCents("0")).toBe(0);
  });

  it("rejects invalid amounts", () => {
    expect(parseMoneyToCents("")).toBeNull();
    expect(parseMoneyToCents("-1")).toBeNull();
    expect(parseMoneyToCents("12.999")).toBeNull();
    expect(parseMoneyToCents("12.5.0")).toBeNull();
    expect(parseMoneyToCents("abc")).toBeNull();
  });

  it("parses quantities above zero", () => {
    expect(parseQuantity("1")).toBe(1);
    expect(parseQuantity("1.50")).toBe(1.5);
    expect(parseQuantity("0")).toBeNull();
    expect(parseQuantity("0.00")).toBeNull();
  });

  it("totals line items in cents", () => {
    expect(lineTotalCents(2, 65000)).toBe(130000);
    expect(lineTotalCents(1.5, 1000)).toBe(1500);
    expect(
      invoiceTotalCents([
        { quantity: 1, unitAmountCents: 180000 },
        { quantity: 1, unitAmountCents: 65000 },
      ]),
    ).toBe(245000);
  });

  it("formats USD and quantities", () => {
    expect(formatCents(245000)).toBe("$2,450.00");
    expect(formatQuantity(1)).toBe("1");
    expect(formatQuantity(1.5)).toBe("1.5");
  });

  it("builds the next invoice number", () => {
    expect(nextInvoiceNumber(40, 2026)).toBe("INV-2026-0041");
    expect(nextInvoiceNumber(0, 2026)).toBe("INV-2026-0001");
  });
});

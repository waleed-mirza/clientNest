"use client";

import { secondaryButtonClass } from "@/components/app/styles";

export function PrintInvoiceButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={`${secondaryButtonClass} print:hidden`}
    >
      Print
    </button>
  );
}

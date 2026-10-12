"use client";

import type { ReactNode } from "react";
import { useLinkStatus } from "next/link";

export function NavItemState({ children }: { children: ReactNode }) {
  const { pending } = useLinkStatus();
  return (
    <span
      className={`flex w-full items-center gap-2 transition-opacity duration-150 ${
        pending ? "opacity-70" : ""
      }`}
    >
      {children}
      <span aria-hidden className={`cn-link-hint${pending ? " is-pending" : ""}`} />
    </span>
  );
}

"use client";

import { useFormStatus } from "react-dom";
import { LogOut } from "lucide-react";
import { ActionButton } from "@/components/app/action-button";
import { secondaryButtonClass } from "@/components/app/styles";

export function SignOutButton() {
  const { pending } = useFormStatus();
  return (
    <ActionButton
      pending={pending}
      pendingLabel="Signing out…"
      className={`${secondaryButtonClass} w-full`}
    >
      <LogOut aria-hidden className="size-4" strokeWidth={1.75} />
      Sign out
    </ActionButton>
  );
}

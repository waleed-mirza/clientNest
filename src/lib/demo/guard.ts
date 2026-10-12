import { demoWriteMessage, isDemoAccount, isDemoMode } from "@/lib/demo/mode";

export type DemoBlocked = { ok: false; message: string };

export function demoWriteBlocked(): DemoBlocked | null {
  if (!isDemoMode()) return null;
  return { ok: false, message: demoWriteMessage };
}

export function demoAccountPasswordBlocked(email: string | undefined | null): DemoBlocked | null {
  if (!isDemoAccount(email)) return null;
  return {
    ok: false,
    message: "Harbor demo accounts keep a fixed password so the seeded story stays usable.",
  };
}

"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ActionButton } from "@/components/app/action-button";
import { primaryButtonClass, secondaryButtonClass } from "@/components/app/styles";
import { signInToPublicDemo, type AuthState } from "@/features/auth/actions";

const initial: AuthState = { ok: false, message: "" };

const walkthrough = [
  { href: "/mockups/dashboard", label: "Dashboard mockup" },
  { href: "/mockups/project", label: "Project mockup" },
  { href: "/mockups/approval", label: "Approval mockup" },
];

export function PublicDemoAccess() {
  const [state, action, pending] = useActionState(signInToPublicDemo, initial);

  return (
    <section
      className="mb-6 border border-border bg-surface p-5 text-sm"
      aria-labelledby="demo-access"
    >
      <h2 id="demo-access" className="font-medium">
        Explore Harbor Studio in one click
      </h2>
      <p className="mt-1 text-muted">
        Walk the three screens first if you want the story, then open an owner or client view. This
        shared demo is read-only.
      </p>
      <ul className="mt-4 grid gap-1">
        {walkthrough.map((screen) => (
          <li key={screen.href}>
            <Link href={screen.href} className="text-accent underline-offset-2 hover:underline">
              {screen.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-3">
        <form action={action}>
          <input type="hidden" name="view" value="owner" />
          <ActionButton
            pending={pending}
            pendingLabel="Opening demo..."
            className={primaryButtonClass}
          >
            Open owner demo
          </ActionButton>
        </form>
        <form action={action}>
          <input type="hidden" name="view" value="client" />
          <ActionButton
            pending={pending}
            pendingLabel="Opening demo..."
            className={secondaryButtonClass}
          >
            Open client demo
          </ActionButton>
        </form>
      </div>
      {state.message ? (
        <p role="status" className={state.ok ? "mt-4 text-accent" : "mt-4 text-danger"}>
          {state.message}
        </p>
      ) : null}
    </section>
  );
}

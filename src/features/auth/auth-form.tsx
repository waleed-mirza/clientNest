"use client";

import { useActionState, type ReactNode } from "react";
import Link from "next/link";
import { ActionButton } from "@/components/app/action-button";
import { inputClass } from "@/components/app/styles";
import {
  signIn,
  signUp,
  requestPasswordReset,
  updatePassword,
  type AuthState,
} from "@/features/auth/actions";

const empty: AuthState = { ok: false, message: "" };

type Field = {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
};

function FormShell({
  action,
  fields,
  submit,
  extra,
  children,
}: {
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
  fields: Field[];
  submit: string;
  extra?: ReactNode;
  children?: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, empty);
  return (
    <form noValidate action={formAction} className="grid gap-4">
      {children}
      {fields.map((field) => (
        <label key={field.name} className="grid gap-1 text-sm">
          <span>{field.label}</span>
          <input
            name={field.name}
            type={field.type ?? "text"}
            autoComplete={field.autoComplete}
            required={field.required ?? true}
            className={inputClass}
          />
        </label>
      ))}
      {extra}
      <ActionButton pending={pending} pendingLabel="Please wait…">
        {submit}
      </ActionButton>
      {state.message ? (
        <p role="status" className={state.ok ? "text-sm text-accent" : "text-sm text-danger"}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

export function SignInForm({ nextPath }: { nextPath: string }) {
  return (
    <FormShell
      action={signIn}
      submit="Sign in"
      fields={[
        { name: "email", label: "Email", type: "email", autoComplete: "email" },
        { name: "password", label: "Password", type: "password", autoComplete: "current-password" },
      ]}
      extra={
        <p className="text-sm text-muted">
          <Link href="/forgot-password" className="text-accent underline-offset-2 hover:underline">
            Forgot password?
          </Link>
        </p>
      }
    >
      <input type="hidden" name="next" value={nextPath} />
    </FormShell>
  );
}

export function SignUpForm({ nextPath }: { nextPath?: string }) {
  return (
    <FormShell
      action={signUp}
      submit="Create account"
      fields={[
        { name: "fullName", label: "Your name", autoComplete: "name" },
        { name: "email", label: "Email", type: "email", autoComplete: "email" },
        { name: "password", label: "Password", type: "password", autoComplete: "new-password" },
      ]}
    >
      {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}
    </FormShell>
  );
}

export function ForgotPasswordForm() {
  return (
    <FormShell
      action={requestPasswordReset}
      submit="Send reset link"
      fields={[{ name: "email", label: "Email", type: "email", autoComplete: "email" }]}
    />
  );
}

export function ResetPasswordForm() {
  return (
    <FormShell
      action={updatePassword}
      submit="Save new password"
      fields={[
        { name: "password", label: "New password", type: "password", autoComplete: "new-password" },
      ]}
    />
  );
}

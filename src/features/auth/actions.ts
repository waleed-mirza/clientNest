"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { demoAccountPasswordBlocked, demoWriteBlocked } from "@/lib/demo/guard";
import { demoPassword, isDemoAccount, isDemoMode, publicDemoAccount } from "@/lib/demo/mode";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@/lib/validation/auth";

export type AuthState = { ok: boolean; message: string };

function formString(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "");
}

async function requestOrigin(): Promise<string> {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  if (!host) return "http://localhost:3000";
  return `${proto}://${host}`;
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const blocked = demoWriteBlocked();
  if (blocked) return blocked;
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      message:
        "Supabase is not configured. Copy the hosted project URL and anon key into .env.local.",
    };
  }
  const parsed = signUpSchema.safeParse({
    fullName: formString(formData, "fullName"),
    email: formString(formData, "email"),
    password: formString(formData, "password"),
  });
  if (!parsed.success) {
    return { ok: false, message: "Check your name, email, and password (8+ characters)." };
  }
  if (isDemoAccount(parsed.data.email)) {
    return { ok: false, message: "Harbor demo emails are reserved. Use a different address." };
  }

  const supabase = await createClient();
  const origin = await requestOrigin();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  });
  if (error) return { ok: false, message: error.message };
  if (!data.session) {
    return {
      ok: true,
      message: "Check your email to confirm the account, then sign in.",
    };
  }

  const next = formString(formData, "next");
  if (next.startsWith("/invite/")) redirect(next);
  redirect("/onboarding");
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      message:
        "Supabase is not configured. Copy the hosted project URL and anon key into .env.local.",
    };
  }
  const parsed = signInSchema.safeParse({
    email: formString(formData, "email"),
    password: formString(formData, "password"),
  });
  if (!parsed.success) {
    return { ok: false, message: "Enter a valid email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) return { ok: false, message: error.message };

  const next = formString(formData, "next") || "/app";
  redirect(next.startsWith("/") ? next : "/app");
}

export async function signInToPublicDemo(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!isDemoMode()) {
    return { ok: false, message: "One-click access is only available on the public demo." };
  }
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "Supabase is not configured." };
  }

  const account = publicDemoAccount(formString(formData, "view"));
  if (!account) {
    return { ok: false, message: "Choose the owner or client demo view." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: account.email,
    password: demoPassword,
  });
  if (error) return { ok: false, message: error.message };

  redirect("/app");
}

export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured()) redirect("/");
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordReset(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "Supabase is not configured." };
  }
  const parsed = forgotPasswordSchema.safeParse({
    email: formString(formData, "email"),
  });
  if (!parsed.success) {
    return { ok: false, message: "Enter a valid email." };
  }
  const demoPassword = demoAccountPasswordBlocked(parsed.data.email) ?? demoWriteBlocked();
  if (demoPassword) return demoPassword;
  const supabase = await createClient();
  const origin = await requestOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/confirm?next=/reset-password`,
  });
  if (error) return { ok: false, message: error.message };
  return {
    ok: true,
    message: "If that email is registered, a reset link is on its way.",
  };
}

export async function updatePassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const blocked = demoWriteBlocked();
  if (blocked) return blocked;
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "Supabase is not configured." };
  }
  const parsed = resetPasswordSchema.safeParse({
    password: formString(formData, "password"),
  });
  if (!parsed.success) {
    return { ok: false, message: "Password must be at least 8 characters." };
  }
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = typeof data?.claims?.email === "string" ? data.claims.email : undefined;
  const demoPassword = demoAccountPasswordBlocked(email);
  if (demoPassword) return demoPassword;
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { ok: false, message: error.message };
  redirect("/app");
}

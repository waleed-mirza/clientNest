import Link from "next/link";
import { SignUpForm } from "@/features/auth/auth-form";
import { AuthPage } from "@/components/auth/auth-page";
import { isDemoMode } from "@/lib/demo/mode";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata = { title: "Create account" };

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const nextPath = next?.startsWith("/invite/") ? next : undefined;
  return (
    <AuthPage
      title="Create an account"
      description={
        nextPath
          ? "Use the email this invite was sent to. You’ll join the workspace after signing up."
          : "This first account becomes the workspace owner. Invite teammates and clients from Team."
      }
      footer={
        <p>
          Already registered?{" "}
          <Link
            href={nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login"}
            className="text-accent underline-offset-2 hover:underline"
          >
            Sign in
          </Link>
        </p>
      }
    >
      {isDemoMode() ? (
        <p className="text-sm text-muted">
          This hosted demo does not accept new accounts.{" "}
          <Link href="/login" className="text-accent underline-offset-2 hover:underline">
            Sign in as Sam or Alex
          </Link>{" "}
          or{" "}
          <Link href="/docs/quick-start" className="text-accent underline-offset-2 hover:underline">
            install your own copy
          </Link>
          .
        </p>
      ) : isSupabaseConfigured() ? (
        <SignUpForm nextPath={nextPath} />
      ) : (
        <p className="text-sm text-danger">
          Supabase is not configured. Add the hosted project URL and anon key to{" "}
          <code className="font-mono text-foreground">.env.local</code> before creating an account.
        </p>
      )}
    </AuthPage>
  );
}

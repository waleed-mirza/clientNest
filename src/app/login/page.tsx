import Link from "next/link";
import { SignInForm } from "@/features/auth/auth-form";
import { AuthPage } from "@/components/auth/auth-page";
import { PublicDemoAccess } from "@/components/auth/public-demo-access";
import { isDemoMode } from "@/lib/demo/mode";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata = { title: "Sign in" };

function LoginContent({ nextPath }: { nextPath: string }) {
  if (!isSupabaseConfigured()) {
    return (
      <p className="text-sm text-danger">
        Supabase is not configured. Copy the hosted project URL and anon key into{" "}
        <code className="font-mono text-foreground">.env.local</code> (see{" "}
        <code className="font-mono text-foreground">.env.example</code>), then restart{" "}
        <code className="font-mono text-foreground">pnpm dev</code>.
      </p>
    );
  }

  if (isDemoMode()) return <PublicDemoAccess />;

  return <SignInForm nextPath={nextPath} />;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const nextPath = next?.startsWith("/") ? next : "/app";
  const demo = isDemoMode();

  return (
    <AuthPage
      title={demo ? "Harbor Studio demo" : "Sign in"}
      description={
        demo
          ? "Open an owner or client view in one click. You do not need a password on this public demo."
          : "Agency staff and clients use the same login. Your role decides what you can see."
      }
      footer={
        demo ? (
          <p>This shared demo is read-only. Your own install uses ordinary email sign-in.</p>
        ) : (
          <p>
            No account?{" "}
            <Link
              href={
                nextPath.startsWith("/invite/")
                  ? `/signup?next=${encodeURIComponent(nextPath)}`
                  : "/signup"
              }
              className="text-accent underline-offset-2 hover:underline"
            >
              Create one
            </Link>
          </p>
        )
      }
    >
      <LoginContent nextPath={nextPath} />
    </AuthPage>
  );
}

import Link from "next/link";
import { ForgotPasswordForm } from "@/features/auth/auth-form";
import { AuthPage } from "@/components/auth/auth-page";

export const metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <AuthPage
      title="Reset password"
      description="We’ll email a link if that address has an account. Hosted Supabase sends that mail; check spam if it is slow."
      footer={
        <p>
          <Link href="/login" className="text-accent underline-offset-2 hover:underline">
            Back to sign in
          </Link>
        </p>
      }
    >
      <ForgotPasswordForm />
    </AuthPage>
  );
}

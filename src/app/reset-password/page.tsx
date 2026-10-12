import { ResetPasswordForm } from "@/features/auth/auth-form";
import { AuthPage } from "@/components/auth/auth-page";

export const metadata = { title: "New password" };

export default function ResetPasswordPage() {
  return (
    <AuthPage
      title="Choose a new password"
      description="Use at least 8 characters. You’ll be signed in after saving."
    >
      <ResetPasswordForm />
    </AuthPage>
  );
}

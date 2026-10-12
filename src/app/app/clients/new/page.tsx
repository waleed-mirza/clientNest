import { AccessDenied } from "@/components/app/access-denied";
import { PageHeader } from "@/components/app/page-header";
import { requireMembership } from "@/features/auth/session";
import { ClientForm } from "@/features/clients/forms";
import { isInternalRole } from "@/lib/security/roles";

export const metadata = { title: "New client" };

export default async function NewClientPage() {
  const membership = await requireMembership();
  if (!isInternalRole(membership.role)) {
    return (
      <AccessDenied title="New client" message="Only agency team members can add companies." />
    );
  }

  return (
    <div className="grid gap-8">
      <PageHeader
        title="New client"
        description="Add a company. You can invite a contact after you save."
      />
      <div className="max-w-xl bg-surface p-5">
        <ClientForm />
      </div>
    </div>
  );
}

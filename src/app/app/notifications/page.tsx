import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { requireMembership } from "@/features/auth/session";
import { MarkAllReadForm, NotificationRow } from "@/features/notifications/forms";
import { listNotifications } from "@/features/notifications/queries";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const membership = await requireMembership();
  const items = await listNotifications(membership.userId);
  const unread = items.some((item) => !item.readAt);

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Notifications"
        description="Approvals, comments, and invoices. Email is optional and the app works without it."
        action={unread ? <MarkAllReadForm /> : null}
      />

      {items.length === 0 ? (
        <EmptyState title="No notifications yet">
          When someone requests approval or sends an invoice, it will show up here.
        </EmptyState>
      ) : (
        <ul className="divide-y divide-border bg-surface">
          {items.map((item) => (
            <li key={item.id}>
              <NotificationRow item={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

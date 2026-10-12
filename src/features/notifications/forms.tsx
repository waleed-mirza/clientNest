"use client";

import { useActionState } from "react";
import {
  markAllNotificationsRead,
  openNotification,
  type RecordState,
} from "@/features/notifications/actions";
import { ActionButton } from "@/components/app/action-button";
import { secondaryButtonClass } from "@/components/app/styles";
import { formatWhen } from "@/lib/activity/time";
import type { NotificationRecord } from "@/features/notifications/queries";

const empty: RecordState = { ok: false, message: "" };

export function NotificationRow({ item }: { item: NotificationRecord }) {
  const unread = !item.readAt;
  return (
    <form action={openNotification}>
      <input type="hidden" name="id" value={item.id} />
      <button
        type="submit"
        className={`flex w-full cursor-pointer flex-wrap items-start justify-between gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-background active:bg-accent-soft ${
          unread ? "bg-accent-soft" : ""
        }`}
      >
        <div className="flex items-start gap-2">
          {unread ? (
            <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
          ) : (
            <span aria-hidden className="mt-2 size-1.5 shrink-0" />
          )}
          <div>
            <p className={unread ? "font-medium" : ""}>{item.title}</p>
            <p className="mt-1 text-sm text-muted">{item.body}</p>
          </div>
        </div>
        <time className="text-sm text-muted" dateTime={item.createdAt}>
          {unread ? <span className="sr-only">Unread. </span> : null}
          {formatWhen(item.createdAt)}
        </time>
      </button>
    </form>
  );
}

export function MarkAllReadForm() {
  const [state, action, pending] = useActionState(markAllNotificationsRead, empty);
  return (
    <form action={action} className="grid gap-2">
      <ActionButton pending={pending} pendingLabel="Updating…" className={secondaryButtonClass}>
        Mark all as read
      </ActionButton>
      {state.message ? (
        <p role="status" className={state.ok ? "text-sm text-accent" : "text-sm text-danger"}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentMembership } from "@/features/auth/session";
import { formString } from "@/lib/form-data";
import { notificationIdSchema } from "@/lib/validation/records";

export type RecordState = { ok: boolean; message: string };

async function requireUser() {
  if (!isSupabaseConfigured()) {
    return {
      error: { ok: false, message: "Supabase is not configured." } as RecordState,
      membership: null,
    };
  }
  const membership = await getCurrentMembership();
  if (!membership) {
    return { error: { ok: false, message: "You need a workspace first." }, membership: null };
  }
  return { error: null, membership };
}

function refreshNotifications() {
  revalidatePath("/app", "layout");
  revalidatePath("/app/notifications");
}

export async function openNotification(formData: FormData): Promise<void> {
  const { error, membership } = await requireUser();
  if (error || !membership) redirect("/login");

  const parsed = notificationIdSchema.safeParse({ id: formString(formData, "id") });
  if (!parsed.success) redirect("/app/notifications");

  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("href, read_at")
    .eq("id", parsed.data.id)
    .eq("recipient_id", membership.userId)
    .maybeSingle();

  if (!data) redirect("/app/notifications");

  if (!data.read_at) {
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", parsed.data.id)
      .eq("recipient_id", membership.userId);
  }

  refreshNotifications();
  redirect(data.href.startsWith("/app/") ? data.href : "/app/notifications");
}

export async function markAllNotificationsRead(state: RecordState): Promise<RecordState> {
  void state;
  const { error, membership } = await requireUser();
  if (error || !membership) return error ?? { ok: false, message: "You need a workspace first." };

  const supabase = await createClient();
  const { error: updateError } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", membership.userId)
    .is("read_at", null);

  if (updateError) return { ok: false, message: updateError.message };
  refreshNotifications();
  return { ok: true, message: "Notifications marked as read." };
}

import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendNotificationEmail } from "@/lib/notifications/email";

type Db = Awaited<ReturnType<typeof createClient>>;

export type NotificationRecipient = {
  id: string;
  email?: string | null;
};

export async function notifyPeople(
  supabase: Db,
  input: {
    workspaceId: string;
    actorId: string;
    recipients: NotificationRecipient[];
    eventType: string;
    title: string;
    body: string;
    href: string;
  },
): Promise<void> {
  const recipients = input.recipients.filter(
    (recipient, index, list) =>
      recipient.id !== input.actorId &&
      list.findIndex((item) => item.id === recipient.id) === index,
  );
  if (recipients.length === 0) return;

  const { error } = await supabase.from("notifications").insert(
    recipients.map((recipient) => ({
      workspace_id: input.workspaceId,
      recipient_id: recipient.id,
      actor_id: input.actorId,
      event_type: input.eventType.slice(0, 40),
      title: input.title.slice(0, 80),
      body: input.body.slice(0, 240),
      href: input.href.slice(0, 200),
    })),
  );
  if (error) return;

  const emails = recipients
    .map((recipient) => recipient.email?.trim().toLowerCase())
    .filter((email): email is string => Boolean(email));

  if (emails.length === 0) return;

  after(() => {
    void Promise.all(
      emails.map((email) =>
        sendNotificationEmail({
          to: email,
          subject: input.title,
          text: `${input.body}\n\nOpen: ${input.href}`,
        }),
      ),
    );
  });
}

export async function listClientRecipients(
  supabase: Db,
  clientId: string,
): Promise<NotificationRecipient[]> {
  const { data } = await supabase
    .from("client_contacts")
    .select("profile_id, email")
    .eq("client_id", clientId)
    .not("profile_id", "is", null);
  return (data ?? [])
    .filter((row) => typeof row.profile_id === "string")
    .map((row) => ({
      id: row.profile_id as string,
      email: typeof row.email === "string" ? row.email : null,
    }));
}

export async function listProjectTeamRecipients(
  supabase: Db,
  projectId: string,
  workspaceId: string,
): Promise<NotificationRecipient[]> {
  const { data: members } = await supabase
    .from("project_members")
    .select("profile_id")
    .eq("project_id", projectId);

  const ids = (members ?? [])
    .map((row) => row.profile_id)
    .filter((id): id is string => typeof id === "string");

  if (ids.length > 0) return ids.map((id) => ({ id, email: null }));

  const { data: fallback } = await supabase
    .from("memberships")
    .select("profile_id, role")
    .eq("workspace_id", workspaceId)
    .in("role", ["owner", "manager", "member"]);

  return (fallback ?? [])
    .map((row) => row.profile_id)
    .filter((id): id is string => typeof id === "string")
    .map((id) => ({ id, email: null }));
}

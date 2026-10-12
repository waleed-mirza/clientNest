import { createClient } from "@/lib/supabase/server";

export type ActivityType =
  | "project.created"
  | "project.status"
  | "project.archived"
  | "milestone.created"
  | "milestone.status"
  | "milestone.deleted"
  | "task.created"
  | "task.status"
  | "task.deleted"
  | "file.uploaded"
  | "file.deleted"
  | "deliverable.created"
  | "deliverable.submitted"
  | "deliverable.commented"
  | "deliverable.approved"
  | "deliverable.changes_requested"
  | "invoice.sent"
  | "invoice.paid";

type Db = Awaited<ReturnType<typeof createClient>>;

export async function actorLabel(supabase: Db, userId: string): Promise<string> {
  const { data } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", userId)
    .maybeSingle();
  const name = typeof data?.full_name === "string" ? data.full_name.trim() : "";
  return name.length > 0 ? name : "A teammate";
}

export async function recordActivity(
  supabase: Db,
  input: {
    workspaceId: string;
    projectId: string;
    actorId: string;
    type: ActivityType;
    summary: string;
    visibility?: "internal" | "client";
    metadata?: Record<string, string | number | boolean | null>;
  },
): Promise<void> {
  await supabase.from("activity_events").insert({
    workspace_id: input.workspaceId,
    project_id: input.projectId,
    actor_id: input.actorId,
    event_type: input.type,
    summary: input.summary.slice(0, 240),
    visibility: input.visibility ?? "client",
    metadata: input.metadata ?? {},
  });
}

import { createClient } from "@/lib/supabase/server";
import { relationOne } from "@/lib/supabase/relation";
import {
  isApprovalDecision,
  isDeliverableStatus,
  type ApprovalDecision,
  type DeliverableStatus,
} from "@/lib/deliverables/status";

export type DeliverableRecord = {
  id: string;
  projectId: string;
  projectName: string;
  clientId: string;
  clientName: string;
  title: string;
  note: string | null;
  status: DeliverableStatus;
  version: number;
  fileId: string | null;
  fileName: string | null;
  fileMime: string | null;
  createdAt: string;
  requestedAt: string | null;
};

export type DeliverableCommentRecord = {
  id: string;
  body: string;
  createdAt: string;
  authorName: string | null;
};

export type ApprovalRecord = {
  id: string;
  decision: ApprovalDecision;
  note: string | null;
  createdAt: string;
  actorName: string | null;
};

function asStatus(value: string): DeliverableStatus {
  return isDeliverableStatus(value) ? value : "draft";
}

function mapDeliverable(row: {
  id: string;
  project_id: string;
  title: string;
  note: string | null;
  status: string;
  version: number;
  file_id: string | null;
  created_at: string;
  requested_at: string | null;
  files:
    | { original_name: string; mime_type: string }
    | { original_name: string; mime_type: string }[]
    | null;
  projects:
    | { name: string; client_id: string; clients: { name: string } | { name: string }[] | null }
    | { name: string; client_id: string; clients: { name: string } | { name: string }[] | null }[]
    | null;
}): DeliverableRecord {
  const file = relationOne(row.files);
  const project = relationOne(row.projects);
  const client = relationOne(project?.clients);
  return {
    id: row.id,
    projectId: row.project_id,
    projectName: project?.name ?? "Project",
    clientId: project?.client_id ?? "",
    clientName: client?.name ?? "Client",
    title: row.title,
    note: row.note,
    status: asStatus(row.status),
    version: row.version,
    fileId: row.file_id,
    fileName: file?.original_name ?? null,
    fileMime: file?.mime_type ?? null,
    createdAt: row.created_at,
    requestedAt: row.requested_at,
  };
}

const deliverableSelect =
  "id, project_id, title, note, status, version, file_id, created_at, requested_at, files(original_name, mime_type), projects!project_id(name, client_id, clients(name))";

export async function listProjectDeliverables(projectId: string): Promise<DeliverableRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deliverables")
    .select(deliverableSelect)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapDeliverable);
}

export async function getDeliverable(
  workspaceId: string,
  id: string,
): Promise<DeliverableRecord | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deliverables")
    .select(deliverableSelect)
    .eq("workspace_id", workspaceId)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapDeliverable(data);
}

export async function listDeliverableComments(
  deliverableId: string,
): Promise<DeliverableCommentRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deliverable_comments")
    .select("id, body, created_at, profiles!author_id(full_name)")
    .eq("deliverable_id", deliverableId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => {
    const profile = relationOne(
      row.profiles as { full_name: string | null } | { full_name: string | null }[] | null,
    );
    return {
      id: row.id,
      body: row.body,
      createdAt: row.created_at,
      authorName: profile?.full_name ?? null,
    };
  });
}

export async function listDeliverableApprovals(deliverableId: string): Promise<ApprovalRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("approvals")
    .select("id, decision, note, created_at, profiles!actor_id(full_name)")
    .eq("deliverable_id", deliverableId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => {
    const profile = relationOne(
      row.profiles as { full_name: string | null } | { full_name: string | null }[] | null,
    );
    const decision = String(row.decision);
    return {
      id: row.id,
      decision: isApprovalDecision(decision) ? decision : "changes_requested",
      note: row.note,
      createdAt: row.created_at,
      actorName: profile?.full_name ?? null,
    };
  });
}

export async function listAwaitingDeliverables(workspaceId: string): Promise<DeliverableRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deliverables")
    .select(deliverableSelect)
    .eq("workspace_id", workspaceId)
    .eq("status", "awaiting_approval")
    .order("requested_at", { ascending: true, nullsFirst: false })
    .limit(8);

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapDeliverable);
}

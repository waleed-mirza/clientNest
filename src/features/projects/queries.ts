import { createClient } from "@/lib/supabase/server";
import { relationOne } from "@/lib/supabase/relation";
import { searchPattern } from "@/lib/search";
import { isProjectStatus, type ProjectStatus } from "@/lib/projects/status";

export type ProjectRecord = {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  startDate: string | null;
  dueDate: string | null;
  archivedAt: string | null;
  clientId: string;
  clientName: string;
};

export type ProjectMemberRecord = {
  id: string;
  profileId: string;
  fullName: string | null;
};

function asStatus(value: string): ProjectStatus {
  return isProjectStatus(value) ? value : "planned";
}

function mapProject(row: {
  id: string;
  name: string;
  description: string | null;
  status: string;
  start_date: string | null;
  due_date: string | null;
  archived_at: string | null;
  client_id: string;
  clients: { name: string } | { name: string }[] | null;
}): ProjectRecord {
  const client = relationOne(row.clients);
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    status: asStatus(row.status),
    startDate: row.start_date,
    dueDate: row.due_date,
    archivedAt: row.archived_at,
    clientId: row.client_id,
    clientName: client?.name ?? "Unknown client",
  };
}

const projectSelect =
  "id, name, description, status, start_date, due_date, archived_at, client_id, clients(name)";

export async function listProjects(input: {
  workspaceId: string;
  query?: string | string[];
  status?: string;
  archived?: boolean;
  clientId?: string;
}): Promise<ProjectRecord[]> {
  const supabase = await createClient();
  let request = supabase
    .from("projects")
    .select(projectSelect)
    .eq("workspace_id", input.workspaceId)
    .order("due_date", { ascending: true, nullsFirst: false })
    .limit(100);

  request = input.archived
    ? request.not("archived_at", "is", null)
    : request.is("archived_at", null);

  const pattern = searchPattern(input.query);
  if (pattern) request = request.ilike("name", pattern);
  if (input.status && isProjectStatus(input.status)) {
    request = request.eq("status", input.status);
  }
  if (input.clientId) request = request.eq("client_id", input.clientId);

  const { data, error } = await request;
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapProject);
}

export async function getProject(workspaceId: string, id: string): Promise<ProjectRecord | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(projectSelect)
    .eq("workspace_id", workspaceId)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapProject(data);
}

export async function listProjectMembers(projectId: string): Promise<ProjectMemberRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_members")
    .select("id, profile_id, profiles(full_name)")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const profile = relationOne(
      row.profiles as { full_name: string | null } | { full_name: string | null }[] | null,
    );
    return {
      id: row.id,
      profileId: row.profile_id as string,
      fullName: profile?.full_name ?? null,
    };
  });
}

export async function listRecentProjects(workspaceId: string, limit = 5): Promise<ProjectRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(projectSelect)
    .eq("workspace_id", workspaceId)
    .is("archived_at", null)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapProject);
}

export async function countActiveProjects(workspaceId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .is("archived_at", null);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function countAwaitingApproval(workspaceId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .eq("status", "awaiting_approval")
    .is("archived_at", null);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

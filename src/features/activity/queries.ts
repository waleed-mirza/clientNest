import { createClient } from "@/lib/supabase/server";
import { relationOne } from "@/lib/supabase/relation";

export type ActivityRecord = {
  id: string;
  summary: string;
  createdAt: string;
  projectId: string;
  projectName: string;
};

export async function listProjectActivity(
  projectId: string,
  limit = 50,
): Promise<ActivityRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_events")
    .select("id, summary, created_at, project_id, projects!project_id(name)")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapActivity);
}

export async function listRecentActivity(
  workspaceId: string,
  limit = 8,
): Promise<ActivityRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_events")
    .select("id, summary, created_at, project_id, projects!project_id(name)")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapActivity);
}

function mapActivity(row: {
  id: string;
  summary: string;
  created_at: string;
  project_id: string;
  projects: { name: string } | { name: string }[] | null;
}): ActivityRecord {
  const project = relationOne(row.projects);
  return {
    id: row.id,
    summary: row.summary,
    createdAt: row.created_at,
    projectId: row.project_id,
    projectName: project?.name ?? "Project",
  };
}

import { createClient } from "@/lib/supabase/server";
import { relationOne } from "@/lib/supabase/relation";
import {
  isMilestoneStatus,
  isTaskStatus,
  type MilestoneStatus,
  type TaskStatus,
} from "@/lib/projects/workflow";

export type MilestoneRecord = {
  id: string;
  projectId: string;
  name: string;
  status: MilestoneStatus;
  dueDate: string | null;
  sortOrder: number;
};

export type TaskRecord = {
  id: string;
  projectId: string;
  name: string;
  status: TaskStatus;
  dueDate: string | null;
  sortOrder: number;
  milestoneId: string | null;
  milestoneName: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
};

function asMilestoneStatus(value: string): MilestoneStatus {
  return isMilestoneStatus(value) ? value : "planned";
}

function asTaskStatus(value: string): TaskStatus {
  return isTaskStatus(value) ? value : "todo";
}

export async function listMilestones(projectId: string): Promise<MilestoneRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("milestones")
    .select("id, project_id, name, status, due_date, sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    status: asMilestoneStatus(row.status),
    dueDate: row.due_date,
    sortOrder: row.sort_order,
  }));
}

export async function listTasks(projectId: string): Promise<TaskRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select(
      "id, project_id, name, status, due_date, sort_order, milestone_id, assignee_id, milestones!milestone_id(name), profiles!assignee_id(full_name)",
    )
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const milestone = relationOne(row.milestones as { name: string } | { name: string }[] | null);
    const profile = relationOne(
      row.profiles as { full_name: string | null } | { full_name: string | null }[] | null,
    );
    return {
      id: row.id,
      projectId: row.project_id,
      name: row.name,
      status: asTaskStatus(row.status),
      dueDate: row.due_date,
      sortOrder: row.sort_order,
      milestoneId: row.milestone_id,
      milestoneName: milestone?.name ?? null,
      assigneeId: row.assignee_id,
      assigneeName: profile?.full_name ?? null,
    };
  });
}

export async function nextSortOrder(
  table: "milestones" | "tasks",
  projectId: string,
): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(table)
    .select("sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data?.sort_order ?? -1) + 1;
}

import { createClient } from "@/lib/supabase/server";
import { relationOne } from "@/lib/supabase/relation";
import { isFileVisibility, type FileVisibility } from "@/lib/files/rules";

export type FileRecord = {
  id: string;
  projectId: string;
  originalName: string;
  storagePath: string;
  mimeType: string;
  byteSize: number;
  visibility: FileVisibility;
  uploadedByName: string | null;
  createdAt: string;
};

function asVisibility(value: string): FileVisibility {
  return isFileVisibility(value) ? value : "internal";
}

export async function listProjectFiles(projectId: string): Promise<FileRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("files")
    .select(
      "id, project_id, original_name, storage_path, mime_type, byte_size, visibility, created_at, profiles!uploaded_by(full_name)",
    )
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const profile = relationOne(
      row.profiles as { full_name: string | null } | { full_name: string | null }[] | null,
    );
    return {
      id: row.id,
      projectId: row.project_id,
      originalName: row.original_name,
      storagePath: row.storage_path,
      mimeType: row.mime_type,
      byteSize: row.byte_size,
      visibility: asVisibility(row.visibility),
      uploadedByName: profile?.full_name ?? null,
      createdAt: row.created_at,
    };
  });
}

export async function countSharedFiles(workspaceId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("files")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .eq("visibility", "client");

  if (error) throw new Error(error.message);
  return count ?? 0;
}

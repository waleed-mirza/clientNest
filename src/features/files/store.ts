import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { projectFilesBucket, resolveUpload, type FileVisibility } from "@/lib/files/rules";

type Db = Awaited<ReturnType<typeof createClient>>;

export async function persistProjectFile(
  supabase: Db,
  input: {
    workspaceId: string;
    projectId: string;
    userId: string;
    file: File;
    visibility: FileVisibility;
  },
): Promise<{ ok: true; id: string; name: string } | { ok: false; message: string }> {
  const resolved = resolveUpload({
    name: input.file.name,
    type: input.file.type,
    size: input.file.size,
  });
  if (!resolved.ok) return resolved;

  const id = randomUUID();
  const storagePath = `${input.workspaceId}/${input.projectId}/${id}`;

  const { error: insertError } = await supabase.from("files").insert({
    id,
    workspace_id: input.workspaceId,
    project_id: input.projectId,
    original_name: resolved.name,
    storage_path: storagePath,
    mime_type: resolved.mime,
    byte_size: input.file.size,
    visibility: input.visibility,
    uploaded_by: input.userId,
  });
  if (insertError) return { ok: false, message: insertError.message };

  const { error: uploadError } = await supabase.storage
    .from(projectFilesBucket)
    .upload(storagePath, input.file, {
      contentType: resolved.mime,
      upsert: false,
    });

  if (uploadError) {
    await supabase.from("files").delete().eq("id", id).eq("workspace_id", input.workspaceId);
    return { ok: false, message: uploadError.message };
  }

  return { ok: true, id, name: resolved.name };
}

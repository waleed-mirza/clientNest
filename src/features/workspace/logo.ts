import { createClient } from "@/lib/supabase/server";
import { logoStoragePath, workspaceLogosBucket } from "@/lib/workspace/logo";

export async function getWorkspaceLogoUrl(
  workspaceId: string,
  logoPath: string | null,
): Promise<string | null> {
  if (!logoPath) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(workspaceLogosBucket)
    .createSignedUrl(logoStoragePath(workspaceId), 3600);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

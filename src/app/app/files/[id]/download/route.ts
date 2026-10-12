import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentMembership } from "@/features/auth/session";
import { projectFilesBucket } from "@/lib/files/rules";
import { parseUuid } from "@/lib/validation/id";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const origin = new URL(request.url).origin;
  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const membership = await getCurrentMembership();
  if (!membership) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const { id: rawId } = await params;
  const id = parseUuid(rawId);
  if (!id) {
    return new NextResponse("File is not available.", { status: 404 });
  }

  const supabase = await createClient();
  const { data: file } = await supabase
    .from("files")
    .select("original_name, storage_path")
    .eq("id", id)
    .maybeSingle();

  if (!file) {
    return new NextResponse("File is not available.", { status: 404 });
  }

  const { data, error } = await supabase.storage
    .from(projectFilesBucket)
    .createSignedUrl(file.storage_path, 60, { download: file.original_name });

  if (error || !data?.signedUrl) {
    return new NextResponse("File is not available.", { status: 404 });
  }

  return NextResponse.redirect(data.signedUrl);
}

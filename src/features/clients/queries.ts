import { createClient } from "@/lib/supabase/server";
import { relationOne } from "@/lib/supabase/relation";
import { searchPattern } from "@/lib/search";

export type ClientRecord = {
  id: string;
  name: string;
  website: string | null;
  notes: string | null;
  archivedAt: string | null;
  createdAt: string;
};

export type ClientContactRecord = {
  id: string;
  name: string;
  email: string;
  title: string | null;
  profileId: string | null;
};

export async function listClients(input: {
  workspaceId: string;
  query?: string | string[];
  archived?: boolean;
}): Promise<ClientRecord[]> {
  const supabase = await createClient();
  let request = supabase
    .from("clients")
    .select("id, name, website, notes, archived_at, created_at")
    .eq("workspace_id", input.workspaceId)
    .order("name", { ascending: true })
    .limit(100);

  request = input.archived
    ? request.not("archived_at", "is", null)
    : request.is("archived_at", null);

  const pattern = searchPattern(input.query);
  if (pattern) request = request.ilike("name", pattern);

  const { data, error } = await request;
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    website: row.website,
    notes: row.notes,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
  }));
}

export async function getClient(workspaceId: string, id: string): Promise<ClientRecord | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("id, name, website, notes, archived_at, created_at")
    .eq("workspace_id", workspaceId)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    website: data.website,
    notes: data.notes,
    archivedAt: data.archived_at,
    createdAt: data.created_at,
  };
}

export async function listClientContacts(clientId: string): Promise<ClientContactRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("client_contacts")
    .select("id, name, email, title, profile_id")
    .eq("client_id", clientId)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    title: row.title,
    profileId: row.profile_id,
  }));
}

export async function countActiveClients(workspaceId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("clients")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .is("archived_at", null);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

export type ClientOption = { id: string; name: string };

export async function listClientOptions(workspaceId: string): Promise<ClientOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("id, name")
    .eq("workspace_id", workspaceId)
    .is("archived_at", null)
    .order("name", { ascending: true })
    .limit(100);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export type ProfileName = { id: string; fullName: string | null; role: string };

export async function listWorkspacePeople(workspaceId: string): Promise<ProfileName[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("memberships")
    .select("profile_id, role, profiles(full_name)")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const profile = relationOne(
      row.profiles as { full_name: string | null } | { full_name: string | null }[] | null,
    );
    return {
      id: row.profile_id as string,
      fullName: profile?.full_name ?? null,
      role: String(row.role),
    };
  });
}

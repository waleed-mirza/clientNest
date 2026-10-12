export const demoPassword = "Harbor-Demo-24";

export const demoAccounts = [
  {
    email: "sam.reed@example.com",
    name: "Sam Reed",
    role: "Owner",
    story: "Harbor Studio. Clients, files, and request approval.",
  },
  {
    email: "riley.chen@example.com",
    name: "Riley Chen",
    role: "Member",
    story: "Internal designer. Team-only files stay hidden from the client.",
  },
  {
    email: "alex.marin@example.com",
    name: "Alex Marin",
    role: "Client",
    story: "Pine & Oak Coffee. Assigned projects, shared files, and Homepage hero v3.",
  },
] as const;

export const demoEmails = demoAccounts.map((account) => account.email);

export function publicDemoAccount(view: string): (typeof demoAccounts)[number] | null {
  switch (view) {
    case "owner":
      return demoAccounts[0];
    case "client":
      return demoAccounts[2];
    default:
      return null;
  }
}

export const harborWorkspaceId = "11111111-aaaa-4111-8111-aaaaaaaaaaaa";
export const harborSeasonalProjectId = "11111111-eeee-4111-8111-eeeeeeeeeee1";

export function isDemoMode(): boolean {
  const value = process.env.DEMO_MODE ?? process.env.NEXT_PUBLIC_DEMO_MODE;
  return value?.trim().toLowerCase() === "true";
}

export function isDemoAccount(email: string | undefined | null): boolean {
  if (!email) return false;
  return demoEmails.includes(email.trim().toLowerCase() as (typeof demoEmails)[number]);
}

export const demoWriteMessage =
  "This hosted demo is read-only. Install ClientNest on your own Supabase project to make changes.";

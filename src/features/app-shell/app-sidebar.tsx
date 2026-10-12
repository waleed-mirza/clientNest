import { Menu, X } from "lucide-react";
import { signOut } from "@/features/auth/actions";
import { SignOutButton } from "@/features/app-shell/sign-out-button";
import { WorkspaceNav, type NavCounts } from "@/features/app-shell/workspace-nav";
import { ColorSchemeToggle } from "@/components/theme/color-scheme-toggle";
import { roleLabel, type MembershipRole } from "@/lib/security/roles";

type Props = {
  workspaceName: string;
  role: MembershipRole;
  logoUrl: string | null;
  counts: NavCounts;
};

function Brand({ workspaceName, logoUrl }: { workspaceName: string; logoUrl: string | null }) {
  const initial = workspaceName.trim().charAt(0).toUpperCase() || "W";
  return (
    <div className="flex items-center gap-3">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="" className="size-8 rounded-sm object-cover" />
      ) : (
        <span
          aria-hidden
          className="flex size-8 items-center justify-center rounded-sm bg-accent-soft font-serif text-sm font-semibold text-accent"
        >
          {initial}
        </span>
      )}
      <p className="font-serif text-base font-semibold leading-tight">{workspaceName}</p>
    </div>
  );
}

function SidebarBody({ workspaceName, role, logoUrl, counts }: Props) {
  return (
    <>
      <Brand workspaceName={workspaceName} logoUrl={logoUrl} />
      <p className="mt-1 text-xs text-muted">{roleLabel(role)}</p>
      <div className="mt-6">
        <WorkspaceNav role={role} counts={counts} />
      </div>
      <div className="mt-auto grid gap-4 pt-8">
        <ColorSchemeToggle />
        <form action={signOut}>
          <SignOutButton />
        </form>
      </div>
    </>
  );
}

export function AppSidebar(props: Props) {
  return (
    <>
      <input
        id="workspace-menu"
        type="checkbox"
        className="peer/nav sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />
      <header
        data-print-hide
        className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3 md:hidden"
      >
        <Brand workspaceName={props.workspaceName} logoUrl={props.logoUrl} />
        <label
          htmlFor="workspace-menu"
          className="cursor-pointer rounded-sm p-2 text-foreground transition-colors duration-150 hover:bg-background"
          aria-label="Open menu"
        >
          <Menu aria-hidden className="size-5" strokeWidth={1.75} />
        </label>
      </header>

      <div
        data-print-hide
        className="fixed inset-0 z-40 pointer-events-none opacity-0 transition-opacity duration-150 peer-checked/nav:pointer-events-auto peer-checked/nav:!opacity-100 md:hidden"
      >
        <label
          htmlFor="workspace-menu"
          className="absolute inset-0 bg-foreground/30"
          aria-label="Close menu"
        />
        <div className="relative z-10 flex h-full w-64 flex-col bg-surface p-4 shadow-[var(--shadow-pop)]">
          <label
            htmlFor="workspace-menu"
            className="mb-4 cursor-pointer self-end rounded-sm p-2 transition-colors duration-150 hover:bg-background"
            aria-label="Close menu"
          >
            <X aria-hidden className="size-5" strokeWidth={1.75} />
          </label>
          <SidebarBody {...props} />
        </div>
      </div>

      <aside
        data-print-hide
        className="hidden h-full w-60 shrink-0 flex-col overflow-y-auto border-r border-border bg-surface p-5 md:flex"
      >
        <SidebarBody {...props} />
      </aside>
    </>
  );
}

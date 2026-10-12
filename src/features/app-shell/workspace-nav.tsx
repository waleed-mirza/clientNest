"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Building2,
  FolderKanban,
  LayoutDashboard,
  Receipt,
  Settings,
  Users,
} from "lucide-react";
import { NavItemState } from "@/components/app/nav-pending";
import type { MembershipRole } from "@/lib/security/roles";
import { canEditWorkspace, isInternalRole } from "@/lib/security/roles";

export type NavCounts = {
  clients?: number;
  projects?: number;
  invoices?: number;
  notifications?: number;
};

type CountKey = keyof NavCounts;

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  countKey?: CountKey;
};

function itemsFor(role: MembershipRole): NavItem[] {
  const items: NavItem[] = [
    { href: "/app", label: "Dashboard", icon: LayoutDashboard },
    { href: "/app/projects", label: "Projects", icon: FolderKanban, countKey: "projects" },
    { href: "/app/invoices", label: "Invoices", icon: Receipt, countKey: "invoices" },
    { href: "/app/notifications", label: "Notifications", icon: Bell, countKey: "notifications" },
  ];
  if (isInternalRole(role)) {
    items.splice(1, 0, {
      href: "/app/clients",
      label: "Clients",
      icon: Building2,
      countKey: "clients",
    });
    items.push({ href: "/app/team", label: "Team", icon: Users });
  }
  if (canEditWorkspace(role)) {
    items.push({ href: "/app/settings", label: "Settings", icon: Settings });
  }
  return items;
}

function isCurrent(pathname: string, href: string): boolean {
  if (href === "/app") return pathname === "/app";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function formatCount(value: number): string {
  return value > 99 ? "99+" : String(value);
}

export function WorkspaceNav({ role, counts = {} }: { role: MembershipRole; counts?: NavCounts }) {
  const pathname = usePathname();
  const items = itemsFor(role);

  return (
    <nav aria-label="Workspace" className="grid gap-0.5 text-sm">
      {items.map((item) => {
        const Icon = item.icon;
        const current = isCurrent(pathname, item.href);
        const count = item.countKey !== undefined ? counts[item.countKey] : undefined;
        const attention = item.countKey === "notifications" && (count ?? 0) > 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={current ? "page" : undefined}
            className={`flex items-center gap-2 rounded-sm px-2 py-1.5 transition-colors duration-150 active:bg-accent-soft ${
              current ? "bg-accent-soft font-medium" : "hover:bg-background"
            }`}
          >
            <NavItemState>
              <Icon aria-hidden className="size-4 text-muted" strokeWidth={1.75} />
              <span className="flex-1">{item.label}</span>
              {count !== undefined ? (
                <span
                  className={
                    attention
                      ? "rounded-full bg-accent px-1.5 text-xs tabular-nums text-accent-foreground"
                      : "text-xs tabular-nums text-muted"
                  }
                >
                  {formatCount(count)}
                  {item.countKey === "notifications" ? (
                    <span className="sr-only"> unread</span>
                  ) : null}
                </span>
              ) : null}
            </NavItemState>
          </Link>
        );
      })}
    </nav>
  );
}

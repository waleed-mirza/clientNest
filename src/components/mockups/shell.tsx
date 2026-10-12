"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { CheckSquare, FolderKanban, LayoutDashboard, Menu, X } from "lucide-react";
import { ColorSchemeToggle } from "@/components/theme/color-scheme-toggle";
import { agency } from "@/lib/demo-data";

const nav = [
  { href: "/mockups/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/mockups/project", label: "Projects", icon: FolderKanban, count: 8 },
  { href: "/mockups/approval", label: "Approvals", icon: CheckSquare, count: 3 },
];

function MockupNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Mockup screens" className="mt-6 grid gap-0.5 text-sm">
      {nav.map((item) => {
        const Icon = item.icon;
        const current = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={current ? "page" : undefined}
            className={`flex items-center gap-2 rounded-sm px-2 py-1.5 transition-colors duration-150 active:bg-accent-soft ${
              current ? "bg-accent-soft font-medium" : "hover:bg-background"
            }`}
          >
            <Icon aria-hidden className="size-4 text-muted" strokeWidth={1.75} />
            <span className="flex-1">{item.label}</span>
            {item.count !== undefined ? (
              <span className="text-xs tabular-nums text-muted">{item.count}</span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div>
      <p className="font-serif text-base font-semibold">{agency.name}</p>
      <p className="mt-1 text-xs text-muted">Owner view · demo</p>
    </div>
  );
}

function SidebarBody() {
  return (
    <>
      <Brand />
      <MockupNav />
      <div className="mt-8">
        <ColorSchemeToggle />
      </div>
    </>
  );
}

export function MockupBanner() {
  return (
    <p className="border-b border-border bg-surface px-4 py-2 text-center text-sm text-muted">
      Static mockup for validation. No accounts, files, or payments.{" "}
      <Link href="/" className="text-accent underline-offset-2 hover:underline">
        Back to ClientNest
      </Link>
    </p>
  );
}

export function MockupShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div data-theme="harbor" className="flex h-svh flex-col overflow-hidden bg-background">
      <MockupBanner />
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <input
          id="mockup-menu"
          type="checkbox"
          className="peer/nav sr-only"
          aria-hidden="true"
          tabIndex={-1}
        />
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3 md:hidden">
          <p className="font-serif text-base font-semibold">{agency.name}</p>
          <label
            htmlFor="mockup-menu"
            className="cursor-pointer rounded-sm p-2 transition-colors duration-150 hover:bg-background"
            aria-label="Open menu"
          >
            <Menu aria-hidden className="size-5" strokeWidth={1.75} />
          </label>
        </header>
        <div className="fixed inset-0 z-40 pointer-events-none opacity-0 transition-opacity duration-150 peer-checked/nav:pointer-events-auto peer-checked/nav:!opacity-100 md:hidden">
          <label
            htmlFor="mockup-menu"
            className="absolute inset-0 bg-foreground/30"
            aria-label="Close menu"
          />
          <div className="relative z-10 flex h-full w-64 flex-col bg-surface p-4 shadow-[var(--shadow-pop)]">
            <label
              htmlFor="mockup-menu"
              className="mb-4 cursor-pointer self-end rounded-sm p-2 transition-colors duration-150 hover:bg-background"
              aria-label="Close menu"
            >
              <X aria-hidden className="size-5" strokeWidth={1.75} />
            </label>
            <SidebarBody />
          </div>
        </div>
        <aside className="hidden h-full w-60 shrink-0 overflow-y-auto border-r border-border bg-surface p-5 md:block">
          <SidebarBody />
        </aside>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-8 md:px-10 md:py-10">
          <h1 className="text-[1.75rem] font-medium">{title}</h1>
          <div className="cn-page-enter mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function StatusPill({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
      <span aria-hidden className="size-1.5 rounded-full bg-accent" />
      {children}
    </span>
  );
}

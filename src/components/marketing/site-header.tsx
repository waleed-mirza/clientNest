import Link from "next/link";
import { ColorSchemeToggle } from "@/components/theme/color-scheme-toggle";
import { primaryButtonClass, textButtonClass } from "@/components/app/styles";
import { isDemoMode } from "@/lib/demo/mode";
import { sourceRepoUrl } from "@/lib/repo";

const links = [
  { href: "/docs", label: "Docs" },
  { href: "/#included", label: "What's included" },
  { href: "/license", label: "License" },
];

export function SiteHeader() {
  const demoLabel = isDemoMode() ? "Demo" : "Sign in";

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-4">
        <Link href="/" className="font-serif text-base font-semibold">
          ClientNest
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-6 text-sm text-muted sm:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors duration-150 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden sm:block">
            <ColorSchemeToggle compact />
          </div>
          <Link href="/login" className={`whitespace-nowrap ${textButtonClass}`}>
            {demoLabel}
          </Link>
          <a href={sourceRepoUrl} className={`whitespace-nowrap ${primaryButtonClass}`}>
            Source
          </a>
        </div>
      </div>
    </header>
  );
}

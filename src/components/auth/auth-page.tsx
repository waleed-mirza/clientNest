import type { ReactNode } from "react";
import Link from "next/link";
import { ColorSchemeToggle } from "@/components/theme/color-scheme-toggle";

export function AuthPage({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <header className="flex items-center justify-between px-4 py-4">
        <Link href="/" className="font-serif text-base font-semibold">
          ClientNest
        </Link>
        <ColorSchemeToggle compact />
      </header>
      <main className="cn-page-enter mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <h1 className="text-[1.75rem] font-medium">{title}</h1>
        <p className="mt-2 text-sm text-muted">{description}</p>
        <div className="mt-6">{children}</div>
        {footer ? <div className="mt-4 text-sm text-muted">{footer}</div> : null}
      </main>
    </div>
  );
}

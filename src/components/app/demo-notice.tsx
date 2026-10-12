import Link from "next/link";
import { isDemoMode } from "@/lib/demo/mode";

export function DemoNotice() {
  if (!isDemoMode()) return null;
  return (
    <p role="status" className="mb-8 border border-border bg-accent-soft px-4 py-3 text-sm">
      Harbor Studio demo. Browse as Sam (owner) or Alex (client). Writes are blocked so the story
      stays intact.{" "}
      <Link href="/docs/quick-start" className="text-accent underline-offset-2 hover:underline">
        Install your own copy
      </Link>
      .
    </p>
  );
}

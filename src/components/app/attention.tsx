import type { ReactNode } from "react";

export function Attention({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-labelledby="attention-heading" className="grid gap-4">
      <h2 id="attention-heading" className="text-xl font-medium">
        {title}
      </h2>
      {children}
    </section>
  );
}

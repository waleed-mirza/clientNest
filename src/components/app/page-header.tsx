import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[1.75rem] font-medium text-foreground">{title}</h1>
        {description ? <p className="mt-2 max-w-xl text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

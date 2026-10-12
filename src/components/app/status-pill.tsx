export type StatusTone = "muted" | "ink" | "pine" | "rust";

const dotClass: Record<StatusTone, string> = {
  muted: "bg-muted",
  ink: "bg-foreground",
  pine: "bg-accent",
  rust: "bg-danger",
};

export function statusToneFromLabel(label: string): StatusTone {
  const value = label.toLowerCase();
  if (
    value.includes("change") ||
    value.includes("overdue") ||
    value.includes("void") ||
    value.includes("archiv")
  ) {
    return "rust";
  }
  if (
    value.includes("await") ||
    value.includes("sent") ||
    value.includes("approv") ||
    value.includes("paid")
  ) {
    return "pine";
  }
  if (value.includes("progress") || value.includes("draft")) return "ink";
  return "muted";
}

export function StatusPill({ children, tone }: { children: string; tone?: StatusTone }) {
  const resolved = tone ?? statusToneFromLabel(children);
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
      <span aria-hidden className={`size-1.5 rounded-full ${dotClass[resolved]}`} />
      {children}
    </span>
  );
}

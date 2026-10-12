import { formatDay } from "@/lib/projects/status";

export function formatWhen(iso: string, now = Date.now()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  const diff = now - date.getTime();
  if (diff < 0) return formatDay(iso.slice(0, 10));

  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;

  const days = Math.round(hours / 24);
  if (days < 7) return days === 1 ? "Yesterday" : `${days} days ago`;

  return formatDay(iso.slice(0, 10));
}

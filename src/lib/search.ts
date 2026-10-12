export function searchPattern(raw: string | string[] | undefined): string | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return null;
  const trimmed = value.trim().slice(0, 80);
  if (!trimmed) return null;
  const safe = trimmed.replace(/[%_\\]/g, " ");
  return `%${safe}%`;
}

export function firstParam(raw: string | string[] | undefined): string {
  if (Array.isArray(raw)) return raw[0] ?? "";
  return raw ?? "";
}

export const projectFilesBucket = "project-files";

export const maxFileBytes = 10 * 1024 * 1024;

export const allowedMimeTypes = {
  "application/pdf": ["pdf"],
  "image/png": ["png"],
  "image/jpeg": ["jpg", "jpeg"],
  "image/gif": ["gif"],
  "image/webp": ["webp"],
  "text/plain": ["txt"],
  "text/csv": ["csv"],
} as const;

export type AllowedMime = keyof typeof allowedMimeTypes;

const mimeByExtension: Record<string, AllowedMime> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  txt: "text/plain",
  csv: "text/csv",
};

export const fileAccept = Object.values(allowedMimeTypes)
  .flat()
  .map((ext) => `.${ext}`)
  .join(",");

export function extensionOf(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? "";
  const dot = base.lastIndexOf(".");
  if (dot <= 0 || dot === base.length - 1) return "";
  return base.slice(dot + 1).toLowerCase();
}

export function sanitizeFileName(raw: string): string {
  const base = (raw.split(/[/\\]/).pop() ?? "file").trim();
  const cleaned = base
    .replace(/[^\w.\- ]+/g, "-")
    .replace(/[.]{2,}/g, ".")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
  return cleaned.length > 0 ? cleaned : "file";
}

export function isAllowedMime(value: string): value is AllowedMime {
  return value in allowedMimeTypes;
}

export type ResolvedUpload =
  { ok: true; name: string; mime: AllowedMime } | { ok: false; message: string };

export function resolveUpload(input: { name: string; type: string; size: number }): ResolvedUpload {
  if (input.size <= 0) return { ok: false, message: "Choose a file to upload." };
  if (input.size > maxFileBytes) {
    return { ok: false, message: "Files must be 10 MB or smaller." };
  }

  const name = sanitizeFileName(input.name);
  const ext = extensionOf(name);
  const fromExt = ext ? mimeByExtension[ext] : undefined;
  const reported = input.type.toLowerCase();
  const mime = isAllowedMime(reported)
    ? reported
    : reported === "application/octet-stream" || reported === ""
      ? fromExt
      : undefined;

  if (!mime || !fromExt || mime !== fromExt) {
    return {
      ok: false,
      message: "Use a PDF, image, text, or CSV file. The file name must match that type.",
    };
  }

  return { ok: true, name, mime };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const fileVisibilities = ["internal", "client"] as const;
export type FileVisibility = (typeof fileVisibilities)[number];

export function isFileVisibility(value: string): value is FileVisibility {
  return (fileVisibilities as readonly string[]).includes(value);
}

export function fileVisibilityLabel(value: FileVisibility): string {
  return value === "client" ? "Shared with client" : "Team only";
}

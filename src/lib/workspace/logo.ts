export const workspaceLogosBucket = "workspace-logos";

export const maxLogoBytes = 512 * 1024;

export const allowedLogoMimeTypes = {
  "image/png": ["png"],
  "image/jpeg": ["jpg", "jpeg"],
  "image/webp": ["webp"],
} as const;

export type AllowedLogoMime = keyof typeof allowedLogoMimeTypes;

export const logoAccept = ".png,.jpg,.jpeg,.webp";

export function logoStoragePath(workspaceId: string): string {
  return `${workspaceId}/logo`;
}

export function resolveLogoUpload(input: {
  name: string;
  type: string;
  size: number;
}): { ok: true; mime: AllowedLogoMime } | { ok: false; message: string } {
  if (input.size > maxLogoBytes) {
    return { ok: false, message: "Logo must be 512 KB or smaller." };
  }
  const mime = input.type as AllowedLogoMime;
  if (!(mime in allowedLogoMimeTypes)) {
    return { ok: false, message: "Use a PNG, JPEG, or WebP image. SVG is not allowed." };
  }
  return { ok: true, mime };
}

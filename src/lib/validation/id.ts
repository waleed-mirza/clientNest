import { z } from "zod";

export const uuidSchema = z.uuid();

export function parseUuid(value: string | undefined): string | null {
  const parsed = uuidSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

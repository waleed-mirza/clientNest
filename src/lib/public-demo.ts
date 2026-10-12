type PublicEnv = "NEXT_PUBLIC_DEMO_URL";

function publicUrl(name: PublicEnv): string | null {
  const value = process.env[name]?.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function publicDemoUrl(): string | null {
  return publicUrl("NEXT_PUBLIC_DEMO_URL");
}

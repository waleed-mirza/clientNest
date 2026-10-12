const publicExact = new Set(["/", "/login", "/signup", "/forgot-password", "/license"]);

export function isPublicPath(pathname: string): boolean {
  if (publicExact.has(pathname)) return true;
  return (
    pathname.startsWith("/mockups") ||
    pathname.startsWith("/docs") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/invite") ||
    pathname.startsWith("/reset-password")
  );
}

export function isAuthForm(pathname: string): boolean {
  return (
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password")
  );
}

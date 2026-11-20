export function exampleEditorHref(slug: string) {
  return `/dashboard/editor?example=${encodeURIComponent(slug)}`;
}

// Only return to this application's dashboard after authentication.
export function authReturnPath(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || /[\\\u0000-\u001f]/.test(value)) return "/dashboard";
  try {
    const url = new URL(value, "https://local.invalid");
    if (url.origin !== "https://local.invalid" || !(url.pathname === "/dashboard" || url.pathname.startsWith("/dashboard/"))) return "/dashboard";
    return url.pathname + url.search + url.hash;
  } catch { return "/dashboard"; }
}

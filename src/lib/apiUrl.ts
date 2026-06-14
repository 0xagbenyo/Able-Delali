/**
 * Prefix for client-side `fetch()` calls so they work when the app is served
 * under a non-root path (`vite.config` `base`, e.g. GitHub Pages / previews).
 */
export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const base = import.meta.env.BASE_URL ?? "/";
  if (base === "/") return normalized;
  const prefix = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${prefix}${normalized}`;
}

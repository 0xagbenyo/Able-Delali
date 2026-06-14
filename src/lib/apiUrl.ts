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

/**
 * Use after `fetch()` to `/api/*` and before `res.json()`.
 * - Throws when the response is not OK.
 * - Throws when the body is clearly HTML (e.g. SPA fallback or proxy error page).
 *
 * Does **not** require `Content-Type: application/json` so gateways that omit charset
 * or use `application/problem+json` still work.
 */
export function assertApiJsonResponse(res: Response, context = "API"): void {
  if (!res.ok) {
    throw new Error(`${context}: ${res.status} ${res.statusText}`.trim());
  }
  const ct = (res.headers.get("content-type") || "").toLowerCase();
  if (ct.includes("text/html")) {
    throw new Error(
      `${context}: server returned HTML instead of JSON — check hosting routes (e.g. /api/* before SPA fallback).`,
    );
  }
}

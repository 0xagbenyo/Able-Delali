/**
 * Public origin for resolving absolute URLs from relative image paths (e.g. blog covers).
 * Set `VITE_ERPNEXT_PUBLIC_URL` in `.env` with no trailing slash.
 */
const raw = (import.meta.env.VITE_ERPNEXT_PUBLIC_URL as string | undefined)?.trim();

export const erpnextPublicOrigin = raw ? raw.replace(/\/$/, "") : "";

/** Resolve ERP file paths and relative URLs to an absolute browser URL. */
export function resolveErpPublicUrl(imagePath: string | undefined | null): string {
  if (!imagePath) return "";
  const p = String(imagePath).trim();
  if (!p) return "";
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  if (!erpnextPublicOrigin) {
    return p.startsWith("/") ? p : `/${p}`;
  }
  return `${erpnextPublicOrigin}${p.startsWith("/") ? "" : "/"}${p}`;
}

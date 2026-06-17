/**
 * Public origin for resolving absolute URLs from relative image paths (e.g. blog covers).
 * Build-time: VITE_ERPNEXT_PUBLIC_URL. Runtime: CMS sections API public_asset_origin.
 */
const buildTimeOrigin = (
  (import.meta.env.VITE_ERPNEXT_PUBLIC_URL as string | undefined) ?? ""
).trim().replace(/\/$/, "");

let runtimeOrigin = "";

export function setErpPublicOriginFromApi(origin: string | undefined | null): void {
  const t = origin?.trim();
  if (t) runtimeOrigin = t.replace(/\/$/, "");
}

export function getErpPublicOrigin(): string {
  return runtimeOrigin || buildTimeOrigin;
}

/** Resolve ERP file paths and relative URLs to an absolute browser URL. */
export function resolveErpPublicUrl(imagePath: string | undefined | null): string {
  if (!imagePath) return "";
  const p = String(imagePath).trim();
  if (!p) return "";
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  const origin = getErpPublicOrigin();
  if (!origin) {
    return p.startsWith("/") ? p : `/${p}`;
  }
  return `${origin}${p.startsWith("/") ? "" : "/"}${p}`;
}

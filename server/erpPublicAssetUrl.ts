/**
 * Resolve ERPNext `/files/...` paths to absolute URLs for the browser.
 * Uses server env at runtime so Vercel does not depend on `VITE_ERPNEXT_PUBLIC_URL` at build time.
 */
export function getErpPublicAssetOrigin(): string {
  for (const raw of [
    process.env.ERPNEXT_PUBLIC_URL,
    process.env.VITE_ERPNEXT_PUBLIC_URL,
    process.env.ERPNEXT_API_URL,
  ]) {
    const t = raw?.trim();
    if (t) return t.replace(/\/$/, "");
  }
  return "";
}

export function resolveErpPublicAssetUrl(path: string | undefined | null): string {
  if (path == null) return "";
  const p = String(path).trim();
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;
  const origin = getErpPublicAssetOrigin();
  if (!origin) return p.startsWith("/") ? p : `/${p}`;
  return `${origin}${p.startsWith("/") ? "" : "/"}${p}`;
}

function looksLikeAssetPath(value: string): boolean {
  return (
    value.startsWith("/files/") ||
    value.startsWith("/private/files/") ||
    value.startsWith("files/") ||
    value.startsWith("private/files/")
  );
}

function resolveJsonAssetUrls(raw: string): string {
  const s = raw.trim();
  if (!s) return s;
  try {
    const j = JSON.parse(s) as unknown;
    if (Array.isArray(j)) {
      return JSON.stringify(
        j.map((item) => {
          if (typeof item === "string") return resolveErpPublicAssetUrl(item);
          if (item && typeof item === "object") {
            const row = { ...(item as Record<string, unknown>) };
            for (const [k, v] of Object.entries(row)) {
              if (typeof v === "string" && (looksLikeAssetPath(v) || /image|photo|avatar|url/i.test(k))) {
                row[k] = resolveErpPublicAssetUrl(v);
              }
            }
            return row;
          }
          return item;
        }),
      );
    }
  } catch {
    /* plain text / comma list */
  }
  return s;
}

const ASSET_FIELD_RE =
  /^(image\d*|image|photo|portrait|cover|avatar|banner|url|.*_url|slide_urls|slides_json|gallery_urls|hero_slides_json|hero_carousel_json)$/i;

/** Prefix attach / file paths in CMS flat string fields with the ERPNext public origin. */
export function resolveCmsAssetValues(values: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(values)) {
    if (!value) {
      out[key] = value;
      continue;
    }
    if (key.includes("json") || key.includes("urls") || value.trim().startsWith("[")) {
      out[key] = resolveJsonAssetUrls(value);
      continue;
    }
    if (ASSET_FIELD_RE.test(key) || looksLikeAssetPath(value)) {
      out[key] = resolveErpPublicAssetUrl(value);
      continue;
    }
    out[key] = value;
  }
  return out;
}

export function isErpNextConfigured(): boolean {
  return Boolean(
    process.env.ERPNEXT_API_URL?.trim() &&
      process.env.ERPNEXT_API_KEY?.trim() &&
      process.env.ERPNEXT_API_SECRET?.trim(),
  );
}

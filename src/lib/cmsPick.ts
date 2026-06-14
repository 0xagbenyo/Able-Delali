/**
 * Read Web Template field values from ERPNext Page Builder (`web_template_values` JSON).
 * Matches keys case-insensitively and treats spaces like underscores.
 */
export function pickCms(
  values: Record<string, string> | undefined,
  ...keyCandidates: string[]
): string | undefined {
  if (!values || typeof values !== "object") return undefined;

  const normKey = (k: string) => k.trim().toLowerCase().replace(/\s+/g, "_");
  const byNorm = new Map<string, string>();
  for (const [k, v] of Object.entries(values)) {
    if (v == null) continue;
    const s = String(v).trim();
    if (!s) continue;
    byNorm.set(normKey(k), s);
  }

  for (const key of keyCandidates) {
    const raw = values[key];
    if (raw != null && String(raw).trim()) return String(raw).trim();
    const hit = byNorm.get(normKey(key));
    if (hit) return hit;
  }
  return undefined;
}

export function splitListFromCms(raw: string | undefined, fallback: readonly string[]): string[] {
  if (!raw || !String(raw).trim()) return [...fallback];
  const s = String(raw).trim();
  if (s.startsWith("[")) {
    try {
      const j = JSON.parse(s) as unknown;
      if (Array.isArray(j)) {
        const out = j.map((x) => String(x).trim()).filter(Boolean);
        if (out.length) return out;
      }
    } catch {
      /* fall through */
    }
  }
  const parts = s
    .split(/[\n,|]+/)
    .map((x) => x.trim())
    .filter(Boolean);
  return parts.length ? parts : [...fallback];
}

/**
 * ERPNext **Outreach** Web Template: “documented work” and “context” links as **flat fields**
 * (`ext_*`, `ctx_*`) so editors do not have to edit JSON. Optional **`highlights_json`** /
 * **`press_links_json`** still work as a fallback when every slot is empty (legacy pages).
 */

export const OUTREACH_DOC_WORK_SLOT_COUNT = 6;
export const OUTREACH_CONTEXT_LINK_SLOT_COUNT = 8;

export type DocWorkHighlight = { title: string; url: string; note: string; source: string };
export type ContextPressLink = { label: string; url: string };

function parseJsonArray<T>(raw: string | undefined, guard: (row: unknown) => T | null): T[] | null {
  if (!raw?.trim()) return null;
  try {
    const j = JSON.parse(raw) as unknown;
    if (!Array.isArray(j) || j.length === 0) return null;
    const out: T[] = [];
    for (const row of j) {
      const item = guard(row);
      if (item) out.push(item);
    }
    return out.length ? out : null;
  } catch {
    return null;
  }
}

export function parseHighlightsJson(raw: string | undefined): DocWorkHighlight[] | null {
  return parseJsonArray(raw, (row) => {
    if (!row || typeof row !== "object") return null;
    const o = row as Record<string, unknown>;
    const title = String(o.title ?? "").trim();
    const url = String(o.url ?? "").trim();
    const source = String(o.source ?? "").trim();
    const note = String(o.note ?? "").trim();
    if (!title || !url) return null;
    return { title, url, source: source || "Link", note: note || "" };
  });
}

export function parsePressLinksJson(raw: string | undefined): ContextPressLink[] | null {
  return parseJsonArray(raw, (row) => {
    if (!row || typeof row !== "object") return null;
    const o = row as Record<string, unknown>;
    const label = String(o.label ?? o.title ?? "").trim();
    const url = String(o.url ?? "").trim();
    if (!label || !url) return null;
    return { label, url };
  });
}

/** Read per-slot “documented work” fields from CMS values (`ext_N_*`). */
export function readDocWorkFromSlots(pick: (field: string) => string | undefined): DocWorkHighlight[] {
  const out: DocWorkHighlight[] = [];
  for (let i = 1; i <= OUTREACH_DOC_WORK_SLOT_COUNT; i++) {
    const title = pick(`ext_${i}_title`)?.trim() ?? "";
    const url = pick(`ext_${i}_url`)?.trim() ?? "";
    if (!title || !url) continue;
    const note = pick(`ext_${i}_note`)?.trim() ?? "";
    const source = pick(`ext_${i}_source`)?.trim() || "Link";
    out.push({ title, url, note, source });
  }
  return out;
}

/** Read per-slot “context” link fields (`ctx_N_*`). */
export function readContextLinksFromSlots(pick: (field: string) => string | undefined): ContextPressLink[] {
  const out: ContextPressLink[] = [];
  for (let i = 1; i <= OUTREACH_CONTEXT_LINK_SLOT_COUNT; i++) {
    const label = pick(`ctx_${i}_label`)?.trim() ?? "";
    const url = pick(`ctx_${i}_url`)?.trim() ?? "";
    if (!label || !url) continue;
    out.push({ label, url });
  }
  return out;
}

/** Flat keys for **`web_template_values`** (ERPNext Page Builder). */
export function seedDocWorkSlots(highlights: readonly DocWorkHighlight[]): Record<string, string> {
  const o: Record<string, string> = {};
  for (let i = 1; i <= OUTREACH_DOC_WORK_SLOT_COUNT; i++) {
    const row = highlights[i - 1];
    o[`ext_${i}_title`] = row?.title ?? "";
    o[`ext_${i}_url`] = row?.url ?? "";
    o[`ext_${i}_note`] = row?.note ?? "";
    o[`ext_${i}_source`] = row?.source ?? "";
  }
  return o;
}

export function seedContextLinkSlots(links: readonly ContextPressLink[]): Record<string, string> {
  const o: Record<string, string> = {};
  for (let i = 1; i <= OUTREACH_CONTEXT_LINK_SLOT_COUNT; i++) {
    const row = links[i - 1];
    o[`ctx_${i}_label`] = row?.label ?? "";
    o[`ctx_${i}_url`] = row?.url ?? "";
  }
  return o;
}

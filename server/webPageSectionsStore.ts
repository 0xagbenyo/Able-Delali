import { getERPNextDocument, listERPNextDocuments } from "./erpnextAuth.js";

type PageBlockRow = {
  web_template?: string;
  web_template_values?: string | null | Record<string, unknown>;
};

function unwrapDoc<T extends Record<string, unknown>>(res: unknown): T {
  if (res && typeof res === "object" && "data" in res) {
    const d = (res as { data: unknown }).data;
    if (d && typeof d === "object") return d as T;
  }
  return (res as T) ?? ({} as T);
}

export type WebPageSectionRow = {
  template: string;
  key: string;
  values: Record<string, string>;
};

export function normalizeWebTemplateKey(template: string): string {
  return template.trim().toLowerCase().replace(/\s+/g, "_");
}

function parseTemplateValues(raw: unknown): Record<string, string> {
  if (raw == null) return {};
  if (typeof raw === "object" && !Array.isArray(raw)) {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      if (v == null) continue;
      if (typeof v === "string") out[k] = v;
      else if (typeof v === "number" || typeof v === "boolean") out[k] = String(v);
      else out[k] = JSON.stringify(v);
    }
    return out;
  }
  const s = String(raw).trim();
  if (!s) return {};
  try {
    const j = JSON.parse(s) as unknown;
    return parseTemplateValues(j);
  } catch {
    return {};
  }
}

function readBlocksFromDoc(doc: Record<string, unknown>): PageBlockRow[] {
  const a = doc.page_blocks;
  const b = doc.page_building_blocks;
  const c = doc.web_page_blocks;
  if (Array.isArray(a) && a.length) return a as PageBlockRow[];
  if (Array.isArray(b) && b.length) return b as PageBlockRow[];
  if (Array.isArray(c) && c.length) return c as PageBlockRow[];
  return [];
}

export type WebPageSectionsPayload = {
  ok: boolean;
  route: string;
  web_page: { name: string; title?: string; route?: string } | null;
  sections: WebPageSectionRow[];
  error?: string;
};

/**
 * Page Builder blocks for any Web Page `route` (e.g. `homepage`, `about-page`).
 */
export async function getWebPageSectionsForRoute(
  routeRaw: string,
): Promise<WebPageSectionsPayload> {
  const route = routeRaw.trim().replace(/^\//, "");
  const empty = (): WebPageSectionRow[] => [];

  try {
    const list = await listERPNextDocuments<{ name: string; route?: string }>(
      "Web Page",
      { route },
      ["name", "route", "title"],
      { limit: 1 },
    );
    const first = list.data?.[0];
    if (!first?.name) {
      return {
        ok: true,
        route,
        web_page: null,
        sections: empty(),
      };
    }

    const raw = await getERPNextDocument("Web Page", first.name);
    const doc = unwrapDoc<Record<string, unknown>>(raw);
    const blocks = readBlocksFromDoc(doc);

    const sections: WebPageSectionRow[] = [];
    for (const row of blocks) {
      const tpl = String(row.web_template || "").trim();
      if (!tpl) continue;
      sections.push({
        template: tpl,
        key: normalizeWebTemplateKey(tpl),
        values: parseTemplateValues(row.web_template_values),
      });
    }

    return {
      ok: true,
      route,
      web_page: {
        name: String(doc.name ?? first.name),
        title: doc.title != null ? String(doc.title) : undefined,
        route: doc.route != null ? String(doc.route) : undefined,
      },
      sections,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[webPageSectionsStore]", route, msg);
    return {
      ok: false,
      route,
      web_page: null,
      sections: empty(),
      error: msg,
    };
  }
}

/**
 * Shared ERPNext provisioning for the React **`/speaking-and-media`** Web Page:
 * - **Outreach** — flat **Title / URL / Note** fields for external “documented work” + **Label / URL** for context links; optional legacy JSON; aside JSON for the sidebar.
 * - **Latest Articles** — copy for the on-site journal band (heading, intro, CTA); live post list still comes from **`GET /api/blog`** in React.
 *
 * Used by **`provision-public-voice-page.ts`** and **`provision-homepage.ts`**.
 */
import {
  createERPNextDocument,
  listERPNextDocuments,
  updateERPNextDocument,
} from "../erpnextAuth.js";
import { syncWebTemplateFieldsIfNeeded } from "./webTemplateSync.js";
import {
  OUTREACH_INTRO,
  OUTREACH_HIGHLIGHTS,
  OUTREACH_PRESS_LINKS,
  LINKEDIN_NOTE,
} from "./homepageSeedData.js";
import { rhodaDelaliAgbenyo } from "../../src/content/facebookPublicThemes.ts";
import {
  OUTREACH_CONTEXT_LINK_SLOT_COUNT,
  OUTREACH_DOC_WORK_SLOT_COUNT,
  seedContextLinkSlots,
  seedDocWorkSlots,
} from "../../src/lib/outreachCmsSlots.ts";

const OUTREACH_TEMPLATE = "Outreach";
const LATEST_ARTICLES_TEMPLATE = "Latest Articles";

type FieldRow = { label: string; fieldname: string; fieldtype: string; description?: string };

/** Shown at the top of Outreach → Edit values in Desk (not rendered on the public React page). */
const OUTREACH_DESK_GUIDE = `EXTERNAL LINKS IN THIS BLOCK — Page Builder shows one row named "Outreach".

• DOCUMENTED WORK — use the numbered fields: Title, URL, Short note, Outlet/source (one card per row set). Up to ${OUTREACH_DOC_WORK_SLOT_COUNT} external pieces.

• CONTEXT — use "Context link N — Label" and "… URL" pairs (up to ${OUTREACH_CONTEXT_LINK_SLOT_COUNT} bullets).

• ASIDE JSON — Rhoda sidebar (displayName, nameNote, roleLine, summary, linkedin, links: [{title,url,note?,source?}]).

Legacy: if every documented-work slot is empty, the site can still read optional highlights_json / press_links_json from old pages.

Save the Web Page and refresh /speaking-and-media after edits.`;

function buildOutreachWebTemplateFieldRows(): FieldRow[] {
  const rows: FieldRow[] = [
    {
      label: "Editor guide (not on public site)",
      fieldname: "desk_guide",
      fieldtype: "Text",
      description:
        "Read this first. External links are edited with the numbered Title / URL / Note fields below (not JSON).",
    },
    { label: "Eyebrow", fieldname: "eyebrow", fieldtype: "Data" },
    { label: "Title line 1", fieldname: "title_line_1", fieldtype: "Data" },
    { label: "Title emphasis", fieldname: "title_emphasis", fieldtype: "Data" },
    { label: "Intro", fieldname: "description", fieldtype: "Text" },
    { label: "Documented work label", fieldname: "documented_work_label", fieldtype: "Data" },
    { label: "Context label", fieldname: "context_label", fieldtype: "Data" },
  ];

  for (let i = 1; i <= OUTREACH_DOC_WORK_SLOT_COUNT; i++) {
    rows.push(
      {
        label: `Documented work ${i} — Title`,
        fieldname: `ext_${i}_title`,
        fieldtype: "Data",
        description: "External article or page headline (shown on the card).",
      },
      {
        label: `Documented work ${i} — URL`,
        fieldname: `ext_${i}_url`,
        fieldtype: "Data",
        description: "Full https://… link.",
      },
      {
        label: `Documented work ${i} — Short note`,
        fieldname: `ext_${i}_note`,
        fieldtype: "Text",
        description: "Brief context under the title.",
      },
      {
        label: `Documented work ${i} — Outlet / source`,
        fieldname: `ext_${i}_source`,
        fieldtype: "Data",
        description: "Short label, e.g. Asaase Radio (card badge).",
      },
    );
  }

  for (let i = 1; i <= OUTREACH_CONTEXT_LINK_SLOT_COUNT; i++) {
    rows.push(
      {
        label: `Context link ${i} — Label`,
        fieldname: `ctx_${i}_label`,
        fieldtype: "Data",
        description: "Link text in the Context list.",
      },
      {
        label: `Context link ${i} — URL`,
        fieldname: `ctx_${i}_url`,
        fieldtype: "Data",
        description: "Full https://…",
      },
    );
  }

  rows.push(
    { label: "LinkedIn note", fieldname: "linkedin_note", fieldtype: "Text" },
    {
      label: "Aside JSON — sidebar profile + reference links",
      fieldname: "aside_json",
      fieldtype: "Text",
      description:
        "JSON object: displayName, nameNote, roleLine, summary, linkedin, links (array of {title,url,note?,source?}).",
    },
    {
      label: "Advanced — highlights JSON (legacy, optional)",
      fieldname: "highlights_json",
      fieldtype: "Text",
      description:
        "Only used if all documented-work title/URL slots above are empty. JSON array of {title,url,source,note}.",
    },
    {
      label: "Advanced — press links JSON (legacy, optional)",
      fieldname: "press_links_json",
      fieldtype: "Text",
      description: "Only used if all context link slots above are empty. JSON array of {label,url}.",
    },
  );

  return rows;
}

export const OUTREACH_WEB_TEMPLATE_FIELDS: FieldRow[] = buildOutreachWebTemplateFieldRows();

/** Same rows as homepage **Latest Articles** block — export for `provision-homepage.ts`. */
export const LATEST_ARTICLES_WEB_TEMPLATE_FIELDS: FieldRow[] = [
  { label: "Kicker", fieldname: "kicker", fieldtype: "Data" },
  { label: "Heading line 1", fieldname: "heading_line_1", fieldtype: "Data" },
  { label: "Heading emphasis", fieldname: "heading_emphasis", fieldtype: "Data" },
  { label: "Intro", fieldname: "description", fieldtype: "Text" },
  { label: "Overlay line 1", fieldname: "overlay_line_1", fieldtype: "Data" },
  { label: "Overlay line 2", fieldname: "overlay_line_2", fieldtype: "Data" },
  { label: "Overlay line 3", fieldname: "overlay_line_3", fieldtype: "Data" },
  { label: "Recent list heading", fieldname: "panel_label", fieldtype: "Data" },
  { label: "Journal band CTA", fieldname: "journal_cta", fieldtype: "Data" },
];

function jinjaShell(name: string): string {
  const slug = name.trim().toLowerCase().replace(/\s+/g, "_");
  return `<section class="react-home-cms" data-block="${slug}"></section>`;
}

/** Frappe usually returns `{ data: [] }`; some gateways use `message`. */
function extractListRows<T>(res: unknown): T[] {
  if (!res || typeof res !== "object") return [];
  const o = res as { data?: unknown; message?: unknown };
  if (Array.isArray(o.data)) return o.data as T[];
  if (Array.isArray(o.message)) return o.message as T[];
  return [];
}

export function getPublicVoiceWebPageRoute(): string {
  return (process.env.ERPNEXT_PUBLIC_VOICE_ROUTE || "public-voice-page").trim().replace(/^\//, "");
}

function buildAsideSeedJson(): string {
  const { displayName, nameNote, roleLine, summary, linkedin, links } = rhodaDelaliAgbenyo;
  return JSON.stringify({
    displayName,
    nameNote,
    roleLine,
    summary,
    linkedin,
    links: links.map((l) => ({ ...l })),
  });
}

/**
 * **Outreach** block `web_template_values` for Page Builder (flat `ext_*` / `ctx_*` slots + empty legacy JSON keys).
 * @param deskGuide — copy for the `desk_guide` field (use `""` on homepage if you want it blank).
 * @param includeAside — when false, `aside_json` is set to `""` (homepage embed).
 */
export function buildPublicVoiceOutreachWebTemplateValues(
  deskGuide: string,
  includeAside: boolean,
): Record<string, string> {
  return {
    eyebrow: "Outreach",
    title_line_1: "Speaking and ",
    title_emphasis: "media",
    description: OUTREACH_INTRO,
    documented_work_label: "Documented work",
    context_label: "Context",
    desk_guide: deskGuide,
    ...seedDocWorkSlots([...OUTREACH_HIGHLIGHTS]),
    ...seedContextLinkSlots([...OUTREACH_PRESS_LINKS]),
    linkedin_note: LINKEDIN_NOTE,
    highlights_json: "",
    press_links_json: "",
    aside_json: includeAside ? buildAsideSeedJson() : "",
  };
}

async function ensureWebTemplate(
  name: string,
  fields: FieldRow[],
  options: { syncTemplates: boolean },
): Promise<void> {
  const existing = await listERPNextDocuments<{ name: string }>(
    "Web Template",
    { name },
    ["name"],
    { limit: 1 },
  );
  const rows = extractListRows<{ name: string }>(existing);
  if (rows.length > 0) {
    if (options.syncTemplates) {
      await syncWebTemplateFieldsIfNeeded(name, fields);
    } else {
      console.log(`Web Template "${name}" already exists — skip create (use --sync-templates to update field list in Desk).`);
    }
    return;
  }

  await createERPNextDocument("Web Template", {
    name,
    type: "Section",
    standard: 0,
    module: "Website",
    template: jinjaShell(name),
    fields,
  });
  console.log(`Created Web Template "${name}".`);
}

async function ensurePublicVoiceTemplates(options: { syncTemplates: boolean }): Promise<void> {
  await ensureWebTemplate(OUTREACH_TEMPLATE, OUTREACH_WEB_TEMPLATE_FIELDS, options);
  await ensureWebTemplate(LATEST_ARTICLES_TEMPLATE, LATEST_ARTICLES_WEB_TEMPLATE_FIELDS, options);
}

const JOURNAL_SECTION_INTRO_ON_SPEAKING_PAGE =
  "Essays and updates published here — alongside the external outlets and context above.";

function seedOutreachBlock(): { web_template: string; web_template_values: string } {
  return {
    web_template: OUTREACH_TEMPLATE,
    web_template_values: JSON.stringify(
      buildPublicVoiceOutreachWebTemplateValues(OUTREACH_DESK_GUIDE, true),
    ),
  };
}

function seedLatestArticlesBlock(): { web_template: string; web_template_values: string } {
  return {
    web_template: LATEST_ARTICLES_TEMPLATE,
    web_template_values: JSON.stringify({
      kicker: "Journal",
      heading_line_1: "Notes from the",
      heading_emphasis: "journal",
      description: JOURNAL_SECTION_INTRO_ON_SPEAKING_PAGE,
      overlay_line_1: "Notes",
      overlay_line_2: "from the",
      overlay_line_3: "journal",
      panel_label: "From this site's journal",
      journal_cta: "Browse the full journal →",
    }),
  };
}

function publicVoicePageBlocks(): { web_template: string; web_template_values: string }[] {
  return [seedOutreachBlock(), seedLatestArticlesBlock()];
}

export type EnsurePublicVoiceWebPageOptions = {
  force: boolean;
  /**
   * When true, existing **Outreach** / **Latest Articles** **Web Template** rows are updated so Desk shows new fields (e.g. `desk_guide`).
   * `--force` only refreshes **Web Page** blocks, not the template schema.
   */
  syncTemplates?: boolean;
};

/**
 * Creates or updates the Web Page at **`ERPNEXT_PUBLIC_VOICE_ROUTE`** with **Outreach** + **Latest Articles** blocks.
 */
export async function ensurePublicVoiceWebPage(options: EnsurePublicVoiceWebPageOptions): Promise<void> {
  const { force } = options;
  const ROUTE = getPublicVoiceWebPageRoute();
  const page_blocks = publicVoicePageBlocks();

  const list = await listERPNextDocuments<{ name: string }>(
    "Web Page",
    { route: ROUTE },
    ["name", "route"],
    { limit: 1 },
  );
  const existingRows = extractListRows<{ name: string }>(list);
  const row = existingRows[0];

  if (!row?.name) {
    await createERPNextDocument("Web Page", {
      title: "Public voice / Speaking and media (React)",
      route: ROUTE,
      published: 1,
      content_type: "Page Builder",
      module: "Website",
      full_width: 1,
      show_title: 0,
      page_blocks,
    });
    console.log(
      `Created Web Page route="${ROUTE}" with ${page_blocks.length} blocks (${OUTREACH_TEMPLATE}, ${LATEST_ARTICLES_TEMPLATE}).`,
    );
    return;
  }

  if (!force) {
    console.log(
      `Web Page with route="${ROUTE}" already exists (${row.name}). Re-run with --force to replace Page Building Blocks.`,
    );
    return;
  }

  await updateERPNextDocument("Web Page", row.name, {
    content_type: "Page Builder",
    page_blocks,
  });
  console.log(
    `Updated Web Page ${row.name} (route="${ROUTE}") — ${page_blocks.length} blocks (${OUTREACH_TEMPLATE}, ${LATEST_ARTICLES_TEMPLATE}).`,
  );
}

export async function provisionPublicVoiceStack(options: EnsurePublicVoiceWebPageOptions): Promise<void> {
  const ROUTE = getPublicVoiceWebPageRoute();
  const syncTemplates = options.syncTemplates === true;
  console.log(`Public voice Web Page route: ${ROUTE}  |  force: ${options.force}  |  syncTemplates: ${syncTemplates}`);
  await ensurePublicVoiceTemplates({ syncTemplates });
  await ensurePublicVoiceWebPage(options);
  console.log("Done. Set ERPNEXT_PUBLIC_VOICE_ROUTE in .env if you changed the route.");
}

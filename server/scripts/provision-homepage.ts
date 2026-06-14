/**
 * Creates ERPNext **Web Templates** (if missing) and a **Web Page** with route
 * `ERPNEXT_HOMEPAGE_ROUTE` (default `homepage`) — Page Builder blocks matching
 * the React homepage (`HomepageCMSProvider` / `useHomepageSectionValues` keys).
 *
 * Usage (repo root, `.env` with ERPNEXT_*):
 *   npm run provision:homepage
 *   npm run provision:homepage -- --force
 *
 * Requires: ERPNEXT_API_URL, ERPNEXT_API_KEY, ERPNEXT_API_SECRET
 * Optional: ERPNEXT_HOMEPAGE_ROUTE
 */
import "dotenv/config";
import {
  createERPNextDocument,
  listERPNextDocuments,
  updateERPNextDocument,
} from "../erpnextAuth.js";
import {
  MARQUEE_CHUNKS,
  DEFAULT_ROLE_TAGS,
  DEFAULT_HERO_BIO,
  ABOUT_PARAGRAPHS,
  OUTREACH_INTRO,
  OUTREACH_HIGHLIGHTS,
  OUTREACH_PRESS_LINKS,
  LINKEDIN_NOTE,
  LATEST_ARTICLES_INTRO,
} from "./homepageSeedData.js";

const ROUTE = (process.env.ERPNEXT_HOMEPAGE_ROUTE || "homepage").trim().replace(/^\//, "");
const FORCE = process.argv.includes("--force");

type FieldRow = { label: string; fieldname: string; fieldtype: string };

const SECTION_TEMPLATE_DEFS: { name: string; fields: FieldRow[] }[] = [
  {
    name: "Cover Image",
    fields: [
      { label: "URL", fieldname: "url", fieldtype: "Data" },
      { label: "Description", fieldname: "description", fieldtype: "Text" },
    ],
  },
  {
    name: "Hero Section",
    fields: [
      { label: "Bio", fieldname: "description", fieldtype: "Text" },
      { label: "Landing tagline", fieldname: "landing_tagline", fieldtype: "Text" },
      { label: "Role tags", fieldname: "role_tags", fieldtype: "Text" },
      { label: "First name", fieldname: "name_first", fieldtype: "Data" },
      { label: "Second name", fieldname: "name_second", fieldtype: "Data" },
      { label: "Primary button text", fieldname: "button_primary_text", fieldtype: "Data" },
      { label: "Primary button path", fieldname: "button_primary_path", fieldtype: "Data" },
      { label: "Secondary button text", fieldname: "button_secondary_text", fieldtype: "Data" },
      { label: "Secondary button path", fieldname: "button_secondary_path", fieldtype: "Data" },
    ],
  },
  {
    name: "Marquee",
    fields: [{ label: "Phrases", fieldname: "description", fieldtype: "Text" }],
  },
  {
    name: "About teaser",
    fields: [
      { label: "Kicker", fieldname: "kicker", fieldtype: "Data" },
      { label: "Headline line 1", fieldname: "headline_line_1", fieldtype: "Data" },
      { label: "Headline line 2", fieldname: "headline_line_2", fieldtype: "Data" },
      { label: "Body", fieldname: "description", fieldtype: "Text" },
    ],
  },
  {
    name: "Books",
    fields: [
      { label: "Kicker", fieldname: "kicker", fieldtype: "Data" },
      { label: "Heading line 1", fieldname: "heading_line_1", fieldtype: "Data" },
      { label: "Heading emphasis", fieldname: "heading_emphasis", fieldtype: "Data" },
      { label: "Intro", fieldname: "description", fieldtype: "Text" },
    ],
  },
  {
    name: "Newsletter",
    fields: [
      { label: "Eyebrow", fieldname: "eyebrow", fieldtype: "Data" },
      { label: "Gift copy", fieldname: "description", fieldtype: "Text" },
    ],
  },
  {
    name: "Outreach",
    fields: [
      { label: "Eyebrow", fieldname: "eyebrow", fieldtype: "Data" },
      { label: "Title line 1", fieldname: "title_line_1", fieldtype: "Data" },
      { label: "Title emphasis", fieldname: "title_emphasis", fieldtype: "Data" },
      { label: "Intro", fieldname: "description", fieldtype: "Text" },
      { label: "Highlights JSON", fieldname: "highlights_json", fieldtype: "Text" },
      { label: "Press links JSON", fieldname: "press_links_json", fieldtype: "Text" },
      { label: "LinkedIn note", fieldname: "linkedin_note", fieldtype: "Text" },
    ],
  },
  {
    name: "Latest Articles",
    fields: [
      { label: "Kicker", fieldname: "kicker", fieldtype: "Data" },
      { label: "Heading line 1", fieldname: "heading_line_1", fieldtype: "Data" },
      { label: "Heading emphasis", fieldname: "heading_emphasis", fieldtype: "Data" },
      { label: "Intro", fieldname: "description", fieldtype: "Text" },
      { label: "Overlay line 1", fieldname: "overlay_line_1", fieldtype: "Data" },
      { label: "Overlay line 2", fieldname: "overlay_line_2", fieldtype: "Data" },
      { label: "Overlay line 3", fieldname: "overlay_line_3", fieldtype: "Data" },
      { label: "Recent list heading", fieldname: "panel_label", fieldtype: "Data" },
    ],
  },
];

function jinjaShell(name: string): string {
  const slug = name.trim().toLowerCase().replace(/\s+/g, "_");
  return `<section class="react-home-cms" data-block="${slug}"></section>`;
}

async function ensureWebTemplate(def: { name: string; fields: FieldRow[] }): Promise<void> {
  const existing = await listERPNextDocuments<{ name: string }>(
    "Web Template",
    { name: def.name },
    ["name"],
    { limit: 1 },
  );
  if (existing.data?.length) {
    console.log(`Web Template "${def.name}" exists — skip.`);
    return;
  }
  await createERPNextDocument("Web Template", {
    name: def.name,
    type: "Section",
    standard: 0,
    module: "Website",
    template: jinjaShell(def.name),
    fields: def.fields,
  });
  console.log(`Created Web Template "${def.name}".`);
}

function seedPageBlocks(): { web_template: string; web_template_values: string }[] {
  const marqueeDesc = [...MARQUEE_CHUNKS].join(", ");
  const aboutBody = [...ABOUT_PARAGRAPHS].join("\n\n");
  return [
    { web_template: "Cover Image", web_template_values: JSON.stringify({}) },
    {
      web_template: "Hero Section",
      web_template_values: JSON.stringify({
        description: DEFAULT_HERO_BIO,
        role_tags: [...DEFAULT_ROLE_TAGS].join(", "),
        name_first: "Able",
        name_second: "Delalie",
        button_primary_text: "About Able Delalie",
        button_primary_path: "/about",
        button_secondary_text: "Get in touch",
        button_secondary_path: "/contact",
      }),
    },
    { web_template: "Marquee", web_template_values: JSON.stringify({ description: marqueeDesc }) },
    {
      web_template: "About teaser",
      web_template_values: JSON.stringify({
        kicker: "About Able",
        headline_line_1: "A voice that",
        headline_line_2: "shifts the conversation.",
        description: aboutBody,
      }),
    },
    {
      web_template: "Books",
      web_template_values: JSON.stringify({
        kicker: "Books",
        heading_line_1: "The books that",
        heading_emphasis: "start conversations.",
        description:
          "Short reads and deeper titles — across health systems, menstrual equity, and the practice of clear advocacy.",
      }),
    },
    { web_template: "Newsletter", web_template_values: JSON.stringify({}) },
    {
      web_template: "Outreach",
      web_template_values: JSON.stringify({
        description: OUTREACH_INTRO,
        highlights_json: JSON.stringify([...OUTREACH_HIGHLIGHTS]),
        press_links_json: JSON.stringify([...OUTREACH_PRESS_LINKS]),
        linkedin_note: LINKEDIN_NOTE,
      }),
    },
    {
      web_template: "Latest Articles",
      web_template_values: JSON.stringify({
        kicker: "Journal",
        heading_line_1: "Notes from the",
        heading_emphasis: "journal",
        description: LATEST_ARTICLES_INTRO,
        panel_label: "From the journal",
      }),
    },
  ];
}

async function ensureWebPage(): Promise<void> {
  const page_blocks = seedPageBlocks();
  const list = await listERPNextDocuments<{ name: string }>(
    "Web Page",
    { route: ROUTE },
    ["name", "route"],
    { limit: 1 },
  );
  const row = list.data?.[0];

  if (!row?.name) {
    await createERPNextDocument("Web Page", {
      title: "Home (React)",
      route: ROUTE,
      published: 1,
      content_type: "Page Builder",
      module: "Website",
      full_width: 1,
      show_title: 0,
      page_blocks,
    });
    console.log(`Created Web Page route="${ROUTE}" with ${page_blocks.length} blocks.`);
    return;
  }

  if (!FORCE) {
    console.log(
      `Web Page route="${ROUTE}" already exists (${row.name}). Re-run with --force to replace Page Building Blocks.`,
    );
    return;
  }

  await updateERPNextDocument("Web Page", row.name, {
    content_type: "Page Builder",
    page_blocks,
  });
  console.log(`Updated Web Page ${row.name} — page_blocks replaced (${page_blocks.length} blocks).`);
}

async function main(): Promise<void> {
  console.log(`Homepage Web Page route: ${ROUTE}  |  force: ${FORCE}`);
  for (const def of SECTION_TEMPLATE_DEFS) {
    await ensureWebTemplate(def);
  }
  await ensureWebPage();
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

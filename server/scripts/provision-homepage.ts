/**
 * Creates ERPNext **Web Templates** (if missing) and a **Web Page** with route
 * `ERPNEXT_HOMEPAGE_ROUTE` (default `homepage`) — Page Builder blocks matching
 * the React homepage (`HomepageCMSProvider` / `useHomepageSectionValues` keys).
 *
 * Usage (repo root, `.env` with ERPNEXT_*):
 *   npm run provision:homepage
 *   npm run provision:homepage -- --force
 *   npm run provision:homepage -- --sync-templates
 *   npm run provision:homepage -- --force --sync-templates
 *
 * Requires: ERPNEXT_API_URL, ERPNEXT_API_KEY, ERPNEXT_API_SECRET
 * Optional: `ERPNEXT_HOMEPAGE_ROUTE`
 * Optional: `ERPNEXT_PUBLIC_VOICE_ROUTE` — Web Page for **`/speaking-and-media`** (default `public-voice-page`). Created when missing at the end of this script; use **`npm run provision:public-voice`** to update that page only.
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
  LATEST_ARTICLES_INTRO,
} from "./homepageSeedData.js";
import {
  getPublicVoiceWebPageRoute,
  OUTREACH_WEB_TEMPLATE_FIELDS,
  LATEST_ARTICLES_WEB_TEMPLATE_FIELDS,
  provisionPublicVoiceStack,
  buildPublicVoiceOutreachWebTemplateValues,
} from "./ensurePublicVoiceWebPage.js";
import { syncWebTemplateFieldsIfNeeded } from "./webTemplateSync.js";

const ROUTE = (process.env.ERPNEXT_HOMEPAGE_ROUTE || "homepage").trim().replace(/^\//, "");
const FORCE = process.argv.includes("--force");
const SYNC_TEMPLATES = process.argv.includes("--sync-templates");

type FieldRow = { label: string; fieldname: string; fieldtype: string; description?: string };

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
      {
        label: "Speaking / booking button text",
        fieldname: "button_speaking_text",
        fieldtype: "Data",
        description: 'Default: "Book Able to speak".',
      },
      {
        label: "Speaking / booking button path",
        fieldname: "button_speaking_path",
        fieldtype: "Data",
        description: "e.g. /contact or /speaking-and-media",
      },
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
    fields: OUTREACH_WEB_TEMPLATE_FIELDS,
  },
  {
    name: "Latest Articles",
    fields: LATEST_ARTICLES_WEB_TEMPLATE_FIELDS,
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
    if (SYNC_TEMPLATES) {
      await syncWebTemplateFieldsIfNeeded(def.name, def.fields);
    } else {
      console.log(`Web Template "${def.name}" exists — skip.`);
    }
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
        button_speaking_text: "Book Able to speak",
        button_speaking_path: "/contact",
      }),
    },
    { web_template: "Marquee", web_template_values: JSON.stringify({ description: marqueeDesc }) },
    {
      web_template: "About teaser",
      web_template_values: JSON.stringify({
        kicker: "About Able",
        headline_line_1: "Meet Able",
        headline_line_2: "the voice that shifts conversations",
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
      web_template_values: JSON.stringify(buildPublicVoiceOutreachWebTemplateValues("", false)),
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
  console.log(`Homepage Web Page route: ${ROUTE}  |  force: ${FORCE}  |  syncTemplates: ${SYNC_TEMPLATES}`);
  for (const def of SECTION_TEMPLATE_DEFS) {
    await ensureWebTemplate(def);
  }
  await ensureWebPage();

  const voiceRoute = getPublicVoiceWebPageRoute();
  try {
    await provisionPublicVoiceStack({ force: FORCE, syncTemplates: SYNC_TEMPLATES });
    console.log(
      `Public voice / speaking-and-media Web Page (route "${voiceRoute}") ${FORCE ? "updated (--force)" : "created if missing"}${SYNC_TEMPLATES ? "; Web Templates synced (--sync-templates)" : ""} for GET /api/public-voice/sections. Use \`npm run provision:public-voice\` to refresh only that page without re-seeding the full homepage.`,
    );
  } catch (e) {
    console.warn(
      "[provision:homepage] Optional: could not create/update the public voice Web Page:",
      e instanceof Error ? e.message : e,
    );
  }

  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

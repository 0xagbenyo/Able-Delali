/**
 * One-shot ERPNext setup for the React `/about` CMS slice:
 * - Ensures Web Template **About Intro** exists (Section + fields the app reads).
 * - Creates or updates (with `--force`) a **Web Page** with Content Type **Page Builder**
 *   and route `ERPNEXT_ABOUT_ROUTE` (default `about-page`).
 *
 * Usage (from repo root, with `.env` loaded):
 *   npx tsx server/scripts/provision-about-page.ts
 *   npx tsx server/scripts/provision-about-page.ts --force
 *
 * Requires: ERPNEXT_API_URL, ERPNEXT_API_KEY, ERPNEXT_API_SECRET
 * Optional: ERPNEXT_ABOUT_ROUTE
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  createERPNextDocument,
  listERPNextDocuments,
  updateERPNextDocument,
} from "../erpnextAuth.js";

const TEMPLATE_NAME = "About Intro";

const ROUTE = (process.env.ERPNEXT_ABOUT_ROUTE || "about-page").trim().replace(/^\//, "");
const FORCE = process.argv.includes("--force");

function loadDefaultDescription(): string {
  try {
    const p = join(process.cwd(), "src/content/aboutintro.json");
    const j = JSON.parse(readFileSync(p, "utf8")) as { familyIntro?: string };
    if (typeof j.familyIntro === "string" && j.familyIntro.trim()) return j.familyIntro;
  } catch {
    /* fall through */
  }
  return "Edit this block in ERPNext Web Page → Page Building Blocks.";
}

function seedTemplateValues(): Record<string, string> {
  return {
    eyebrow: "About",
    title: "Who she is",
    description: loadDefaultDescription(),
    slide_urls: "[]",
  };
}

async function ensureWebTemplate(): Promise<void> {
  const existing = await listERPNextDocuments<{ name: string }>(
    "Web Template",
    { name: TEMPLATE_NAME },
    ["name"],
    { limit: 1 },
  );
  if (existing.data?.length) {
    console.log(`Web Template "${TEMPLATE_NAME}" already exists — skipping create.`);
    return;
  }

  await createERPNextDocument("Web Template", {
    name: TEMPLATE_NAME,
    type: "Section",
    standard: 0,
    module: "Website",
    template: `<section class="about-intro-cms" data-react-cms="about_intro"></section>`,
    fields: [
      { label: "Eyebrow", fieldname: "eyebrow", fieldtype: "Data" },
      { label: "Title", fieldname: "title", fieldtype: "Data" },
      {
        label: "Description",
        fieldname: "description",
        fieldtype: "Text",
      },
      {
        label: "Slide URLs",
        fieldname: "slide_urls",
        fieldtype: "Text",
        default: "JSON array of image URLs, or one URL per line",
      },
      { label: "Image", fieldname: "image", fieldtype: "Attach Image" },
      { label: "Image2", fieldname: "image2", fieldtype: "Attach Image" },
      { label: "Image3", fieldname: "image3", fieldtype: "Attach Image" },
      { label: "Image4", fieldname: "image4", fieldtype: "Attach Image" },
      {
        label: "Hero subtitle (optional second line, italic)",
        fieldname: "hero_subtitle",
        fieldtype: "Data",
      },
      {
        label: "About section heading",
        fieldname: "about_section_heading",
        fieldtype: "Data",
        default: "About me",
      },
      { label: "Hero CTA label", fieldname: "hero_cta_label", fieldtype: "Data", default: "Read her story" },
      { label: "Service 1 title", fieldname: "service_1_title", fieldtype: "Data" },
      { label: "Service 1 text", fieldname: "service_1_text", fieldtype: "Text" },
      { label: "Service 2 title", fieldname: "service_2_title", fieldtype: "Data" },
      { label: "Service 2 text", fieldname: "service_2_text", fieldtype: "Text" },
      { label: "Service 3 title", fieldname: "service_3_title", fieldtype: "Data" },
      { label: "Service 3 text", fieldname: "service_3_text", fieldtype: "Text" },
      {
        label: "Testimonials JSON",
        fieldname: "testimonials_json",
        fieldtype: "Text",
        default:
          '[{"quote":"…","by":"…","avatar":"/files/…"}] — optional avatar = Attach path or URL. Omit for defaults.',
      },
    ],
  });
  console.log(`Created Web Template "${TEMPLATE_NAME}".`);
}

async function ensureWebPage(): Promise<void> {
  const values = seedTemplateValues();
  const block = {
    web_template: TEMPLATE_NAME,
    web_template_values: JSON.stringify(values),
  };

  const list = await listERPNextDocuments<{ name: string }>(
    "Web Page",
    { route: ROUTE },
    ["name", "route"],
    { limit: 1 },
  );
  const row = list.data?.[0];

  if (!row?.name) {
    await createERPNextDocument("Web Page", {
      title: "About (React)",
      route: ROUTE,
      published: 1,
      content_type: "Page Builder",
      module: "Website",
      full_width: 1,
      show_title: 0,
      page_blocks: [block],
    });
    console.log(`Created Web Page route="${ROUTE}" with one "${TEMPLATE_NAME}" block.`);
    return;
  }

  if (!FORCE) {
    console.log(
      `Web Page with route="${ROUTE}" already exists (${row.name}). Re-run with --force to replace Page Building Blocks.`,
    );
    return;
  }

  await updateERPNextDocument("Web Page", row.name, {
    content_type: "Page Builder",
    page_blocks: [block],
  });
  console.log(`Updated Web Page ${row.name} (route="${ROUTE}") — page_blocks replaced.`);
}

async function main(): Promise<void> {
  console.log(`Route: ${ROUTE}  |  force: ${FORCE}`);
  await ensureWebTemplate();
  await ensureWebPage();
  console.log("Done. Point the React app at this route via ERPNEXT_ABOUT_ROUTE if you changed it.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

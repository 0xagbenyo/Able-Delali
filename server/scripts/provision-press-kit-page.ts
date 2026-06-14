/**
 * Creates ERPNext **Web Template** **Press Kit** (Section + text fields + **10 Attach Image** fields)
 * and a **Web Page** with Content Type **Page Builder** at route **`ERPNEXT_PRESS_KIT_ROUTE`**
 * (default **`press-kit-page`**).
 *
 * Usage (repo root, `.env` with ERPNEXT_*):
 *   npm run provision:press-kit
 *   npm run provision:press-kit -- --force
 *
 * Requires: ERPNEXT_API_URL, ERPNEXT_API_KEY, ERPNEXT_API_SECRET
 * Optional: ERPNEXT_PRESS_KIT_ROUTE
 */
import "dotenv/config";
import {
  createERPNextDocument,
  listERPNextDocuments,
  updateERPNextDocument,
} from "../erpnextAuth.js";
import { buildPressKitErpSeedValues } from "../../src/content/pressKitCopy.ts";

const TEMPLATE_NAME = "Press Kit";

const ROUTE = (process.env.ERPNEXT_PRESS_KIT_ROUTE || "press-kit-page").trim().replace(/^\//, "");
const FORCE = process.argv.includes("--force");

function jinjaShell(): string {
  return `<section class="react-press-kit-cms" data-react-cms="press_kit"></section>`;
}

const IMAGE_FIELDS = Array.from({ length: 10 }, (_, i) => {
  const n = i + 1;
  return {
    label: `Press image ${n}`,
    fieldname: `press_image_${n}`,
    fieldtype: "Attach Image",
  };
});

async function ensureWebTemplate(): Promise<void> {
  const existing = await listERPNextDocuments<{ name: string }>(
    "Web Template",
    { name: TEMPLATE_NAME },
    ["name"],
    { limit: 1 },
  );
  if (existing.data?.length) {
    console.log(`Web Template "${TEMPLATE_NAME}" already exists — skipping create.`);
    console.log(
      "To add new fields (e.g. more images), edit the template in ERPNext Desk or delete and re-run without existing page.",
    );
    return;
  }

  await createERPNextDocument("Web Template", {
    name: TEMPLATE_NAME,
    type: "Section",
    standard: 0,
    module: "Website",
    template: jinjaShell(),
    fields: [
      { label: "Page heading", fieldname: "page_heading", fieldtype: "Data" },
      { label: "Page intro", fieldname: "page_intro", fieldtype: "Text" },
      { label: "Preferred headline", fieldname: "preferred_headline", fieldtype: "Text" },
      { label: "Short bio — usage note", fieldname: "short_bio_usage", fieldtype: "Text" },
      { label: "Short bio", fieldname: "short_bio", fieldtype: "Text" },
      { label: "Mid-length bio — usage note", fieldname: "mid_bio_usage", fieldtype: "Text" },
      { label: "Mid-length bio", fieldname: "mid_bio", fieldtype: "Text" },
      { label: "Full bio — usage note", fieldname: "full_bio_usage", fieldtype: "Text" },
      { label: "Full bio", fieldname: "full_bio", fieldtype: "Text" },
      {
        label: "Social handles JSON",
        fieldname: "social_handles_json",
        fieldtype: "Text",
        default: '[{"label":"Instagram","handle":"@handle","url":"https://…"}]',
      },
      ...IMAGE_FIELDS,
    ],
  });
  console.log(`Created Web Template "${TEMPLATE_NAME}" with ${IMAGE_FIELDS.length} image fields.`);
}

async function ensureWebPage(): Promise<void> {
  const values = buildPressKitErpSeedValues();
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
      title: "Press kit (React)",
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
  console.log(`Press kit Web Page route: ${ROUTE}  |  force: ${FORCE}`);
  await ensureWebTemplate();
  await ensureWebPage();
  console.log("Done. Set ERPNEXT_PRESS_KIT_ROUTE in .env if you changed the route.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

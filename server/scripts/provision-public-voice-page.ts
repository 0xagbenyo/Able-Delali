/**
 * Creates ERPNext **Web Page** for React **`/speaking-and-media`**: **Outreach** (full copy + aside JSON)
 * + **Latest Articles** (journal band copy). Same pattern as **`provision:press-kit`**.
 *
 * Usage (repo root, `.env` with ERPNEXT_*):
 *   npm run provision:public-voice
 *   npm run provision:public-voice -- --force
 *   npm run provision:public-voice -- --sync-templates
 *   npm run provision:public-voice -- --force --sync-templates
 *
 * **Note:** `npm run provision:homepage` also creates this page when missing (no `--force` on the voice page).
 *
 * Requires: ERPNEXT_API_URL, ERPNEXT_API_KEY, ERPNEXT_API_SECRET
 * Optional: ERPNEXT_PUBLIC_VOICE_ROUTE (default `public-voice-page`)
 */
import "dotenv/config";
import { getERPNextConfig } from "../erpnextAuth.js";
import { provisionPublicVoiceStack } from "./ensurePublicVoiceWebPage.js";

const FORCE = process.argv.includes("--force");
const SYNC_TEMPLATES = process.argv.includes("--sync-templates");

async function main(): Promise<void> {
  getERPNextConfig();
  await provisionPublicVoiceStack({ force: FORCE, syncTemplates: SYNC_TEMPLATES });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

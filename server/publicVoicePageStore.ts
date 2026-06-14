import { getWebPageSectionsForRoute } from "./webPageSectionsStore.js";

/**
 * Web Page route for the React **`/speaking-and-media`** (public voice) CMS — Page Builder,
 * typically one **Outreach** block. Default **`public-voice-page`** avoids colliding with
 * the in-app path **`/public-voice`** redirect.
 * Override with **`ERPNEXT_PUBLIC_VOICE_ROUTE`**.
 */
const PUBLIC_VOICE_ROUTE = (process.env.ERPNEXT_PUBLIC_VOICE_ROUTE || "public-voice-page")
  .trim()
  .replace(/^\//, "");

export async function getPublicVoiceSectionsFromERPNext() {
  return getWebPageSectionsForRoute(PUBLIC_VOICE_ROUTE);
}

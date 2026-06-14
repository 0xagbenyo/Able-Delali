import { getWebPageSectionsForRoute } from "./webPageSectionsStore.js";

/**
 * Web Page route for the React **`/press-kit`** CMS (Page Builder).
 * Default **`press-kit-page`** avoids colliding with a marketing route named `press-kit`.
 * Override with **`ERPNEXT_PRESS_KIT_ROUTE`**.
 */
const PRESS_KIT_ROUTE = (process.env.ERPNEXT_PRESS_KIT_ROUTE || "press-kit-page")
  .trim()
  .replace(/^\//, "");

export async function getPressKitSectionsFromERPNext() {
  return getWebPageSectionsForRoute(PRESS_KIT_ROUTE);
}

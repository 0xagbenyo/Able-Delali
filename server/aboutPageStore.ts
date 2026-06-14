import { getWebPageSectionsForRoute } from "./webPageSectionsStore.js";

/**
 * Web Page route that feeds `/about` in the React app (Page Builder).
 * Default `about-page` avoids clashing with ERPNext's stock Website "about" page.
 * Override with `ERPNEXT_ABOUT_ROUTE`.
 */
const ABOUT_ROUTE = (process.env.ERPNEXT_ABOUT_ROUTE || "about-page").trim().replace(/^\//, "");

export async function getAboutSectionsFromERPNext() {
  return getWebPageSectionsForRoute(ABOUT_ROUTE);
}

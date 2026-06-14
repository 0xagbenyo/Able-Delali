import {
  getWebPageSectionsForRoute,
  normalizeWebTemplateKey,
  type WebPageSectionRow,
} from "./webPageSectionsStore.js";

/** Public Web Page route (no leading slash). Override with `ERPNEXT_HOMEPAGE_ROUTE`. */
const HOMEPAGE_ROUTE = (process.env.ERPNEXT_HOMEPAGE_ROUTE || "homepage").trim().replace(/^\//, "");

export type HomepageSectionRow = WebPageSectionRow;

export { normalizeWebTemplateKey };

export async function getHomepageSectionsFromERPNext() {
  return getWebPageSectionsForRoute(HOMEPAGE_ROUTE);
}

import { Link } from "react-router-dom";
import PageChrome from "../components/PageChrome";
import HomeFacebookAdvocacy from "../components/HomeFacebookAdvocacy";
import { HomepageCMSProvider } from "../context/HomepageCMSProvider";

/**
 * Standalone **Public voice & press** page (same CMS as the homepage **`outreach`** section).
 * Uses `variant="page"` for roomier layout, full link lists, and a proper document heading.
 */
export default function PublicVoice() {
  return (
    <HomepageCMSProvider>
      <PageChrome className="public-voice-page">
        <nav className="public-voice-page__band" aria-label="Breadcrumb">
          <div className="ad-container public-voice-page__band-inner">
            <ol className="public-voice-page__crumbs">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li aria-current="page">Public voice</li>
            </ol>
          </div>
        </nav>
        <HomeFacebookAdvocacy fullList variant="page" />
      </PageChrome>
    </HomepageCMSProvider>
  );
}

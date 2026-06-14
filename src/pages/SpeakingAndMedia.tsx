import { Link } from "react-router-dom";
import PageChrome from "../components/PageChrome";
import HomeFacebookAdvocacy from "../components/HomeFacebookAdvocacy";
import { HomepageCMSProvider } from "../context/HomepageCMSProvider";

/**
 * **Speaking and media** — standalone page (CMS **`outreach`** from the public-voice Web Page + live **journal** list from `/api/blog`).
 * Uses `variant="page"` for roomier layout, full link lists, and a proper document heading.
 */
export default function SpeakingAndMedia() {
  return (
    <HomepageCMSProvider sectionsUrl="/api/public-voice/sections">
      <PageChrome className="speaking-media-page">
        <nav className="speaking-media-page__band" aria-label="Breadcrumb">
          <div className="ad-container speaking-media-page__band-inner">
            <ol className="speaking-media-page__crumbs">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li aria-current="page">Speaking and media</li>
            </ol>
          </div>
        </nav>
        <HomeFacebookAdvocacy fullList variant="page" />
      </PageChrome>
    </HomepageCMSProvider>
  );
}

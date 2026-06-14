import PageChrome from "../components/PageChrome";
import HomeFacebookAdvocacy from "../components/HomeFacebookAdvocacy";
import { HomepageCMSProvider } from "../context/HomepageCMSProvider";

/**
 * Standalone **Public voice & press** page (same content as the former homepage outreach band).
 * CMS copy still comes from the homepage Web Page **`outreach`** section.
 */
export default function PublicVoice() {
  return (
    <HomepageCMSProvider>
      <PageChrome>
        <HomeFacebookAdvocacy fullList />
      </PageChrome>
    </HomepageCMSProvider>
  );
}

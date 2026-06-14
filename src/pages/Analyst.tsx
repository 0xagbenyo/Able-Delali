import analystContent from "../content/analyst.json";
import { ablePortrait } from "../config/brand";
import PageChrome from "../components/PageChrome";
import FocusStoryPage from "../components/FocusStoryPage";

export default function Analyst() {
  return (
    <PageChrome>
      <FocusStoryPage
        content={analystContent}
        enquiryTopic="data-analyst"
        homeHash="expertise-data-analyst"
        imageSrc={ablePortrait}
        imageAlt="Able Delalie"
        related={[
          { label: "Leadership", path: "/pastor" },
          { label: "Writing", path: "/writing" },
        ]}
      />
    </PageChrome>
  );
}

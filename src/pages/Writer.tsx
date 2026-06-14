import writerContent from "../content/writer.json";
import { ablePortrait } from "../config/brand";
import PageChrome from "../components/PageChrome";
import FocusStoryPage from "../components/FocusStoryPage";

export default function Writer() {
  return (
    <PageChrome>
      <FocusStoryPage
        content={writerContent}
        enquiryTopic="writer"
        homeHash="expertise-writer"
        imageSrc={ablePortrait}
        imageAlt="Able Delalie"
        related={[
          { label: "Leadership", path: "/pastor" },
          { label: "Evidence & policy", path: "/data" },
        ]}
      />
    </PageChrome>
  );
}

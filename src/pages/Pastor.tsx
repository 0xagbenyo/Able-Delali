import pastorContent from "../content/pastor.json";
import { ablePortrait } from "../config/brand";
import PageChrome from "../components/PageChrome";
import FocusStoryPage from "../components/FocusStoryPage";

export default function Pastor() {
  return (
    <PageChrome>
      <FocusStoryPage
        content={pastorContent}
        enquiryTopic="pastor"
        homeHash="expertise-pastor"
        imageSrc={ablePortrait}
        imageAlt="Able Delalie"
        related={[
          { label: "Evidence & policy", path: "/data" },
          { label: "Writing", path: "/writing" },
        ]}
      />
    </PageChrome>
  );
}

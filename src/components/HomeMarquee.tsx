import { MARQUEE_CHUNKS } from "../config/homeEditorial";
import { useHomepageSectionValues } from "../context/HomepageCMSProvider";
import { pickCms } from "../lib/cmsPick";
import { splitListFromCms } from "../lib/cmsPick";

/** Infinite credential strip (editorial author-site pattern). */
export default function HomeMarquee() {
  const v = useHomepageSectionValues("marquee");
  const raw = pickCms(v, "description", "phrases", "chunks", "text", "line", "content", "words") ?? "";
  const chunks = splitListFromCms(raw ?? "", [...MARQUEE_CHUNKS]);
  const sequence = chunks.join("  ★  ") + "  ★  ";

  return (
    <div className="ed-marquee cb-ref-marquee" aria-hidden>
      <div className="ed-marquee__inner">
        <span className="ed-marquee__text">{sequence}</span>
        <span className="ed-marquee__text">{sequence}</span>
      </div>
    </div>
  );
}

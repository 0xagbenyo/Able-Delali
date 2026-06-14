import { MARQUEE_CHUNKS } from "../config/homeEditorial";

/** Infinite credential strip (editorial author-site pattern). */
export default function HomeMarquee() {
  const sequence = MARQUEE_CHUNKS.join("  ★  ") + "  ★  ";

  return (
    <div className="ed-marquee cb-ref-marquee" aria-hidden>
      <div className="ed-marquee__inner">
        <span className="ed-marquee__text">{sequence}</span>
        <span className="ed-marquee__text">{sequence}</span>
      </div>
    </div>
  );
}

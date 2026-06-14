import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import aboutContent from "../content/about.json";
import { useHomepageSectionValues } from "../context/HomepageCMSProvider";
import { pickCms } from "../lib/cmsPick";

export default function AboutTeaser() {
  const navigate = useNavigate();
  const v = useHomepageSectionValues("about_teaser");
  const sectionRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  const kicker = pickCms(v, "kicker", "eyebrow", "label") || "About Able";
  const h2Line1 = pickCms(v, "headline_line_1", "headline", "title_line_1", "heading") || "A voice that";
  const h2Muted =
    pickCms(v, "headline_line_2", "headline_muted", "subtitle", "title_line_2") ||
    "shifts the conversation.";

  const bodyRaw = pickCms(v, "description", "body", "paragraphs", "text", "copy");
  const paragraphs: string[] = bodyRaw
    ? bodyRaw
        .split(/\n\s*\n+/)
        .map((p) => p.trim().replace(/\n/g, " "))
        .filter(Boolean)
    : [...aboutContent.paragraphs];

  const ctaLabel = pickCms(v, "button_text", "cta_text", "read_more_label") || "Read the full bio";

  useEffect(() => {
    const el = sectionRef.current;
    const observer = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.08 });
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="cb-ref-about"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(12px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}
    >
      <div className="cb-ref-about__inner">
        <div className="cb-ref-about__col cb-ref-about__col--text">
          <p className="cb-ref-about__kicker">{kicker}</p>
          <h2 className="cb-ref-about__h2">
            <span className="cb-ref-about__h2-line">{h2Line1}</span>{" "}
            <span className="cb-ref-about__h2-line cb-ref-about__h2-line--muted">
              <em>{h2Muted}</em>
            </span>
          </h2>
          <div className="cb-ref-about__prose">
            {paragraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          <button
            type="button"
            className="cb-ref-btn cb-ref-btn--solid cb-ref-btn--wide"
            onClick={() => navigate("/about")}
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </section>
  );
}

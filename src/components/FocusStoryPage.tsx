import { useNavigate } from "react-router-dom";
import useResponsive from "../hooks/useResponsive";

export type FocusStoryContent = {
  hero: { title: string; subtitle: string };
  sections: { title: string; text: string }[];
  signature: string[];
  cta: string;
};

type RelatedLink = { label: string; path: string };

type Props = {
  content: FocusStoryContent;
  enquiryTopic: "pastor" | "data-analyst" | "writer";
  homeHash: string;
  imageSrc: string;
  imageAlt: string;
  related: RelatedLink[];
};

export default function FocusStoryPage({
  content,
  enquiryTopic,
  homeHash,
  imageSrc,
  imageAlt,
  related,
}: Props) {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();

  return (
    <div className="ad-container" style={{ paddingBlock: isMobile ? "28px 48px" : "40px 56px" }}>
      <article>
        <div className="ad-pillar-intro">
          <div className="ad-pillar-intro__media">
            <img src={imageSrc} alt={imageAlt} />
          </div>
          <div className="ad-pillar-intro__panel">
            <h1 className="ad-pillar-intro__title">{content.hero.title}</h1>
            <p className="ad-pillar-intro__subtitle">{content.hero.subtitle}</p>
          </div>
        </div>

        <div className="ad-prose">
          {content.sections.map((section, i) => (
            <div key={i}>
              {section.title ? <h3>{section.title}</h3> : null}
              {section.text.split("\n\n").map((para, j) => (
                <p key={j}>{para}</p>
              ))}
            </div>
          ))}

          <div style={{ marginTop: "2rem" }}>
            {content.signature.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>

          <div className="ad-prose__actions">
            <button
              type="button"
              className="ad-btn ad-btn--navy"
              onClick={() => navigate(`/contact?topic=${encodeURIComponent(enquiryTopic)}`)}
            >
              {content.cta}
            </button>
          </div>

          <div className="ad-prose__actions">
            <button
              type="button"
              className="ad-btn ad-btn--ghost"
              style={{ marginBottom: "16px", width: isMobile ? "100%" : "auto" }}
              onClick={() => navigate({ pathname: "/", hash: homeHash })}
            >
              ← Back to home
            </button>
            <p
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--ad-ink-muted)",
                margin: "0 0 14px",
              }}
            >
              Explore
            </p>
            <div className="ad-chip-row">
              {related.map((r) => (
                <button
                  key={r.path}
                  type="button"
                  className="ad-chip"
                  onClick={() => navigate(r.path)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

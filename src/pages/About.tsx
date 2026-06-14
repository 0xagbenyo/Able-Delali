import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useResponsive from "../hooks/useResponsive";
import PageChrome from "../components/PageChrome";
import aboutContent from "../content/aboutintro.json";
import { ablePortrait, rhodaImage1, rhodaImage2, patternTexture } from "../config/brand";

const SLIDE_IMAGES = [ablePortrait, rhodaImage1, rhodaImage2, patternTexture] as const;

export default function About() {
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % SLIDE_IMAGES.length);
    }, 4000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <PageChrome>
      <div className="ad-container ad-section">
        <div className="ad-pillar-intro" style={{ marginBottom: 0 }}>
          <div className="ad-pillar-intro__media" style={{ minHeight: isMobile ? 320 : undefined }}>
            {SLIDE_IMAGES.map((img, i) => (
              <img
                key={i}
                src={img}
                alt=""
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                  opacity: i === index ? 1 : 0,
                  transition: "opacity 1.2s ease",
                }}
              />
            ))}
          </div>

          <div className="ad-pillar-intro__panel">
            <p className="ad-page-head__eyebrow" style={{ marginBottom: 12 }}>
              About
            </p>
            <h1 className="ad-pillar-intro__title">Who she is</h1>

            <div className="ad-prose" style={{ maxWidth: "none", margin: "20px 0 0" }}>
              {aboutContent.familyIntro.split("\n\n").map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            <div className="ad-chip-row" style={{ marginTop: 28 }}>
              {[
                { label: "Journal", path: "/blog" },
                { label: "Books", path: "/books" },
                { label: "Contact", path: "/contact" },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="ad-chip"
                  style={isMobile ? { width: "100%", textAlign: "center" } : undefined}
                  onClick={() => navigate(item.path)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageChrome>
  );
}

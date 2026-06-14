import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import aboutContent from "../content/about.json";
import { HERO_STATS } from "../config/homeEditorial";

export default function AboutTeaser() {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

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
          <p className="cb-ref-about__kicker">About Able</p>
          <h2 className="cb-ref-about__h2">
            <span className="cb-ref-about__h2-line">A voice that</span>{" "}
            <span className="cb-ref-about__h2-line cb-ref-about__h2-line--muted">
              <em>shifts the conversation.</em>
            </span>
          </h2>
          <div className="cb-ref-about__prose">
            {aboutContent.paragraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          <button type="button" className="cb-ref-btn cb-ref-btn--solid cb-ref-btn--wide" onClick={() => navigate("/about")}>
            Read the full bio
          </button>
        </div>

        <div className="cb-ref-about__col cb-ref-about__col--stats" aria-label="Highlights">
          <div className="cb-ref-stats">
            {HERO_STATS.map((s) => (
              <div key={s.sub} className="cb-ref-stats__cell">
                <p className="cb-ref-stats__value">
                  <span className="cb-ref-stats__value-main">{s.valueMain}</span>
                  {s.valueAccent ? <span className="cb-ref-stats__value-accent">{s.valueAccent}</span> : null}
                </p>
                <p className="cb-ref-stats__sub">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

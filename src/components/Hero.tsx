import { useNavigate } from "react-router-dom";
import { ablePortrait } from "../config/brand";

const ROLE_TAGS = ["Pharmacist", "Public health", "Advocate", "Writer"] as const;

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="cb-ref-hero" aria-labelledby="cb-ref-hero-title">
      <div className="cb-ref-hero__grid">
        <div className="cb-ref-hero__copy">
          <div className="cb-ref-hero__tags" role="list">
            {ROLE_TAGS.map((tag, i) => (
              <span key={tag} className={`cb-ref-hero__tag${i === 0 ? " cb-ref-hero__tag--active" : ""}`} role="listitem">
                {tag}
              </span>
            ))}
          </div>

          <h1 id="cb-ref-hero-title" className="cb-ref-hero__title">
            <span className="cb-ref-hero__name">Able</span>
            <span className="cb-ref-hero__name cb-ref-hero__name--accent">Delalie</span>
          </h1>

          <p className="cb-ref-hero__bio">
            Pharmacist and public health voice bridging practice and policy — strengthening health systems through
            evidence, advocacy, and menstrual health equity.
          </p>

          <div className="cb-ref-hero__actions">
            <button type="button" className="cb-ref-btn cb-ref-btn--solid" onClick={() => navigate("/about")}>
              About Able Delalie
            </button>
            <button type="button" className="cb-ref-btn cb-ref-btn--ghost" onClick={() => navigate("/contact")}>
              Get in touch
            </button>
          </div>
        </div>

        <div className="cb-ref-hero__visual">
          <img src={ablePortrait} alt="Able Delalie" className="cb-ref-hero__portrait" />
        </div>
      </div>
    </section>
  );
}

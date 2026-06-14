import { useNavigate } from "react-router-dom";
import { logoSecondaryNavy } from "../config/brand";

export default function Expertise() {
  const navigate = useNavigate();

  const items = [
    {
      title: "Pharmacy & clinical depth",
      text: "Professional credibility grounded in practice — clear thinking on medicines, care pathways, and what happens at the counter and the bedside.",
      sectionId: "expertise-pastor",
      path: "/pastor",
    },
    {
      title: "Public health & policy",
      text: "Evidence-led perspectives on systems, accountability, and decisions that shape population health — substance over noise.",
      sectionId: "expertise-data-analyst",
      path: "/data",
    },
    {
      title: "Menstrual health equity",
      text: "Advocacy and narrative that centre dignity, access, and informed conversation — building trust and long-term impact.",
      sectionId: "expertise-writer",
      path: "/writing",
    },
  ] as const;

  return (
    <section id="expertise" className="ed-section ed-section--muted">
      <div className="ed-section__inner">
        <p className="ed-kicker">Focus</p>
        <h2 className="ed-h2">
          Where practice <em>meets policy</em>
        </h2>
        <p className="ed-prose" style={{ marginBottom: "2rem" }}>
          Three lenses on one mission: equitable health systems informed by evidence, integrity, and care.
        </p>

        <div className="ed-cards">
          {items.map((item) => (
            <button
              type="button"
              key={item.title}
              id={item.sectionId}
              className="ed-card"
              onClick={() => navigate(item.path)}
            >
              <img src={logoSecondaryNavy} alt="" width={40} height={40} style={{ marginBottom: 12 }} />
              <h3 className="ed-card__title">{item.title}</h3>
              <p className="ed-card__text">{item.text}</p>
              <span className="ed-card__more">Explore →</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

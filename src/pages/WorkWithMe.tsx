import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import PageChrome from "../components/PageChrome";

const SECTIONS = [
  {
    id: "speaking-engagements",
    title: "Speaking engagements",
    body: "Invite Able for keynotes, panels, and workshops at conferences, universities, hospitals, and community events. She brings clinical credibility, policy fluency, and a grounded voice on public health, pharmacy practice, and menstrual health equity.",
  },
  {
    id: "media-interviews",
    title: "Media interviews",
    body: "Request broadcast, print, or digital commentary on pharmacy, public health, health systems, and policy. She aims for clarity, accuracy, and language that respects audiences who are not specialists.",
  },
  {
    id: "advisory-policy",
    title: "Advisory and policy consultations",
    body: "Engage Able for evidence-informed guidance on programs, advocacy strategy, and policy conversations where practice and population health meet. Scope and format are agreed upfront so work stays focused and useful.",
  },
  {
    id: "writing-publications",
    title: "Writing and publications",
    body: "Collaborate on essays, op-eds, long-form pieces, and editorial projects that need a pharmacist’s lens and a public-health conscience—from pitch to publication, where timelines and fit align.",
  },
  {
    id: "partnerships-collaborations",
    title: "Partnerships and collaborations",
    body: "Explore joint work on campaigns, research, education, and advocacy initiatives. The best partnerships share a clear goal, mutual respect, and room for honest counsel when trade-offs appear.",
  },
] as const;

export default function WorkWithMe() {
  const location = useLocation();

  useEffect(() => {
    const id = location.hash.replace(/^#/, "").trim();
    if (!id) return;
    const t = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => window.clearTimeout(t);
  }, [location.hash, location.pathname]);

  return (
    <PageChrome>
      <header className="ad-page-head">
        <div className="ad-container">
          <p className="ad-page-head__eyebrow">Engagement</p>
          <h1 className="ad-page-head__title">Work with me</h1>
          <p className="ad-page-head__lead">
            Here is how to engage — speaking, media, advisory work, writing, and partnerships. Share a short note on
            the contact page with your context, audience, and timing; you will get a thoughtful reply.
          </p>
        </div>
      </header>

      <div className="ad-section ad-section--muted">
        <div className="ad-container ad-work-with-stack">
          {SECTIONS.map((s) => (
            <article key={s.id} id={s.id} className="ad-work-with-block">
              <h2 className="ad-work-with-block__title">{s.title}</h2>
              <p className="ad-work-with-block__body">{s.body}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="ad-section">
        <div className="ad-container ad-work-with-cta">
          <p className="ad-work-with-cta__lead">Ready to start a conversation?</p>
          <Link to="/contact" className="ad-btn ad-btn--primary">
            Get in touch
          </Link>
        </div>
      </div>
    </PageChrome>
  );
}

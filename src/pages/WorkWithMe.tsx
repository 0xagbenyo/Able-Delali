import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import PageChrome from "../components/PageChrome";
import { SITE_CONTACT_EMAIL, SITE_CONTACT_MAILTO } from "../config/siteContact";
import { ablePortrait, patternTexture, rhodaImage1, rhodaImage2 } from "../config/brand";
import "../ui/work-with-me.css";

const INTRO =
  "I collaborate with organisations, institutions, healthcare professionals, and media to improve health outcomes through evidence-based communication, public health leadership, and policy engagement. Whether you're looking for a speaker, facilitator, advisor, or collaborator, I'd love to explore how we can work together.";

const SPEAKING_EXAMPLES = [
  "Conferences",
  "Panel discussions",
  "Universities",
  "Professional associations",
  "Corporate wellness events",
  "Community programmes",
];

const SPEAKING_TOPICS = [
  "Medication safety",
  "Public health",
  "Health systems",
  "Menstrual health",
  "Women's health",
  "Rational medicine use",
  "Antimicrobial resistance",
  "Leadership in pharmacy",
  "Health policy",
];

const WORKSHOP_EXAMPLES = [
  "Healthcare worker training",
  "Public education sessions",
  "Medication safety workshops",
  "School programmes",
  "Pharmacy education",
  "Menstrual health education",
];

const POLICY_EXAMPLES = [
  "Technical advisory",
  "Policy reviews",
  "Health programme design",
  "Stakeholder engagement",
  "Strategy discussions",
  "Public health projects",
];

const MEDIA_EXAMPLES = [
  "Opinion pieces",
  "Feature articles",
  "Interviews",
  "Podcasts",
  "Television",
  "Radio",
  "Expert commentary",
];

const PARTNER_EXAMPLES = [
  "NGOs",
  "Foundations",
  "Government",
  "Development partners",
  "Universities",
  "Health startups",
  "Professional associations",
];

const PARTNER_FOCUS = [
  "Health equity",
  "Public health",
  "Menstrual health",
  "Medicine safety",
];

const FOCUS_CARDS = [
  { title: "Health policy", body: "Evidence-informed framing, briefings, and dialogue where policy meets practice." },
  { title: "Public health", body: "Population-level thinking with attention to implementation and equity." },
  { title: "Pharmacy practice", body: "Clinical credibility and systems perspective for professional audiences." },
  { title: "Menstrual health equity", body: "A core through-line — stigma reduction, access, and dignity in care." },
];

const PREVIOUS_WORK = [
  "Organisations worked with",
  "Conferences",
  "Publications",
  "Campaigns",
  "Projects",
];

const FAQ = [
  {
    q: "Do you travel?",
    a: "Yes — for the right brief and timeline. Share your location, dates, and format when you get in touch.",
  },
  {
    q: "Do you offer virtual sessions?",
    a: "Yes. Keynotes, panels, workshops, and advisory conversations can often be delivered remotely when that suits your programme.",
  },
  {
    q: "Can sessions be customised?",
    a: "Absolutely. Agendas, depth, and tone are shaped around your audience — clinical, public, policy, or mixed.",
  },
  {
    q: "How far in advance should we book?",
    a: "Earlier is easier for calendars and preparation. As a guide, many hosts begin 2–4 months ahead for larger events; shorter windows can work for media or advisory calls.",
  },
  {
    q: "What topics do you cover?",
    a: "See the topic lists under speaking and workshops, and the focus cards below. If your theme is adjacent, ask — if it is not the right fit, I will say so clearly.",
  },
];

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
      <div className="ad-work-page">
        <header className="ad-work-page__hero">
          <div
            className="ad-work-page__hero-pattern"
            style={{ backgroundImage: `url(${patternTexture})` }}
            aria-hidden
          />
          <div className="ad-container ad-work-page__hero-grid">
            <div className="ad-work-page__hero-copy">
              <p className="ad-work-page__hero-eyebrow">Collaboration</p>
              <h1 className="ad-work-page__hero-title">Let&apos;s work together</h1>
              <p className="ad-work-page__hero-lead">{INTRO}</p>
            </div>
            <div className="ad-work-page__hero-visual">
              <img src={ablePortrait} alt="Able Delalie" width={640} height={800} decoding="async" />
            </div>
          </div>
        </header>

        <section id="live-engagement" className="ad-section ad-section--muted ad-work-page__section">
          <div className="ad-container">
            <div className="ad-work-page__section-intro">
              <h2 className="ad-work-page__h2">Speaking &amp; learning formats</h2>
              <p className="ad-work-page__deck">
                From keynote stages to hands-on training — two ways organisations most often start a relationship.
              </p>
            </div>

            <div className="ad-work-page__grid2">
              <article id="speaking" className="ad-work-page__card">
                <div className="ad-work-page__card-media">
                  <img src={rhodaImage1} alt="" loading="lazy" decoding="async" />
                </div>
                <div className="ad-work-page__card-body">
                  <p className="ad-work-page__card-kicker">First offering</p>
                  <h3 className="ad-work-page__h3">Speaking engagements</h3>
                  <p className="ad-work-page__card-lead">
                    Conferences, panels, campuses, associations, workplaces, and community programmes — with depth on
                    the topics below.
                  </p>
                  <p className="ad-work-page__list-label">Formats</p>
                  <ul className="ad-work-page__list">
                    {SPEAKING_EXAMPLES.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <p className="ad-work-page__list-label">Possible topics</p>
                  <ul className="ad-work-page__list">
                    {SPEAKING_TOPICS.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <div className="ad-work-page__card-actions">
                    <Link to="/contact?topic=speaking" className="ad-btn ad-btn--primary">
                      Invite me to speak
                    </Link>
                  </div>
                </div>
              </article>

              <article id="workshops" className="ad-work-page__card">
                <div className="ad-work-page__card-media">
                  <img src={rhodaImage2} alt="" loading="lazy" decoding="async" />
                </div>
                <div className="ad-work-page__card-body">
                  <h3 className="ad-work-page__h3">Workshops &amp; training</h3>
                  <p className="ad-work-page__card-lead">
                    Structured sessions for teams and public audiences — practical, evidence-grounded, and tailored to
                    your setting.
                  </p>
                  <p className="ad-work-page__list-label">For example</p>
                  <ul className="ad-work-page__list">
                    {WORKSHOP_EXAMPLES.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <div className="ad-work-page__card-actions">
                    <Link to="/contact?topic=workshops" className="ad-btn ad-btn--ghost">
                      Discuss a training
                    </Link>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="strategy-partnerships" className="ad-section ad-work-page__section">
          <div className="ad-container">
            <div className="ad-work-page__section-intro">
              <h2 className="ad-work-page__h2">Policy, communications &amp; partnerships</h2>
              <p className="ad-work-page__deck">
                Advisory depth, trusted commentary, and alliances that move work forward — often where organisations
                need a pharmacist–public health lens.
              </p>
            </div>

            <div className="ad-work-page__grid3">
              <article id="policy-advisory" className="ad-work-page__card ad-work-page__card--compact">
                <div className="ad-work-page__card-media">
                  <img src={patternTexture} alt="" loading="lazy" decoding="async" />
                </div>
                <div className="ad-work-page__card-body">
                  <h3 className="ad-work-page__h3">Policy &amp; advisory</h3>
                  <p className="ad-work-page__card-lead">
                    Technical and strategic support where programmes, policy, and stakeholders meet.
                  </p>
                  <ul className="ad-work-page__list">
                    {POLICY_EXAMPLES.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <div className="ad-work-page__card-actions">
                    <Link to="/contact?topic=policy-advisory" className="ad-btn ad-btn--navy">
                      Start a conversation
                    </Link>
                  </div>
                </div>
              </article>

              <article id="writing-media" className="ad-work-page__card ad-work-page__card--compact">
                <div className="ad-work-page__card-media">
                  <img src={ablePortrait} alt="" loading="lazy" decoding="async" />
                </div>
                <div className="ad-work-page__card-body">
                  <h3 className="ad-work-page__h3">Writing &amp; media</h3>
                  <p className="ad-work-page__card-lead">
                    Clear, accurate commentary for audiences who are not specialists — and editorial collaboration when
                    the fit is right.
                  </p>
                  <ul className="ad-work-page__list">
                    {MEDIA_EXAMPLES.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <div className="ad-work-page__card-actions">
                    <Link to="/contact?topic=media" className="ad-btn ad-btn--ghost">
                      Media enquiries
                    </Link>
                  </div>
                </div>
              </article>

              <article id="partnerships" className="ad-work-page__card ad-work-page__card--compact">
                <div className="ad-work-page__card-media">
                  <img src={rhodaImage2} alt="" loading="lazy" decoding="async" />
                </div>
                <div className="ad-work-page__card-body">
                  <h3 className="ad-work-page__h3">Partnerships</h3>
                  <p className="ad-work-page__card-lead">
                    Joint work with organisations that share rigour and respect for communities served.
                  </p>
                  <p className="ad-work-page__list-label">Examples</p>
                  <ul className="ad-work-page__list">
                    {PARTNER_EXAMPLES.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <p className="ad-work-page__list-label">Often focused on</p>
                  <ul className="ad-work-page__list">
                    {PARTNER_FOCUS.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <div className="ad-work-page__card-actions">
                    <Link to="/contact?topic=partnerships" className="ad-btn ad-btn--ghost">
                      Explore a partnership
                    </Link>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="focus-proof" className="ad-section ad-section--muted ad-work-page__section">
          <div className="ad-container">
            <div className="ad-work-page__section-intro">
              <h2 className="ad-work-page__h2">Current focus areas</h2>
              <p className="ad-work-page__deck">
                A quick read for organisations deciding whether the fit is right — before we ever open a diary.
              </p>
            </div>

            <div className="ad-work-page__focus-grid">
              {FOCUS_CARDS.map((c) => (
                <article key={c.title} className="ad-work-page__focus-card">
                  <h3 className="ad-work-page__focus-title">{c.title}</h3>
                  <p className="ad-work-page__focus-body">{c.body}</p>
                </article>
              ))}
            </div>

            <div className="ad-work-page__proof">
              <h3 className="ad-work-page__h3 ad-work-page__h3--sub">Previous work</h3>
              <p className="ad-work-page__proof-lead">
                A growing record of organisations, conferences, publications, campaigns, and projects — with room here
                for logos and highlights as they are curated.
              </p>
              <ul className="ad-work-page__list ad-work-page__list--inline">
                {PREVIOUS_WORK.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="ad-work-page__logo-strip" aria-hidden="true">
                {["One", "Two", "Three", "Four", "Five"].map((label) => (
                  <div key={label} className="ad-work-page__logo-placeholder">
                    <span>{label}</span>
                  </div>
                ))}
              </div>
              <p className="ad-work-page__proof-note">Even a handful of trusted logos builds enormous credibility.</p>
            </div>
          </div>
        </section>

        <section id="faq" className="ad-section ad-work-page__section">
          <div className="ad-container ad-work-page__faq-wrap">
            <div className="ad-work-page__section-intro">
              <h2 className="ad-work-page__h2">Frequently asked questions</h2>
              <p className="ad-work-page__deck">
                Practical answers — if yours is not listed, ask on the contact form.
              </p>
            </div>
            <div className="ad-work-page__faq">
              {FAQ.map((item) => (
                <details key={item.q} className="ad-work-page__details">
                  <summary className="ad-work-page__summary">{item.q}</summary>
                  <p className="ad-work-page__answer">{item.a}</p>
                </details>
              ))}
            </div>

            <div className="ad-work-page__final">
              <h2 className="ad-work-page__h2 ad-work-page__h2--center">Have a project, event, or idea in mind?</h2>
              <p className="ad-work-page__final-lead">
                I&apos;d love to hear how we can work together to advance healthier communities and stronger health
                systems.
              </p>
              <Link to="/contact?topic=general" className="ad-btn ad-btn--primary">
                Get in touch
              </Link>
              <p className="ad-work-page__final-email">
                Or email{" "}
                <a href={SITE_CONTACT_MAILTO}>{SITE_CONTACT_EMAIL}</a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </PageChrome>
  );
}

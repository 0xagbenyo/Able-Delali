import { Link } from "react-router-dom";
import { HOME_SPEAKING_YOUTUBE_EMBED_ID } from "../config/homeMedia";
import { socialLinks } from "../config/social";

type SpeakingPillar =
  | { id: string; label: string; sub: string; to: string }
  | { label: string; sub: string; to: string };

const PILLARS: readonly SpeakingPillar[] = [
  { id: "expertise-pastor", label: "Keynotes", sub: "Named talks to book", to: "/pastor" },
  { label: "Awards & hosting", sub: "Events & ceremonies", to: "/contact" },
  { id: "expertise-data-analyst", label: "Workshops & panels", sub: "Deeper formats", to: "/data" },
  { id: "expertise-writer", label: "Topics & FAQs", sub: "What Able speaks on", to: "/writing" },
];

const fb = socialLinks.find((s) => s.label === "Facebook");

export default function HomeSpeaking() {
  const embedId = HOME_SPEAKING_YOUTUBE_EMBED_ID.trim();

  return (
    <section className="cb-ref-speaking" id="speaking">
      <div className="cb-ref-speaking__inner">
        <div className="cb-ref-speaking__content">
          <p className="cb-ref-speaking__kicker">Speaking</p>
          <h2 className="cb-ref-speaking__h2">
            <span className="cb-ref-speaking__h2-sans">Talks that</span>{" "}
            <span className="cb-ref-speaking__h2-serif">
              <em>move people.</em>
            </span>
          </h2>
          <p className="cb-ref-speaking__lead">
            Keynotes, hosting, workshops, and panels — bringing clinical depth, policy clarity, and menstrual health
            equity into the room.
          </p>
          <div className="cb-ref-speaking__grid">
            {PILLARS.map((item) => (
              <Link
                key={`${item.label}-${item.to}`}
                to={item.to}
                className="cb-ref-speaking__card"
                {...("id" in item ? { id: item.id } : {})}
              >
                <span className="cb-ref-speaking__card-title">{item.label}</span>
                <span className="cb-ref-speaking__card-sub">{item.sub}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="cb-ref-speaking__media">
          {embedId ? (
            <div className="cb-ref-speaking__iframe-wrap">
              <iframe
                title="Able Delalie — featured talk"
                src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(embedId)}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          ) : (
            <div className="cb-ref-speaking__placeholder">
              <p>Add a video</p>
              <p className="cb-ref-speaking__placeholder-hint">
                Set <code>VITE_HOME_SPEAKING_YOUTUBE_EMBED_ID</code> in your <code>.env</code> to embed a talk here.
              </p>
              {fb ? (
                <a className="cb-ref-btn cb-ref-btn--outline-dark" href={fb.link} target="_blank" rel="noopener noreferrer">
                  Watch on Facebook →
                </a>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useHomepageSectionValues } from "../context/HomepageCMSProvider";
import { pickCms } from "../lib/cmsPick";

type BlogPostApi = {
  name: string;
  title: string;
  published_on?: string;
};

function formatDate(dateString?: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const DEFAULT_LEDE =
  "Long-form notes, advocacy reflections, and the conversations that do not always fit elsewhere — plus a free resource when you join the list.";

export default function HomeInsights() {
  const v = useHomepageSectionValues("home_insights");
  const [lines, setLines] = useState<{ slug: string; title: string; date: string }[]>([]);

  const eyebrow = pickCms(v, "eyebrow", "kicker") || "Newsletter & notes";
  const hLead = pickCms(v, "heading_line_1", "heading") || "Writing on";
  const hEm =
    pickCms(v, "heading_emphasis", "heading_line_2") || "health, equity, and the work in between";
  const lede = pickCms(v, "description", "lede", "intro", "body", "text") || DEFAULT_LEDE;
  const browseLabel = pickCms(v, "browse_journal_label") || "Browse the journal";
  const joinLabel = pickCms(v, "join_list_label") || "Join the list — free resource";
  const credit = pickCms(v, "credit", "byline") || "Journal & newsletter by Able Delalie";
  const panelLabel = pickCms(v, "panel_label", "list_heading") || "From the journal";
  const emptyBlurb =
    pickCms(v, "empty_list_message") || "New posts land in the journal first.";
  const archiveLink = pickCms(v, "archive_link_label") || "Browse the archive";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/blog");
        const data = await res.json();
        const raw: BlogPostApi[] = Array.isArray(data.posts) ? data.posts : [];
        const three = raw.slice(0, 3).map((p) => ({
          slug: p.name,
          title: p.title || p.name,
          date: formatDate(p.published_on) || "Recent",
        }));
        if (!cancelled) setLines(three);
      } catch {
        if (!cancelled) setLines([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="jour-band" id="insights" aria-labelledby="jour-band-heading">
      <div className="jour-band__inner">
        <div className="jour-band__grid">
          <header className="jour-band__intro">
            <p className="jour-band__eyebrow">{eyebrow}</p>
            <h2 id="jour-band-heading" className="jour-band__title">
              {hLead} <em>{hEm}</em>
            </h2>
            <p className="jour-band__lede">{lede}</p>
            <nav className="jour-band__nav" aria-label="Journal and newsletter">
              <Link className="jour-band__link" to="/blog">
                {browseLabel}
              </Link>
              <span className="jour-band__sep" aria-hidden>
                ·
              </span>
              <a className="jour-band__link" href="#newsletter">
                {joinLabel}
              </a>
            </nav>
            <p className="jour-band__credit">{credit}</p>
          </header>

          <div className="jour-band__panel">
            <h3 className="jour-band__panel-label">{panelLabel}</h3>
            {lines.length > 0 ? (
              <ul className="jour-band__list">
                {lines.map((row) => (
                  <li key={row.slug}>
                    <Link to={`/blog/${row.slug}`} className="jour-band__row">
                      <span className="jour-band__row-title">{row.title}</span>
                      <span className="jour-band__row-date">{row.date}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="jour-band__empty">
                {emptyBlurb}{" "}
                <Link className="jour-band__inline" to="/blog">
                  {archiveLink}
                </Link>
                .
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

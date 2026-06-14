import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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

export default function HomeInsights() {
  const [lines, setLines] = useState<{ slug: string; title: string; date: string }[]>([]);

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
            <p className="jour-band__eyebrow">Newsletter &amp; notes</p>
            <h2 id="jour-band-heading" className="jour-band__title">
              Writing on <em>health, equity, and the work in between</em>
            </h2>
            <p className="jour-band__lede">
              Long-form notes, advocacy reflections, and the conversations that do not always fit elsewhere — plus a
              free resource when you join the list.
            </p>
            <nav className="jour-band__nav" aria-label="Journal and newsletter">
              <Link className="jour-band__link" to="/blog">
                Browse the journal
              </Link>
              <span className="jour-band__sep" aria-hidden>
                ·
              </span>
              <a className="jour-band__link" href="#newsletter">
                Join the list — free resource
              </a>
            </nav>
            <p className="jour-band__credit">Journal &amp; newsletter by Able Delalie</p>
          </header>

          <div className="jour-band__panel">
            <h3 className="jour-band__panel-label">From the journal</h3>
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
                New posts land in the journal first.{" "}
                <Link className="jour-band__inline" to="/blog">
                  Browse the archive
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

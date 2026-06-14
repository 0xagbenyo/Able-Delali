import { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { resolveErpPublicUrl } from "../config/erpnextPublic";
import { socialLinks } from "../config/social";
import { useHomepageSectionValues } from "../context/HomepageCMSProvider";
import { pickCms } from "../lib/cmsPick";
import { apiUrl, assertApiJsonResponse } from "../lib/apiUrl";

type BlogPostApi = {
  name: string;
  title: string;
  blog_category?: string;
  published_on?: string;
  blog_intro?: string;
  meta_image?: string;
};

type LeadPost = {
  slug: string;
  title: string;
  image: string;
};

type RecentRow = {
  slug: string;
  title: string;
  date: string;
  imageUrl: string;
};

const DEFAULT_INTRO =
  "The place where essays go a little deeper — practice, policy, faith, and menstrual health equity. New pieces land here first.";

const RECENT_POSTS_COUNT = 4;

function formatDate(dateString?: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function LatestArticles() {
  const v = useHomepageSectionValues("latest_articles");
  const [posts, setPosts] = useState<LeadPost[]>([]);
  const [recentRows, setRecentRows] = useState<RecentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const kicker = pickCms(v, "kicker", "eyebrow") || "Journal";
  const hLead = pickCms(v, "heading_line_1", "heading") || "Notes from the";
  const hEm = pickCms(v, "heading_emphasis", "heading_line_2") || "journal";
  const intro = pickCms(v, "description", "intro", "body", "text", "lede") || DEFAULT_INTRO;
  const ctaLabel = pickCms(v, "journal_cta", "button_text", "cta_label") || "Visit the journal page";
  const overlay1 = pickCms(v, "overlay_line_1") || "Notes";
  const overlay2 = pickCms(v, "overlay_line_2") || "from the";
  const overlay3 = pickCms(v, "overlay_line_3") || "journal";
  const panelLabel = pickCms(v, "panel_label", "list_heading", "recent_heading") || "From the journal";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const blogRes = await fetch(apiUrl("/api/blog"));
        assertApiJsonResponse(blogRes, "Journal (home)");
        const blogData = (await blogRes.json()) as { posts?: BlogPostApi[] };
        const raw: BlogPostApi[] = Array.isArray(blogData.posts) ? blogData.posts : [];
        const lead = raw.slice(0, 1).map((p) => {
          const img = resolveErpPublicUrl(p.meta_image || "");
          return {
            slug: p.name,
            title: p.title || p.name,
            image: img || "",
          };
        });
        const recent = raw.slice(0, RECENT_POSTS_COUNT).map((p) => ({
          slug: p.name,
          title: p.title || p.name,
          date: formatDate(p.published_on) || "Recent",
          imageUrl: resolveErpPublicUrl(p.meta_image || "") || "",
        }));
        if (!cancelled) {
          setPosts(lead);
          setRecentRows(recent);
        }
      } catch (error) {
        console.error("Failed to fetch blog posts:", error);
        if (!cancelled) {
          setPosts([]);
          setRecentRows([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const leadPost = posts[0];
  const leadLetter = leadPost?.title?.slice(0, 1)?.toUpperCase() ?? "J";

  const postPath = leadPost?.slug ? `/blog/${encodeURIComponent(leadPost.slug)}` : "/blog";
  const figureAria = leadPost ? `Read: ${leadPost.title}` : "Visit the journal";

  const figureInner = (
    <>
      {leadPost?.image ? (
        <img src={leadPost.image} alt="" />
      ) : (
        <div className="cb-ref-journal__placeholder">{leadLetter}</div>
      )}
      <div className="cb-ref-journal__overlay" aria-hidden>
        <span className="cb-ref-journal__overlay-line">{overlay1}</span>
        <span className="cb-ref-journal__overlay-line cb-ref-journal__overlay-line--accent">
          {overlay2}
        </span>
        <span className="cb-ref-journal__overlay-line">{overlay3}</span>
      </div>
    </>
  );

  const figure = (
    <figure className="cb-ref-journal__figure">
      {figureInner}
    </figure>
  );

  const visual = (
    <Link className="cb-ref-journal__figure-link" to={postPath} aria-label={figureAria}>
      {figure}
    </Link>
  );

  return (
    <section className="cb-ref-journal" id="podcast">
      <div className="cb-ref-journal__inner">
        <div className="cb-ref-journal__split">
          <div className="cb-ref-journal__visual-wrap">{visual}</div>

          <div className="cb-ref-journal__copy">
            <p className="cb-ref-journal__kicker">{kicker}</p>
            <h2 className="cb-ref-journal__h2">
              {hLead} <em>{hEm}</em>
            </h2>
            <p className="cb-ref-journal__intro">{intro}</p>
            <div className="cb-ref-journal__platforms" aria-label="Where to follow">
              <Link to="/blog">Journal</Link>
              {socialLinks.map((s) => (
                <Fragment key={s.label}>
                  <span className="cb-ref-journal__pipe" aria-hidden />
                  <a href={s.link} target="_blank" rel="noopener noreferrer">
                    {s.label}
                  </a>
                </Fragment>
              ))}
            </div>
            {loading ? (
              <p className="cb-ref-journal__status">Loading…</p>
            ) : (
              <Link to="/blog" className="cb-ref-btn cb-ref-btn--solid cb-ref-btn--journal">
                {ctaLabel}
              </Link>
            )}
          </div>
        </div>

        <div className="cb-ref-journal__recent">
          <h3 className="cb-ref-journal__recent-heading">{panelLabel}</h3>
          {loading ? (
            <p className="cb-ref-journal__recent-status">Loading…</p>
          ) : recentRows.length === 0 ? (
            <p className="cb-ref-journal__recent-empty">
              Nothing here yet.{" "}
              <Link className="cb-ref-journal__recent-inline" to="/blog">
                Open the journal
              </Link>
              .
            </p>
          ) : (
            <ul className="cb-ref-journal__recent-list">
              {recentRows.map((row) => {
                const letter = row.title?.trim().slice(0, 1).toUpperCase() || "·";
                return (
                  <li key={row.slug}>
                    <Link to={`/blog/${encodeURIComponent(row.slug)}`} className="cb-ref-journal__recent-row">
                      <div className="cb-ref-journal__recent-thumb" aria-hidden>
                        {row.imageUrl ? (
                          <img src={row.imageUrl} alt="" />
                        ) : (
                          <span className="cb-ref-journal__recent-thumb-letter">{letter}</span>
                        )}
                      </div>
                      <span className="cb-ref-journal__recent-title">{row.title}</span>
                      <span className="cb-ref-journal__recent-date">{row.date}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

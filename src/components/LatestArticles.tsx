import { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { resolveErpPublicUrl } from "../config/erpnextPublic";
import { socialLinks } from "../config/social";
import { useHomepageSectionValues } from "../context/HomepageCMSProvider";
import { pickCms } from "../lib/cmsPick";

type BlogPostApi = {
  name: string;
  title: string;
  blog_category?: string;
  published_on?: string;
  blog_intro?: string;
  meta_image?: string;
};

type LeadPost = {
  title: string;
  image: string;
};

const DEFAULT_INTRO =
  "The place where essays go a little deeper — practice, policy, faith, and menstrual health equity. New pieces land here first.";

export default function LatestArticles() {
  const v = useHomepageSectionValues("latest_articles");
  const [posts, setPosts] = useState<LeadPost[]>([]);
  const [loading, setLoading] = useState(true);

  const kicker = pickCms(v, "kicker", "eyebrow") || "Journal";
  const hLead = pickCms(v, "heading_line_1", "heading") || "Notes from the";
  const hEm = pickCms(v, "heading_emphasis", "heading_line_2") || "journal";
  const intro = pickCms(v, "description", "intro", "body", "text", "lede") || DEFAULT_INTRO;
  const ctaLabel = pickCms(v, "journal_cta", "button_text", "cta_label") || "Visit the journal page";
  const overlay1 = pickCms(v, "overlay_line_1") || "Notes";
  const overlay2 = pickCms(v, "overlay_line_2") || "from the";
  const overlay3 = pickCms(v, "overlay_line_3") || "journal";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/blog");
        const data = await response.json();
        const raw: BlogPostApi[] = Array.isArray(data.posts) ? data.posts : [];
        const one = raw.slice(0, 1).map((p) => {
          const img = resolveErpPublicUrl(p.meta_image || "");
          return {
            title: p.title || p.name,
            image: img || "",
          };
        });
        if (!cancelled) setPosts(one);
      } catch (error) {
        console.error("Failed to fetch blog posts:", error);
        if (!cancelled) setPosts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const leadPost = posts[0];
  const leadLetter = leadPost?.title?.slice(0, 1) ?? "J";

  return (
    <section className="cb-ref-journal" id="podcast">
      <div className="cb-ref-journal__inner">
        <div className="cb-ref-journal__split">
          <div className="cb-ref-journal__visual-wrap">
            <figure className="cb-ref-journal__figure">
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
            </figure>
          </div>

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
      </div>
    </section>
  );
}

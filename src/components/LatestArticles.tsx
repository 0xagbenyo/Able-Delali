import { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { erpnextPublicOrigin } from "../config/erpnextPublic";
import { socialLinks } from "../config/social";

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

function getImageUrl(imagePath?: string) {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  if (!erpnextPublicOrigin) {
    return imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  }
  return `${erpnextPublicOrigin}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
}

export default function LatestArticles() {
  const [posts, setPosts] = useState<LeadPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/blog");
        const data = await response.json();
        const raw: BlogPostApi[] = Array.isArray(data.posts) ? data.posts : [];
        const one = raw.slice(0, 1).map((p) => {
          const img = getImageUrl(p.meta_image);
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
                <span className="cb-ref-journal__overlay-line">Notes</span>
                <span className="cb-ref-journal__overlay-line cb-ref-journal__overlay-line--accent">from the</span>
                <span className="cb-ref-journal__overlay-line">journal</span>
              </div>
            </figure>
          </div>

          <div className="cb-ref-journal__copy">
            <p className="cb-ref-journal__kicker">Journal</p>
            <h2 className="cb-ref-journal__h2">
              Notes from the <em>journal</em>
            </h2>
            <p className="cb-ref-journal__intro">
              The place where essays go a little deeper — practice, policy, faith, and menstrual health equity. New
              pieces land here first.
            </p>
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
                Visit the journal page
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

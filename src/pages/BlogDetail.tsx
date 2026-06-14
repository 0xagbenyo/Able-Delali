import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import useResponsive from "../hooks/useResponsive";
import PageChrome from "../components/PageChrome";
import { erpnextPublicOrigin } from "../config/erpnextPublic";
import { COLORS, FONT } from "../config/brand";
import { apiUrl } from "../lib/apiUrl";

type BlogPost = {
  name: string;
  title: string;
  blog_category?: string;
  blogger?: string;
  route?: string;
  published_on?: string;
  featured?: boolean;
  blog_intro?: string;
  /** ERPNext Blog Post `content` (HTML). */
  content?: string;
  meta_title?: string;
  meta_description?: string;
  meta_image?: string;
};

const ink = COLORS.deepNavy;
const muted = "rgba(22, 25, 45, 0.52)";
const paper = COLORS.neutralGray;

export default function BlogDetail() {
  const { isMobile } = useResponsive();
  const { blogName } = useParams<{ blogName: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reads, setReads] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      if (!blogName) {
        setError("We couldn’t find that article.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          apiUrl(`/api/blog/${encodeURIComponent(blogName)}`),
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const reason =
            typeof data?.reason === "string" ? data.reason : "";
          setError(
            reason === "blog_post_not_found"
              ? "This article could not be found."
              : "We couldn’t load this article. Please try again later.",
          );
          setPost(null);
          return;
        }
        const loaded = data.post as BlogPost | null | undefined;
        if (!loaded?.name) {
          setError("This article could not be found.");
          setPost(null);
          return;
        }
        setPost(loaded);

        // Read-count API expects the internal document id, not the blog URL slug.
        const docName = encodeURIComponent(loaded.name);

        const readsRes = await fetch(apiUrl(`/api/blog/${docName}/reads`), { cache: "no-store" });
        if (readsRes.ok) {
          const readsData = await readsRes.json();
          setReads(readsData.reads || 0);
        }

        const sessionKey = `blog_read_${loaded.name}`;
        const alreadyRead = sessionStorage.getItem(sessionKey);

        if (!alreadyRead) {
          await fetch(apiUrl(`/api/blog/${docName}/reads`), { method: "POST" });
          sessionStorage.setItem(sessionKey, "true");
        }
      } catch (err) {
        setError("We couldn’t load this article. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [blogName]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    if (!erpnextPublicOrigin) {
      return imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    }
    return `${erpnextPublicOrigin}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
  };

  if (loading) {
    return (
      <PageChrome showFooter={false} style={{ background: paper, fontFamily: FONT }}>
        <div className="ad-container ad-section" style={{ textAlign: "center", color: muted }}>
          Loading…
        </div>
      </PageChrome>
    );
  }

  if (error || !post) {
    return (
      <PageChrome style={{ background: paper, fontFamily: FONT }}>
        <div className="ad-container ad-section" style={{ textAlign: "center" }}>
          <p style={{ fontSize: "16px", color: "#b54a4a", marginBottom: "24px" }}>
            {error || "This article could not be found."}
          </p>
          <Link
            to="/blog"
            className="ad-btn ad-btn--ghost"
            style={{ display: "inline-flex" }}
          >
            Back to journal
          </Link>
        </div>
      </PageChrome>
    );
  }

  const imageUrl = getImageUrl(post.meta_image);

  return (
    <PageChrome style={{ background: paper, fontFamily: FONT }}>
      <article>
        <div className="ad-container" style={{ paddingBlock: isMobile ? "28px 0" : "44px 0" }}>
          <Link
            to="/blog"
            className="ad-btn ad-btn--ghost"
            style={{ display: "inline-flex", marginBottom: 28 }}
          >
            ← Journal
          </Link>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px 18px",
              fontSize: "12px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: muted,
              marginBottom: "16px",
            }}
          >
            {post.published_on && <span>{formatDate(post.published_on)}</span>}
            {post.blog_category && (
              <span style={{ color: ink, fontWeight: 500 }}>{post.blog_category}</span>
            )}
            {post.blogger && <span>{post.blogger}</span>}
          </div>

          <h1
            style={{
              fontFamily: FONT,
              fontWeight: 400,
              fontSize: isMobile ? "32px" : "42px",
              lineHeight: 1.18,
              color: ink,
              margin: "0 0 20px",
              letterSpacing: "-0.02em",
            }}
          >
            {post.title}
          </h1>

          {post.blog_intro && (
            <p
              style={{
                fontSize: isMobile ? "17px" : "19px",
                lineHeight: 1.65,
                color: "#3d3d38",
                margin: "0 0 28px",
                fontWeight: 400,
                textAlign: "justify",
                hyphens: "auto",
              }}
            >
              {post.blog_intro}
            </p>
          )}
        </div>

        {imageUrl && (
          <div className="ad-container" style={{ marginBottom: 40 }}>
            <div
              style={{
                border: "1px solid var(--ad-line-strong)",
                overflow: "hidden",
                background: "#d9d6cf",
                maxHeight: isMobile ? "320px" : "440px",
              }}
            >
              <img
                src={imageUrl}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  maxHeight: isMobile ? "320px" : "440px",
                  objectFit: "cover",
                  display: "block",
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).closest("div")!.style.display = "none";
                }}
              />
            </div>
          </div>
        )}

        <div className="ad-container" style={{ paddingBottom: isMobile ? 80 : 100, maxWidth: 720 }}>
          {post.content?.trim() ? (
            <div
              className="blog-content blog-prose"
              style={{
                fontSize: isMobile ? "16px" : "17px",
                lineHeight: 1.78,
                color: "#2a2a2a",
                wordBreak: "break-word",
                hyphens: "auto",
              }}
              dangerouslySetInnerHTML={{ __html: post.content.trim() }}
            />
          ) : (
            <p style={{ color: muted }}>No article body for this post.</p>
          )}

          <footer
            style={{
              marginTop: "48px",
              paddingTop: "28px",
              borderTop: "1px solid var(--ad-line)",
              fontSize: "13px",
              color: muted,
              lineHeight: 1.5,
            }}
          >
            {reads > 0 ? (
              <span>
                {reads.toLocaleString()} {reads === 1 ? "read" : "reads"}
                {" · "}
              </span>
            ) : null}
            <span>Thank you for reading.</span>
          </footer>
        </div>
      </article>
    </PageChrome>
  );
}

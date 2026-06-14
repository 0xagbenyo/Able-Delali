import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useResponsive from "../hooks/useResponsive";
import PageChrome from "../components/PageChrome";
import { erpnextPublicOrigin } from "../config/erpnextPublic";
import { COLORS, FONT } from "../config/brand";

type BlogPost = {
  name: string;
  title: string;
  blog_category?: string;
  blogger?: string;
  route?: string;
  published_on?: string;
  featured?: boolean;
  blog_intro?: string;
  meta_image?: string;
};

const ink = COLORS.deepNavy;
const muted = "rgba(22, 25, 45, 0.52)";
const paper = COLORS.neutralGray;

function getImageUrl(imagePath?: string) {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  if (!erpnextPublicOrigin) {
    return imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  }
  return `${erpnextPublicOrigin}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
}

export default function Blog() {
  const { isMobile } = useResponsive();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, categoriesRes] = await Promise.all([
          fetch("/api/blog"),
          fetch("/api/blog/categories"),
        ]);

        if (!postsRes.ok) throw new Error("Failed to fetch blog posts");
        if (!categoriesRes.ok) throw new Error("Failed to fetch categories");

        const postsData = await postsRes.json();
        const categoriesData = await categoriesRes.json();

        setPosts(postsData.posts || []);
        setCategories(["All", ...(categoriesData.categories || [])]);
        setSelectedCategory("All");
      } catch (err) {
        setError("We couldn’t load the journal right now. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredPosts =
    selectedCategory === "All"
      ? posts
      : posts.filter((post) => post.blog_category === selectedCategory);

  const featuredPost =
    selectedCategory === "All" && filteredPosts.length > 0
      ? filteredPosts.find((p) => p.featured) ?? filteredPosts[0]
      : null;

  const otherPosts = featuredPost
    ? filteredPosts.filter((p) => p.name !== featuredPost.name)
    : filteredPosts;

  const gridPosts = selectedCategory === "All" ? otherPosts : filteredPosts;

  if (loading) {
    return (
      <PageChrome showFooter={false} style={{ background: paper, fontFamily: FONT }}>
        <div className="ad-container ad-section" style={{ textAlign: "center", color: muted, fontSize: "15px" }}>
          Loading…
        </div>
      </PageChrome>
    );
  }

  if (error) {
    return (
      <PageChrome style={{ background: paper, fontFamily: FONT }}>
        <div className="ad-container ad-section" style={{ textAlign: "center", color: "#b54a4a" }}>
          {error}
        </div>
      </PageChrome>
    );
  }

  if (!posts.length) {
    return (
      <PageChrome style={{ background: paper, fontFamily: FONT }}>
        <div className="ad-container ad-section" style={{ textAlign: "center", color: muted }}>
          Nothing published yet. Check back soon.
        </div>
      </PageChrome>
    );
  }

  const ledeImage = featuredPost ? getImageUrl(featuredPost.meta_image) : null;

  return (
    <PageChrome style={{ background: paper, fontFamily: FONT }}>
      <header className="ad-page-head" style={{ borderBottom: "none" }}>
        <div className="ad-container">
          <p className="ad-page-head__eyebrow">Journal</p>
          <h1 className="ad-page-head__title">Essays &amp; notes</h1>
          <p className="ad-page-head__lead">
            Longer-form writing on public health, policy, and menstrual health equity — one archive for the Able
            Delalie voice.
          </p>
        </div>
      </header>

      <nav className="ad-container ad-section" style={{ paddingTop: 0 }} aria-label="Blog categories">
        <div className="ad-blog-cat">
          {categories.map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                className={`ad-blog-cat__btn${active ? " ad-blog-cat__btn--on" : ""}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            );
          })}
        </div>
      </nav>

      {filteredPosts.length === 0 && (
        <div className="ad-container ad-section" style={{ textAlign: "center", color: muted }}>
          No posts in this category yet.
        </div>
      )}

      {/* Lede — only on “All” */}
      {featuredPost && selectedCategory === "All" && (
        <section className="ad-container ad-section" style={{ paddingTop: 0 }}>
          <h2
            style={{
              fontFamily: FONT,
              fontWeight: 600,
              fontSize: isMobile ? "13px" : "13px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--ad-ink-muted)",
              margin: "0 0 16px",
            }}
          >
            Latest
          </h2>
          <Link to={`/blog/${featuredPost.name}`} className="ad-blog-lede">
            <div className="blog-index-thumb" style={{ minHeight: isMobile ? "200px" : "260px" }}>
              {ledeImage ? (
                <img src={ledeImage} alt="" />
              ) : (
                <div style={{ width: "100%", height: "100%", minHeight: "200px" }} />
              )}
            </div>
            <div
              style={{
                padding: isMobile ? "28px 22px" : "40px 36px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                borderLeft: isMobile ? "none" : "1px solid rgba(22,25,45,0.1)",
                borderTop: isMobile ? "1px solid rgba(22,25,45,0.1)" : "none",
              }}
            >
              {featuredPost.blog_category && (
                <span
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: muted,
                    marginBottom: "12px",
                  }}
                >
                  {featuredPost.blog_category}
                </span>
              )}
              <h2
                style={{
                  fontFamily: FONT,
                  fontSize: isMobile ? "26px" : "34px",
                  fontWeight: 500,
                  lineHeight: 1.25,
                  color: ink,
                  margin: "0 0 16px",
                }}
              >
                {featuredPost.title}
              </h2>
              {featuredPost.blog_intro && (
                <p
                  style={{
                    margin: "0 0 20px",
                    fontSize: "15px",
                    lineHeight: 1.65,
                    color: "rgba(22,25,45,0.72)",
                    textAlign: "justify",
                    hyphens: "auto",
                  }}
                >
                  {featuredPost.blog_intro}
                </p>
              )}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "12px 20px",
                  fontSize: "13px",
                  color: muted,
                }}
              >
                {featuredPost.published_on && <span>{formatDate(featuredPost.published_on)}</span>}
                {featuredPost.blogger && <span>{featuredPost.blogger}</span>}
              </div>
            </div>
          </Link>
        </section>
      )}

      {gridPosts.length > 0 && (
        <section className="ad-container ad-section">
          <h2
            style={{
              fontFamily: FONT,
              fontWeight: 600,
              fontSize: "13px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--ad-ink-muted)",
              margin: "0 0 24px",
            }}
          >
            {selectedCategory === "All" ? "Older" : selectedCategory}
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))",
              gap: isMobile ? "20px" : "28px",
            }}
          >
            {gridPosts.map((post) => {
              const postImage = getImageUrl(post.meta_image);
              return (
                <Link key={post.name} to={`/blog/${post.name}`} className="blog-index-card">
                  <div className="blog-index-thumb">
                    {postImage ? (
                      <img src={postImage} alt="" />
                    ) : (
                      <div style={{ width: "100%", height: "100%", minHeight: "140px" }} />
                    )}
                  </div>
                  <div style={{ padding: "22px 22px 26px" }}>
                    {post.blog_category && (
                      <span
                        style={{
                          fontSize: "10px",
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          color: muted,
                          display: "block",
                          marginBottom: "10px",
                        }}
                      >
                        {post.blog_category}
                      </span>
                    )}
                    <h3
                      style={{
                        fontFamily: FONT,
                        fontSize: isMobile ? "20px" : "22px",
                        fontWeight: 500,
                        lineHeight: 1.3,
                        color: ink,
                        margin: "0 0 10px",
                      }}
                    >
                      {post.title}
                    </h3>
                    {post.blog_intro && (
                      <p
                        style={{
                          fontSize: "14px",
                          lineHeight: 1.6,
                          color: "rgba(22,25,45,0.72)",
                          margin: "0 0 16px",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textAlign: "justify",
                          hyphens: "auto",
                        }}
                      >
                        {post.blog_intro}
                      </p>
                    )}
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px 16px",
                        fontSize: "12px",
                        color: muted,
                      }}
                    >
                      {post.published_on && <span>{formatDate(post.published_on)}</span>}
                      {post.blogger && <span>{post.blogger}</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

    </PageChrome>
  );
}

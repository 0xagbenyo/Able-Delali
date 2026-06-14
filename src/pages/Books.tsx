import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useResponsive from "../hooks/useResponsive";
import PageChrome from "../components/PageChrome";
import { COLORS, FONT, bookPlaceholder } from "../config/brand";
import { apiUrl, assertApiJsonResponse } from "../lib/apiUrl";

const ink = COLORS.deepNavy;
const paper = COLORS.neutralGray;

type SiteBook = {
  id: string;
  bookName: string;
  description: string;
  imageUrl: string | null;
  bookUrl: string | null;
  isFree: boolean;
  isAmazon: boolean;
  isPreorder: boolean;
  amazonUrl: string | null;
};

function excerptFromDescription(raw: string, maxLen: number): string {
  if (!raw) return "";
  const text = raw
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen).trim()}…`;
}

export default function Books() {
  const { isMobile } = useResponsive();
  const [books, setBooks] = useState<SiteBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiUrl("/api/books/catalog"));
        assertApiJsonResponse(res, "Books catalog");
        const data = (await res.json()) as { books?: SiteBook[] };
        if (!cancelled) setBooks(Array.isArray(data.books) ? data.books : []);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError("We couldn’t load the library right now. Please try again later.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <PageChrome
        showFooter={false}
        className="books-page"
        style={{ background: paper, fontFamily: FONT }}
      >
        <div className="ad-container ad-section">
          <div className="books-loading-panel">Loading library…</div>
        </div>
      </PageChrome>
    );
  }

  if (error) {
    return (
      <PageChrome className="books-page" style={{ background: paper, fontFamily: FONT }}>
        <div className="ad-container ad-section">
          <div className="book-read-message">
            <p style={{ color: "#8a4a4a" }}>{error}</p>
          </div>
        </div>
      </PageChrome>
    );
  }

  return (
    <PageChrome className="books-page" style={{ background: paper, fontFamily: FONT }}>
      <header className="ad-page-head" style={{ borderBottom: "1px solid var(--books-line)" }}>
        <div className="ad-container">
          <p className="ad-page-head__eyebrow">Library</p>
          <h1 className="ad-page-head__title">Books</h1>
          <p className="ad-page-head__lead" style={{ maxWidth: "none" }}>
            Free reads on this site, downloads, Amazon links, and pre-orders—everything in one place.
          </p>
        </div>
      </header>

      <section className="ad-container ad-section">
        {books.length === 0 ? (
          <div className="books-empty-panel">Coming soon</div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "1fr"
                : "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
              gap: isMobile ? "24px" : "32px",
            }}
          >
            {books.map((book) => {
              const cover = book.imageUrl?.trim() ? book.imageUrl : bookPlaceholder;
              const blurb = excerptFromDescription(book.description, 200);
              const readPath = `/books/${encodeURIComponent(book.id)}/read`;
              const preorderPath = `/books/preorder/${encodeURIComponent(book.id)}`;
              const hasHttpFile =
                !!book.bookUrl?.trim() && /^https?:\/\//i.test(book.bookUrl.trim());
              const showFreeActions = book.isFree && hasHttpFile;
              const showAmazon = book.isAmazon && book.amazonUrl?.trim();
              const showPreorder = book.isPreorder;
              const showGenericOpen =
                book.bookUrl?.trim() &&
                !showFreeActions &&
                !showAmazon &&
                !showPreorder;

              return (
                <article key={book.id} className="books-catalog-card">
                  <div className="books-catalog-thumb">
                    <img src={cover} alt={book.bookName} />
                  </div>
                  <div
                    style={{
                      padding: "20px 20px 22px",
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                      minHeight: 0,
                    }}
                  >
                    {(book.isFree || book.isAmazon || book.isPreorder) ? (
                      <div className="books-badges">
                        {book.isFree ? (
                          <span className="books-badge books-badge--accent">Free read</span>
                        ) : null}
                        {book.isAmazon ? <span className="books-badge">Amazon</span> : null}
                        {book.isPreorder ? <span className="books-badge">Pre-order</span> : null}
                      </div>
                    ) : null}
                    <h2
                      style={{
                        fontFamily: FONT,
                        fontSize: isMobile ? "19px" : "21px",
                        fontWeight: 500,
                        lineHeight: 1.28,
                        color: ink,
                        margin: "0 0 10px",
                      }}
                    >
                      {book.bookName}
                    </h2>
                    {blurb ? (
                      <p
                        style={{
                          fontSize: "14px",
                          lineHeight: 1.65,
                          color: "#5c5a54",
                          margin: "0 0 16px",
                          flex: 1,
                          fontWeight: 300,
                        }}
                      >
                        {blurb}
                      </p>
                    ) : (
                      <div style={{ flex: 1 }} />
                    )}
                    <div className="books-actions">
                      {showFreeActions ? (
                        <>
                          <Link to={readPath} className="books-btn">
                            Read online
                          </Link>
                          <a
                            href={book.bookUrl!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="books-link-quiet"
                            download
                          >
                            Download file
                          </a>
                        </>
                      ) : null}
                      {showAmazon ? (
                        <a
                          href={book.amazonUrl!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="books-btn books-btn--amazon"
                        >
                          Buy on Amazon
                        </a>
                      ) : null}
                      {showPreorder ? (
                        <Link to={preorderPath} className="books-btn books-btn--ghost">
                          Pre-order
                        </Link>
                      ) : null}
                      {showGenericOpen ? (
                        <a
                          href={book.bookUrl!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="books-btn"
                        >
                          Open book
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </PageChrome>
  );
}

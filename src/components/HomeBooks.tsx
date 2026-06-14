import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { bookPlaceholder } from "../config/brand";
import { resolveErpPublicUrl } from "../config/erpnextPublic";
import useResponsive from "../hooks/useResponsive";
import { useHomepageSectionValues } from "../context/HomepageCMSProvider";
import { pickCms } from "../lib/cmsPick";
import { apiUrl } from "../lib/apiUrl";

/** Homepage preview: four most recent catalog rows (API is `modified desc`). */
const HOME_BOOKS_COUNT = 4;

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

function badgeLine(book: SiteBook): string {
  if (book.isPreorder) return "★ Pre-order";
  if (book.isAmazon) return "★ Amazon";
  if (book.isFree) return "★ Free read on site";
  return "★ Library title";
}

export default function HomeBooks() {
  const { isMobile, isTablet } = useResponsive();
  const v = useHomepageSectionValues("books");
  const [books, setBooks] = useState<SiteBook[]>([]);
  const [loading, setLoading] = useState(true);

  const kicker = pickCms(v, "kicker", "eyebrow", "label") || "Books";
  const hLead = pickCms(v, "heading_line_1", "heading", "title") || "The books that";
  const hEm = pickCms(v, "heading_emphasis", "heading_line_2", "subtitle") || "start conversations.";
  const sectionIntro = pickCms(v, "description", "intro", "section_intro", "body", "text");
  const loadingText = pickCms(v, "loading_message", "loading_text") || "Loading titles…";
  const emptyMessage = pickCms(v, "empty_message", "empty_text");
  const libraryCta =
    pickCms(v, "library_link_text", "footer_cta", "view_all_label") || "View full library →";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiUrl("/api/books/catalog"));
        const ct = res.headers.get("content-type") || "";
        if (!res.ok || !ct.includes("application/json")) throw new Error("catalog");
        const data = (await res.json()) as { books?: SiteBook[] };
        const list = Array.isArray(data.books) ? data.books : [];
        if (!cancelled) setBooks(list.slice(0, HOME_BOOKS_COUNT));
      } catch {
        if (!cancelled) setBooks([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="cb-ref-books" id="home-books">
      <div className="cb-ref-books__inner">
        <p className="cb-ref-books__kicker">{kicker}</p>
        <h2 className="cb-ref-books__h2">
          {hLead} <em>{hEm}</em>
        </h2>

        {sectionIntro ? (
          <p className="cb-ref-books__muted" style={{ maxWidth: "42rem", marginTop: "0.5rem" }}>
            {sectionIntro}
          </p>
        ) : null}

        {loading ? (
          <p className="cb-ref-books__muted">{loadingText}</p>
        ) : books.length === 0 ? (
          <p className="cb-ref-books__muted">
            {emptyMessage ? (
              emptyMessage
            ) : (
              <>
                New titles will appear here soon.{" "}
                <Link to="/books" className="cb-ref-books__link">
                  Open the library →
                </Link>
              </>
            )}
          </p>
        ) : (
          <>
            <div className="cb-ref-books__grid">
              {books.map((book) => {
                const blurb = excerptFromDescription(
                  book.description,
                  isMobile || isTablet ? 110 : 160,
                );
                const readPath = `/books/${encodeURIComponent(book.id)}/read`;
                const preorderPath = `/books/preorder/${encodeURIComponent(book.id)}`;
                const hasHttpFile = !!book.bookUrl?.trim() && /^https?:\/\//i.test(book.bookUrl.trim());
                const showRead = book.isFree && hasHttpFile;
                const showAmazon = book.isAmazon && book.amazonUrl?.trim();
                const showPreorder = book.isPreorder;

                let cta: { href?: string; to?: string; label: string; external?: boolean } = {
                  to: "/books",
                  label: "Read more →",
                };
                if (showRead) cta = { to: readPath, label: "Read more →" };
                else if (showPreorder) cta = { to: preorderPath, label: "Read more →" };
                else if (showAmazon) cta = { href: book.amazonUrl!, label: "Read more →", external: true };
                else if (book.bookUrl?.trim() && /^https?:\/\//i.test(book.bookUrl.trim()))
                  cta = { href: book.bookUrl.trim(), label: "Read more →", external: true };

                const coverSrc = book.imageUrl?.trim()
                  ? resolveErpPublicUrl(book.imageUrl)
                  : bookPlaceholder;

                return (
                  <article key={book.id} className="cb-ref-books__col">
                    <figure className="cb-ref-books__thumb">
                      <img src={coverSrc} alt={book.bookName} loading="lazy" decoding="async" />
                    </figure>
                    <p className="cb-ref-books__badge">{badgeLine(book)}</p>
                    <h3 className="cb-ref-books__title">{book.bookName}</h3>
                    {blurb ? <p className="cb-ref-books__excerpt">{blurb}</p> : null}
                    {cta.href ? (
                      <a
                        href={cta.href}
                        className="cb-ref-books__cta"
                        {...(cta.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      >
                        {cta.label}
                      </a>
                    ) : (
                      <Link to={cta.to!} className="cb-ref-books__cta">
                        {cta.label}
                      </Link>
                    )}
                  </article>
                );
              })}
            </div>
            <Link to="/books" className="cb-ref-books__cta cb-ref-books__cta--footer">
              {libraryCta}
            </Link>
          </>
        )}
      </div>
    </section>
  );
}

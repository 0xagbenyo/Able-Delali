import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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
  const [books, setBooks] = useState<SiteBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/books/catalog");
        if (!res.ok) throw new Error("catalog");
        const data = (await res.json()) as { books?: SiteBook[] };
        const list = Array.isArray(data.books) ? data.books : [];
        if (!cancelled) setBooks(list.slice(0, 4));
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
        <p className="cb-ref-books__kicker">Books</p>
        <h2 className="cb-ref-books__h2">
          The books that <em>start conversations.</em>
        </h2>

        {loading ? (
          <p className="cb-ref-books__muted">Loading titles…</p>
        ) : books.length === 0 ? (
          <p className="cb-ref-books__muted">
            New titles will appear here soon.{" "}
            <Link to="/books" className="cb-ref-books__link">
              Open the library →
            </Link>
          </p>
        ) : (
          <>
            <div className="cb-ref-books__grid">
              {books.map((book) => {
                const blurb = excerptFromDescription(book.description, 160);
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

                return (
                  <article key={book.id} className="cb-ref-books__col">
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
              View full library →
            </Link>
          </>
        )}
      </div>
    </section>
  );
}

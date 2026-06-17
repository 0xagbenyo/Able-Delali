import { useState, useEffect } from "react";
import { useHomepageSectionValues } from "../context/HomepageCMSProvider";
import { resolveErpPublicUrl } from "../config/erpnextPublic";
import { pickCms } from "../lib/cmsPick";
import { apiUrl } from "../lib/apiUrl";
import { refreshAos } from "../hooks/useAos";

type GiftBook = {
  bookName: string;
  description: string;
  imageUrl: string | null;
  bookUrl: string | null;
};

const FALLBACK_DESCRIPTION = `A practical framework for building a life with clarity, alignment, and structure — across your work, leadership, and personal calling.

It will help you see clearly, build intentionally, and stay aligned — so what you're building can carry weight and stand the test of time.`;

function stripInlineTextAlignFromHtml(html: string): string {
  return html.replace(
    /\sstyle\s*=\s*(["'])([\s\S]*?)\1/gi,
    (_full, quote: string, value: string) => {
      const parts = value
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !/^\s*text-align\s*:/i.test(s));
      if (parts.length === 0) return "";
      return ` style=${quote}${parts.join("; ")}${quote}`;
    },
  );
}

function mergeAdjacentParagraphsInGiftHtml(html: string): string {
  const re = /<\/p>\s*<p(?:\s[^>]*)?>/gi;
  let out = html;
  let prev: string;
  do {
    prev = out;
    out = out.replace(re, " ");
  } while (out !== prev);
  return out;
}

function prepareGiftDescriptionHtml(html: string): string {
  return mergeAdjacentParagraphsInGiftHtml(stripInlineTextAlignFromHtml(html));
}

function GiftDescription({ text }: { text: string }) {
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("<")) {
    return (
      <div
        className="gift-band__prose free-gift-description-html"
        dangerouslySetInnerHTML={{
          __html: prepareGiftDescriptionHtml(trimmed),
        }}
      />
    );
  }
  const plainBlocks = trimmed
    .split(/\n\s*\n+/)
    .map((b) => b.trim().replace(/\n/g, " "))
    .filter(Boolean);
  return (
    <div className="gift-band__prose free-gift-description-html">
      {plainBlocks.map((block, i) => (
        <p key={i}>{block}</p>
      ))}
    </div>
  );
}

export default function Newsletter() {
  const v = useHomepageSectionValues("newsletter");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [giftBook, setGiftBook] = useState<GiftBook | null | undefined>(undefined);

  const eyebrow = pickCms(v, "eyebrow", "kicker") || "Reader gift";
  const titlePrefix = pickCms(v, "title_prefix", "heading_prefix") || "Complimentary copy";
  const titleOfWord = pickCms(v, "title_of_word", "of_word") || "of";
  const ghostTitle =
    pickCms(v, "loading_title", "placeholder_title") || "Complimentary book for subscribers";
  const emailLabel = pickCms(v, "email_label") || "Email";
  const emailPlaceholder = pickCms(v, "email_placeholder") || "you@example.com";
  const submitLabel = pickCms(v, "submit_label", "button_text") || "Send the book";
  const submitLoading = pickCms(v, "submit_loading_label") || "Sending…";
  const finePrint =
    pickCms(v, "fine_print", "disclaimer") ||
    "You'll also receive occasional insights — no noise, just value.";
  const descOverride = pickCms(v, "description", "gift_description", "description_override", "body");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiUrl("/api/books/footer/latest"), { cache: "no-store" });
        if (!res.ok) {
          if (!cancelled) setGiftBook(null);
          return;
        }
        const json = (await res.json()) as { book: GiftBook | null };
        if (cancelled) return;
        setGiftBook(json.book ?? null);
      } catch {
        if (!cancelled) setGiftBook(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    refreshAos();
  }, [giftBook]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(apiUrl("/api/books/gift-signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setMessage("You're in — check your email for next steps on your free book.");
        setEmail("");
      } else {
        const err = await res.json().catch(() => ({}));
        const reason = (err as { reason?: string }).reason;
        if (reason === "no_book") {
          setMessage("This offer isn't available right now. Please try again later.");
        } else {
          setMessage("Something went wrong. Please try again.");
        }
      }
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isReady = giftBook !== undefined;
  const bookName = giftBook?.bookName?.trim() ?? "";
  const noBookOffer = isReady && giftBook === null;
  const hasBookOffer = isReady && giftBook !== null;

  const descriptionText = !isReady
    ? ""
    : noBookOffer
      ? ""
      : descOverride?.trim()
        ? descOverride.trim()
        : giftBook && giftBook.description?.trim()
          ? giftBook.description.trim()
          : FALLBACK_DESCRIPTION;

  const coverSrc =
    hasBookOffer && giftBook?.imageUrl?.trim() ? resolveErpPublicUrl(giftBook.imageUrl) : "";

  const msgClass =
    message && (message.includes("wrong") || message.includes("not available"))
      ? "gift-band__msg gift-band__msg--err"
      : "gift-band__msg gift-band__msg--ok";

  return (
    <section
      className="gift-band"
      id="reader-gift"
      aria-labelledby="gift-band-heading"
      data-aos="fade"
      data-aos-duration="2000"
      data-aos-delay="250"
    >
      <div className="gift-band__inner">
        <div className="gift-band__layout">
          <div className="gift-band__visual">
            {!isReady ? (
              <div className="gift-band__skeleton" aria-hidden />
            ) : noBookOffer ? (
              <div className="gift-band__coming-soon-visual" role="status">
                Coming soon
              </div>
            ) : !coverSrc ? (
              <div className="gift-band__coming-soon-visual" role="status">
                Cover coming soon
              </div>
            ) : giftBook?.bookUrl ? (
              <a href={giftBook.bookUrl} target="_blank" rel="noopener noreferrer" className="gift-band__cover">
                <img src={coverSrc} alt={bookName || "Book cover"} />
              </a>
            ) : (
              <div className="gift-band__cover">
                <img src={coverSrc} alt={bookName || "Book cover"} />
              </div>
            )}
          </div>

          <div className="gift-band__body">
            <p className="gift-band__eyebrow">{eyebrow}</p>
            <h2 id="gift-band-heading" className="gift-band__title">
              {!isReady ? (
                <span className="gift-band__title--ghost">{ghostTitle}</span>
              ) : noBookOffer ? (
                <>Coming soon</>
              ) : (
                <>
                  {titlePrefix}
                  {bookName ? (
                    <>
                      {" "}
                      {titleOfWord} <em>{bookName}</em>
                    </>
                  ) : null}
                </>
              )}
            </h2>

            {!isReady ? (
              <div className="gift-band__skeleton gift-band__skeleton--text" aria-hidden />
            ) : noBookOffer ? null : (
              <GiftDescription text={descriptionText} />
            )}

            {!noBookOffer ? (
              <form className="gift-band__form" onSubmit={handleSubmit}>
                <label className="gift-band__label" htmlFor="gift-band-email">
                  {emailLabel}
                </label>
                <div className="gift-band__fields">
                  <input
                    id="gift-band-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder={emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="gift-band__submit" disabled={loading}>
                    {loading ? submitLoading : submitLabel}
                  </button>
                </div>
              </form>
            ) : null}

            {!noBookOffer ? <p className="gift-band__fine">{finePrint}</p> : null}

            {message ? <p className={msgClass}>{message}</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

import { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import content, { linkedinProfileUrl, rhodaDelaliAgbenyo } from "../content/facebookPublicThemes";
import { resolveErpPublicUrl } from "../config/erpnextPublic";
import { socialLinks } from "../config/social";
import { useHomepageSectionValues } from "../context/HomepageCMSProvider";
import { pickCms } from "../lib/cmsPick";
import { apiUrl, assertApiJsonResponse } from "../lib/apiUrl";
import {
  parseHighlightsJson,
  parsePressLinksJson,
  readContextLinksFromSlots,
  readDocWorkFromSlots,
  type ContextPressLink,
  type DocWorkHighlight,
} from "../lib/outreachCmsSlots";

const fb = socialLinks.find((s) => s.label === "Facebook");
const ig = socialLinks.find((s) => s.label === "Instagram");
const x = socialLinks.find((s) => s.label === "X");
const linkedin = linkedinProfileUrl?.trim();

/** Default caps when embedded on the homepage; standalone page uses `fullList`. */
const OUTREACH_HIGHLIGHTS_MAX = 3;
const OUTREACH_PRESS_LINKS_MAX = 5;

/** Recent posts on the standalone speaking & media page (internal `/blog` links). */
const PAGE_JOURNAL_POSTS_MAX = 8;

const DEFAULT_JOURNAL_SECTION_TITLE = "From this site's journal";
const DEFAULT_JOURNAL_SECTION_LEDE =
  "Essays and updates published here — alongside the external outlets and context above.";
const DEFAULT_JOURNAL_FOOTER_CTA = "Browse the full journal →";

type BlogPostApi = {
  name: string;
  title: string;
  published_on?: string;
  blog_category?: string;
  meta_image?: string;
};

type AsideLinkRow = { title: string; url: string; note?: string; source?: string };

type HighlightRow = DocWorkHighlight;
type PressRow = ContextPressLink;

function parseAside(raw: string | undefined): Partial<typeof rhodaDelaliAgbenyo> | null {
  if (!raw?.trim()) return null;
  try {
    const j = JSON.parse(raw) as Partial<typeof rhodaDelaliAgbenyo>;
    if (!j || typeof j !== "object") return null;
    return j;
  } catch {
    return null;
  }
}

function ChannelLinks() {
  const items: { key: string; label: string; href: string }[] = [];
  if (fb) items.push({ key: "fb", label: "Facebook", href: fb.link });
  if (ig) items.push({ key: "ig", label: "Instagram", href: ig.link });
  if (x) items.push({ key: "x", label: "X", href: x.link });
  if (linkedin) items.push({ key: "li", label: "LinkedIn", href: linkedin });

  if (items.length === 0) return null;

  return (
    <nav className="adv-outreach__channels" aria-label="Social channels">
      {items.map((item, i) => (
        <Fragment key={item.key}>
          {i > 0 ? (
            <span className="adv-outreach__sep" aria-hidden>
              ·
            </span>
          ) : null}
          <a className="adv-outreach__channel" href={item.href} target="_blank" rel="noopener noreferrer">
            {item.label}
          </a>
        </Fragment>
      ))}
    </nav>
  );
}

export default function HomeFacebookAdvocacy({
  fullList = false,
  variant = "embed",
}: {
  /** When true (standalone page), show all highlights and press links from CMS / defaults. */
  fullList?: boolean;
  /** `page` = standalone `/speaking-and-media`: stronger hierarchy, roomier layout, full notes. */
  variant?: "embed" | "page";
}) {
  const v = useHomepageSectionValues("outreach");
  const latestArticles = useHomepageSectionValues("latest_articles");

  const highlightsMax = fullList ? 999 : OUTREACH_HIGHLIGHTS_MAX;
  const pressLinksMax = fullList ? 999 : OUTREACH_PRESS_LINKS_MAX;

  const eyebrow = pickCms(v, "eyebrow", "kicker") || "Outreach";
  const titleMain = pickCms(v, "title_line_1", "heading", "title") || "Speaking and ";
  const titleEm = pickCms(v, "title_emphasis", "heading_emphasis", "accent") || "media";
  const intro = pickCms(v, "description", "intro", "lede", "body", "text") || content.intro;
  const linkedinNote = pickCms(v, "linkedin_note", "linkedin_hint") || content.linkedinNote;

  const documentedLabel =
    pickCms(v, "documented_work_label", "highlights_heading") || "Documented work";
  const contextLabel = pickCms(v, "context_label", "press_heading") || "Context";

  const pickField = (field: string) => pickCms(v, field);

  const highlightsFromSlots = readDocWorkFromSlots(pickField);
  const highlightsFromJson = parseHighlightsJson(pickCms(v, "highlights_json", "highlights"));
  const highlights: HighlightRow[] =
    highlightsFromSlots.length > 0
      ? highlightsFromSlots
      : (highlightsFromJson ?? (content.highlights as unknown as HighlightRow[]));

  const pressFromSlots = readContextLinksFromSlots(pickField);
  const pressFromJson = parsePressLinksJson(pickCms(v, "press_links_json", "press_links"));
  const pressLinks: PressRow[] =
    pressFromSlots.length > 0
      ? pressFromSlots
      : (pressFromJson ?? (content.pressLinks as unknown as PressRow[]));

  const asidePatch = parseAside(pickCms(v, "aside_json", "profile_json"));
  const aside = (() => {
    const base = { ...rhodaDelaliAgbenyo };
    if (!asidePatch) return base;
    const links =
      Array.isArray(asidePatch.links) && asidePatch.links.length > 0
        ? asidePatch.links
        : [...base.links];
    return { ...base, ...asidePatch, links };
  })();

  const isPage = variant === "page";
  const journalSectionTitle =
    pickCms(latestArticles, "panel_label", "list_heading", "recent_heading") || DEFAULT_JOURNAL_SECTION_TITLE;
  const journalSectionLede =
    pickCms(latestArticles, "description", "intro", "lede", "body", "text") || DEFAULT_JOURNAL_SECTION_LEDE;
  const journalFooterCta =
    pickCms(latestArticles, "journal_cta", "button_text", "cta_label") || DEFAULT_JOURNAL_FOOTER_CTA;
  const [journalPosts, setJournalPosts] = useState<
    { slug: string; title: string; date: string; category: string; imageUrl: string }[]
  >([]);
  const [journalLoading, setJournalLoading] = useState(isPage);

  useEffect(() => {
    if (!isPage) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiUrl("/api/blog"), { cache: "no-store" });
        assertApiJsonResponse(res, "Journal (speaking & media page)");
        const data = (await res.json()) as { posts?: BlogPostApi[] };
        const raw = Array.isArray(data.posts) ? data.posts : [];
        const rows = raw.slice(0, PAGE_JOURNAL_POSTS_MAX).map((p) => ({
          slug: p.name,
          title: (p.title || p.name).trim(),
          date: formatBlogListDate(p.published_on),
          category: (p.blog_category || "").trim(),
          imageUrl: resolveErpPublicUrl(p.meta_image || "") || "",
        }));
        if (!cancelled) setJournalPosts(rows);
      } catch (e) {
        console.error(e);
        if (!cancelled) setJournalPosts([]);
      } finally {
        if (!cancelled) setJournalLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isPage]);
  const sectionClass = ["adv-outreach", isPage ? "adv-outreach--page" : ""].filter(Boolean).join(" ");
  const TitleTag: "h1" | "h2" = isPage ? "h1" : "h2";
  const SectionLabelTag: "h2" | "h3" = isPage ? "h2" : "h3";

  return (
    <section className={sectionClass} aria-labelledby="adv-outreach-heading">
      <div className="adv-outreach__inner">
        <header className="adv-outreach__header">
          <p className="adv-outreach__eyebrow">{eyebrow}</p>
          <TitleTag id="adv-outreach-heading" className="adv-outreach__title">
            {titleMain} <em>{titleEm}</em>
          </TitleTag>
          <p className="adv-outreach__lede">{intro}</p>
          <ChannelLinks />
          {!linkedin ? <p className="adv-outreach__hint">{linkedinNote}</p> : null}
        </header>

        <div className="adv-outreach__grid">
          <div className="adv-outreach__main">
            <SectionLabelTag className="adv-outreach__section-label">{documentedLabel}</SectionLabelTag>
            <ul className="adv-outreach__cards">
              {highlights.slice(0, highlightsMax).map((h) => (
                <li key={`${h.title}-${h.url}`}>
                  <article className="adv-card">
                    <a className="adv-card__target" href={h.url} target="_blank" rel="noopener noreferrer">
                      <span className="adv-card__source">{h.source}</span>
                      <span className="adv-card__title">{h.title}</span>
                    </a>
                    <p className="adv-card__note">{h.note}</p>
                  </article>
                </li>
              ))}
            </ul>

            <SectionLabelTag className="adv-outreach__section-label adv-outreach__section-label--spaced">
              {contextLabel}
            </SectionLabelTag>
            <ul className="adv-outreach__links">
              {pressLinks.slice(0, pressLinksMax).map((p) => (
                <li key={p.url}>
                  <a href={p.url} target="_blank" rel="noopener noreferrer">
                    {p.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <aside className="adv-outreach__aside" id="rhoda-delali-agbenyo" aria-labelledby="pv-aside-heading">
            <h3 id="pv-aside-heading" className="adv-outreach__aside-name">
              {aside.displayName}
            </h3>
            <p className="adv-outreach__aside-alias">{aside.nameNote}</p>
            <p className="adv-outreach__aside-role">{aside.roleLine}</p>
            <p className="adv-outreach__aside-copy">{aside.summary}</p>
            <a
              className="adv-outreach__aside-profile"
              href={aside.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
            <ul className="adv-outreach__aside-links">
              {(aside.links as readonly AsideLinkRow[]).map((item) => (
                <li key={item.url}>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.title}
                  </a>
                  {isPage && item.source ? (
                    <span className="adv-outreach__aside-link-source">{item.source}</span>
                  ) : null}
                  {isPage && item.note ? (
                    <p className="adv-outreach__aside-link-note">{item.note}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </aside>
        </div>

        {isPage ? (
          <div className="adv-outreach__on-site" aria-labelledby="adv-outreach-onsite-heading">
            <h3 id="adv-outreach-onsite-heading" className="adv-outreach__section-label adv-outreach__on-site-heading">
              {journalSectionTitle}
            </h3>
            <p className="adv-outreach__on-site-lede">{journalSectionLede}</p>
            {journalLoading ? (
              <p className="adv-outreach__on-site-status">Loading journal…</p>
            ) : journalPosts.length === 0 ? (
              <p className="adv-outreach__on-site-empty">
                No posts yet.{" "}
                <Link className="adv-outreach__on-site-inline" to="/blog">
                  Open the journal
                </Link>
                .
              </p>
            ) : (
              <ul className="adv-outreach__blog-list">
                {journalPosts.map((row) => {
                  const letter = row.title?.trim().slice(0, 1).toUpperCase() || "·";
                  return (
                    <li key={row.slug}>
                      <Link to={`/blog/${encodeURIComponent(row.slug)}`} className="adv-outreach__blog-row">
                        <div className="adv-outreach__blog-thumb" aria-hidden>
                          {row.imageUrl ? (
                            <img src={row.imageUrl} alt="" loading="lazy" decoding="async" />
                          ) : (
                            <span className="adv-outreach__blog-thumb-letter">{letter}</span>
                          )}
                        </div>
                        <div className="adv-outreach__blog-text">
                          <span className="adv-outreach__blog-title">{row.title}</span>
                          <span className="adv-outreach__blog-meta">
                            {row.date}
                            {row.category ? ` · ${row.category}` : ""}
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
            <Link to="/blog" className="adv-outreach__blog-all">
              {journalFooterCta}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function formatBlogListDate(dateString?: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

import { Fragment } from "react";
import content, { linkedinProfileUrl, rhodaDelaliAgbenyo } from "../content/facebookPublicThemes";
import { socialLinks } from "../config/social";
import { useHomepageSectionValues } from "../context/HomepageCMSProvider";
import { pickCms } from "../lib/cmsPick";

const fb = socialLinks.find((s) => s.label === "Facebook");
const ig = socialLinks.find((s) => s.label === "Instagram");
const x = socialLinks.find((s) => s.label === "X");
const linkedin = linkedinProfileUrl?.trim();

type HighlightRow = { title: string; note: string; url: string; source: string };
type PressRow = { label: string; url: string };

function parseJsonArray<T>(raw: string | undefined, guard: (row: unknown) => T | null): T[] | null {
  if (!raw?.trim()) return null;
  try {
    const j = JSON.parse(raw) as unknown;
    if (!Array.isArray(j) || j.length === 0) return null;
    const out: T[] = [];
    for (const row of j) {
      const item = guard(row);
      if (item) out.push(item);
    }
    return out.length ? out : null;
  } catch {
    return null;
  }
}

function parseHighlights(raw: string | undefined): HighlightRow[] | null {
  return parseJsonArray(raw, (row) => {
    if (!row || typeof row !== "object") return null;
    const o = row as Record<string, unknown>;
    const title = String(o.title ?? "").trim();
    const url = String(o.url ?? "").trim();
    const source = String(o.source ?? "").trim();
    const note = String(o.note ?? "").trim();
    if (!title || !url) return null;
    return { title, url, source: source || "Link", note: note || "" };
  });
}

function parsePressLinks(raw: string | undefined): PressRow[] | null {
  return parseJsonArray(raw, (row) => {
    if (!row || typeof row !== "object") return null;
    const o = row as Record<string, unknown>;
    const label = String(o.label ?? o.title ?? "").trim();
    const url = String(o.url ?? "").trim();
    if (!label || !url) return null;
    return { label, url };
  });
}

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

export default function HomeFacebookAdvocacy() {
  const v = useHomepageSectionValues("outreach");

  const eyebrow = pickCms(v, "eyebrow", "kicker") || "Outreach";
  const titleMain = pickCms(v, "title_line_1", "heading", "title") || "Public voice &";
  const titleEm = pickCms(v, "title_emphasis", "heading_emphasis", "accent") || "press";
  const intro = pickCms(v, "description", "intro", "lede", "body", "text") || content.intro;
  const linkedinNote = pickCms(v, "linkedin_note", "linkedin_hint") || content.linkedinNote;

  const documentedLabel =
    pickCms(v, "documented_work_label", "highlights_heading") || "Documented work";
  const contextLabel = pickCms(v, "context_label", "press_heading") || "Context";

  const highlights: HighlightRow[] =
    parseHighlights(pickCms(v, "highlights_json", "highlights")) ??
    (content.highlights as unknown as HighlightRow[]);
  const pressLinks: PressRow[] =
    parsePressLinks(pickCms(v, "press_links_json", "press_links")) ??
    (content.pressLinks as unknown as PressRow[]);

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

  return (
    <section className="adv-outreach" aria-labelledby="adv-outreach-heading">
      <div className="adv-outreach__inner">
        <header className="adv-outreach__header">
          <p className="adv-outreach__eyebrow">{eyebrow}</p>
          <h2 id="adv-outreach-heading" className="adv-outreach__title">
            {titleMain} <em>{titleEm}</em>
          </h2>
          <p className="adv-outreach__lede">{intro}</p>
          <ChannelLinks />
          {!linkedin ? <p className="adv-outreach__hint">{linkedinNote}</p> : null}
        </header>

        <div className="adv-outreach__grid">
          <div className="adv-outreach__main">
            <h3 className="adv-outreach__section-label">{documentedLabel}</h3>
            <ul className="adv-outreach__cards">
              {highlights.map((h) => (
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

            <h3 className="adv-outreach__section-label adv-outreach__section-label--spaced">{contextLabel}</h3>
            <ul className="adv-outreach__links">
              {pressLinks.map((p) => (
                <li key={p.url}>
                  <a href={p.url} target="_blank" rel="noopener noreferrer">
                    {p.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <aside className="adv-outreach__aside" id="rhoda-delali-agbenyo" aria-label={aside.displayName}>
            <h3 className="adv-outreach__aside-name">{aside.displayName}</h3>
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
              {aside.links.map((item) => (
                <li key={item.url}>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}

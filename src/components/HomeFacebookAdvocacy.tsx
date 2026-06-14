import { Fragment } from "react";
import content, { linkedinProfileUrl, rhodaDelaliAgbenyo } from "../content/facebookPublicThemes";
import { socialLinks } from "../config/social";

const fb = socialLinks.find((s) => s.label === "Facebook");
const ig = socialLinks.find((s) => s.label === "Instagram");
const x = socialLinks.find((s) => s.label === "X");
const linkedin = linkedinProfileUrl?.trim();

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
  return (
    <section className="adv-outreach" aria-labelledby="adv-outreach-heading">
      <div className="adv-outreach__inner">
        <header className="adv-outreach__header">
          <p className="adv-outreach__eyebrow">Outreach</p>
          <h2 id="adv-outreach-heading" className="adv-outreach__title">
            Public voice &amp; <em>press</em>
          </h2>
          <p className="adv-outreach__lede">{content.intro}</p>
          <ChannelLinks />
          {!linkedin ? <p className="adv-outreach__hint">{content.linkedinNote}</p> : null}
        </header>

        <div className="adv-outreach__grid">
          <div className="adv-outreach__main">
            <h3 className="adv-outreach__section-label">Documented work</h3>
            <ul className="adv-outreach__cards">
              {content.highlights.map((h) => (
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

            <h3 className="adv-outreach__section-label adv-outreach__section-label--spaced">Context</h3>
            <ul className="adv-outreach__links">
              {content.pressLinks.map((p) => (
                <li key={p.url}>
                  <a href={p.url} target="_blank" rel="noopener noreferrer">
                    {p.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <aside className="adv-outreach__aside" id="rhoda-delali-agbenyo" aria-label={rhodaDelaliAgbenyo.displayName}>
            <h3 className="adv-outreach__aside-name">{rhodaDelaliAgbenyo.displayName}</h3>
            <p className="adv-outreach__aside-alias">{rhodaDelaliAgbenyo.nameNote}</p>
            <p className="adv-outreach__aside-role">{rhodaDelaliAgbenyo.roleLine}</p>
            <p className="adv-outreach__aside-copy">{rhodaDelaliAgbenyo.summary}</p>
            <a className="adv-outreach__aside-profile" href={rhodaDelaliAgbenyo.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
            <ul className="adv-outreach__aside-links">
              {rhodaDelaliAgbenyo.links.map((item) => (
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

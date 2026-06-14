import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import PageChrome from "../components/PageChrome";
import { pressKitData } from "../content/pressKitData";
import { resolveErpPublicUrl } from "../config/erpnextPublic";
import { pickCms } from "../lib/cmsPick";
import { apiUrl, assertApiJsonResponse } from "../lib/apiUrl";
import "../ui/press-kit.css";

/** Same coercion as About / server `parseTemplateValues` for CMS rows. */
function coerceWebTemplateValues(raw: unknown): Record<string, string> {
  if (raw == null) return {};
  if (typeof raw === "string") {
    const t = raw.trim();
    if (!t) return {};
    try {
      return coerceWebTemplateValues(JSON.parse(t) as unknown);
    } catch {
      return {};
    }
  }
  if (typeof raw === "object" && !Array.isArray(raw)) {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      if (v == null) continue;
      if (typeof v === "string") out[k] = v;
      else if (typeof v === "number" || typeof v === "boolean") out[k] = String(v);
      else out[k] = JSON.stringify(v);
    }
    return out;
  }
  return {};
}

function mergePressKitValues(sections: unknown[]): Record<string, string> {
  for (const row of sections) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const key = typeof r.key === "string" ? r.key.trim() : String(r.key ?? "").trim();
    if (key !== "press_kit") continue;
    return coerceWebTemplateValues(r.values ?? r.web_template_values);
  }
  return {};
}

type SocialRow = { label: string; handle: string; url: string };

function parseSocialHandles(raw: string | undefined): SocialRow[] {
  const fallback = [...pressKitData.socialHandles] as SocialRow[];
  if (!raw?.trim()) return fallback;
  try {
    const j = JSON.parse(raw) as unknown;
    if (!Array.isArray(j) || j.length === 0) return fallback;
    const out: SocialRow[] = [];
    for (const row of j) {
      if (!row || typeof row !== "object") continue;
      const o = row as Record<string, unknown>;
      const label = String(o.label ?? "").trim();
      const url = String(o.url ?? "").trim();
      const handle = String(o.handle ?? "").trim();
      if (!label || !url) continue;
      out.push({ label, url, handle: handle || url });
    }
    return out.length ? out : fallback;
  } catch {
    return fallback;
  }
}

type Headshot = { src: string; alt: string; credit: string };

function collectPressImages(values: Record<string, string>): Headshot[] {
  const out: Headshot[] = [];
  for (let i = 1; i <= 10; i++) {
    const raw = pickCms(values, `press_image_${i}`, `press_image${i}`);
    if (!raw) continue;
    const src = resolveErpPublicUrl(raw);
    if (!src) continue;
    out.push({
      src,
      alt: `Able Delalie — press photo ${i}`,
      credit: "Press kit image (ERPNext)",
    });
  }
  return out;
}

/** `**bold**` segments from press-kit copy (trusted CMS + local content only). */
function formatInline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      out.push(<Fragment key={`t-${key++}`}>{text.slice(last, m.index)}</Fragment>);
    }
    out.push(
      <strong className="pk-strong" key={`b-${key++}`}>
        {m[1]}
      </strong>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    out.push(<Fragment key={`t-${key++}`}>{text.slice(last)}</Fragment>);
  }
  return out.length ? out : [text];
}

function ProseBlock({ body }: { body: string }) {
  const paras = body.split(/\n\n+/).filter(Boolean);
  return (
    <div className="pk-prose">
      {paras.map((p, i) => (
        <p key={i}>{formatInline(p)}</p>
      ))}
    </div>
  );
}

export default function PressKit() {
  const [cms, setCms] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiUrl("/api/press-kit/sections"), { cache: "no-store" });
        assertApiJsonResponse(res, "Press kit sections");
        const data = (await res.json()) as { sections?: unknown[] };
        if (cancelled) return;
        const rows = Array.isArray(data.sections) ? data.sections : [];
        setCms(mergePressKitValues(rows));
      } catch {
        if (!cancelled) setCms({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const v = cms;

  const pageHeading = pickCms(v, "page_heading", "heading", "title") || pressKitData.pageHeading;
  const pageIntro = pickCms(v, "page_intro", "intro", "description") || pressKitData.pageIntro;
  const preferredHeadline =
    pickCms(v, "preferred_headline", "headline") || pressKitData.preferredHeadline;

  const shortUsage = pickCms(v, "short_bio_usage") || pressKitData.shortBio.usage;
  const shortBody = pickCms(v, "short_bio", "body") || pressKitData.shortBio.body;
  const midUsage = pickCms(v, "mid_bio_usage") || pressKitData.midBio.usage;
  const midBody = pickCms(v, "mid_bio") || pressKitData.midBio.body;
  const fullUsage = pickCms(v, "full_bio_usage") || pressKitData.fullBio.usage;
  const fullBody = pickCms(v, "full_bio") || pressKitData.fullBio.body;

  const headshots = useMemo(() => {
    const fromErp = collectPressImages(v);
    if (fromErp.length > 0) return fromErp;
    return [...pressKitData.headshots];
  }, [v]);

  const socialHandles = useMemo(
    () => parseSocialHandles(pickCms(v, "social_handles_json", "social_json")),
    [v],
  );

  return (
    <PageChrome className="pk-shell">
      <a className="pk-skip" href="#press-kit-main">
        Skip to content
      </a>
      <div className="pk-page ad-container" id="press-kit-main">
        <header className="pk-header">
          <h1 className="pk-title">{pageHeading}</h1>
          <p className="pk-lede">{formatInline(pageIntro)}</p>
        </header>

        <hr className="pk-rule" aria-hidden />

        <section className="pk-section" aria-labelledby="pk-headshots-heading">
          <h2 id="pk-headshots-heading" className="pk-section-title">
            Headshots
          </h2>
          <ul className="pk-headshots">
            {headshots.map((shot, idx) => (
              <li key={`${shot.src}-${idx}`} className="pk-headshots__item">
                <figure className="pk-figure">
                  <img className="pk-figure__img" src={shot.src} alt={shot.alt} loading="lazy" />
                  <figcaption className="pk-figure__cap">{shot.credit}</figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </section>

        <hr className="pk-rule" aria-hidden />

        <section className="pk-section" aria-labelledby="pk-headline-heading">
          <h2 id="pk-headline-heading" className="pk-section-title">
            Preferred headline
          </h2>
          <p className="pk-headline">{preferredHeadline}</p>
        </section>

        <hr className="pk-rule" aria-hidden />

        <section className="pk-section" aria-labelledby="pk-short-heading">
          <h2 id="pk-short-heading" className="pk-section-title">
            Short bio
          </h2>
          <p className="pk-usage">
            <em>{shortUsage}</em>
          </p>
          <ProseBlock body={shortBody} />
        </section>

        <hr className="pk-rule" aria-hidden />

        <section className="pk-section" aria-labelledby="pk-mid-heading">
          <h2 id="pk-mid-heading" className="pk-section-title">
            Mid-length bio
          </h2>
          <p className="pk-usage">
            <em>{midUsage}</em>
          </p>
          <ProseBlock body={midBody} />
        </section>

        <hr className="pk-rule" aria-hidden />

        <section className="pk-section" aria-labelledby="pk-full-heading">
          <h2 id="pk-full-heading" className="pk-section-title">
            Full bio
          </h2>
          <p className="pk-usage">
            <em>{fullUsage}</em>
          </p>
          <ProseBlock body={fullBody} />
        </section>

        <hr className="pk-rule" aria-hidden />

        <section className="pk-section" aria-labelledby="pk-social-heading">
          <h2 id="pk-social-heading" className="pk-section-title">
            Social media
          </h2>
          <ul className="pk-social">
            {socialHandles.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.label}
                </a>
                <span className="pk-social__handle"> — {s.handle}</span>
              </li>
            ))}
          </ul>
        </section>

        <hr className="pk-rule" aria-hidden />

        <footer className="pk-footer">
          <p className="pk-footer__text">
            For media, speaking requests, and collaborations, use the{" "}
            <Link to="/contact" className="pk-footer__link">
              contact page
            </Link>
            .
          </p>
        </footer>
      </div>
    </PageChrome>
  );
}

import { Fragment, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageChrome from "../components/PageChrome";
import aboutContent from "../content/aboutintro.json";
import {
  aboutMissionSection,
  applyErpSlidesToMissionGroups,
  getMissionCarouselSlides,
  type AboutMissionCard,
  type AboutMissionGroup,
} from "../content/aboutMissionCards";
import { resolveErpPublicUrl } from "../config/erpnextPublic";
import { pickCms } from "../lib/cmsPick";
import useResponsive from "../hooks/useResponsive";
import { useAos } from "../hooks/useAos";
import { apiUrl, assertApiJsonResponse } from "../lib/apiUrl";
import "../ui/about-page.css";

const DEFAULT_FAMILY_INTRO =
  typeof aboutContent?.familyIntro === "string" && aboutContent.familyIntro.trim().length > 0
    ? aboutContent.familyIntro
    : "Able Delalie is a pharmacist and public health voice bridging practice and policy.";

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

function parseSlideUrls(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  const s = raw.trim();
  try {
    const j = JSON.parse(s) as unknown;
    if (Array.isArray(j)) {
      return j.map((x) => String(x).trim()).filter(Boolean);
    }
  } catch {
    /* plain list */
  }
  return s
    .split(/[\n|,]+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

/**
 * ERPNext Web Template **About Intro** — Attach Image fields (order = carousel / slots).
 * React maps: image → arch portrait; image2 → hero background (fallback: image); image3–4 → service cards.
 * Optional: add `image5`… in ERPNext and extend this list when you need more slots.
 */
function collectAttachImagePaths(values: Record<string, string>): string[] {
  const keys = [["image"], ["image2", "image_2"], ["image3", "image_3"], ["image4", "image_4"]] as const;
  const out: string[] = [];
  for (const group of keys) {
    let raw: string | undefined;
    for (const k of group) {
      raw = pickCms(values, k);
      if (raw) break;
    }
    if (raw) out.push(raw);
  }
  return out;
}

function mergeIntroValues(sections: unknown[]): Record<string, string> {
  const m = new Map<string, Record<string, string>>();
  for (const row of sections) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const keyRaw = r.key;
    const key = typeof keyRaw === "string" ? keyRaw.trim() : String(keyRaw ?? "").trim();
    if (!key) continue;
    const rawVals = r.values ?? r.web_template_values;
    m.set(key, coerceWebTemplateValues(rawVals));
  }
  const about = m.get("about") ?? {};
  const intro = m.get("about_intro") ?? {};
  return { ...about, ...intro };
}

function MissionIntroGroup({ group }: { group: AboutMissionGroup }) {
  const isBinder = group.id === "mission-narrative";
  const [binderIndex, setBinderIndex] = useState(0);
  const narrativeCount = group.cards.length;
  const narrativePageCount = Math.max(1, narrativeCount);

  useEffect(() => {
    setBinderIndex((i) => Math.min(i, narrativePageCount - 1));
  }, [narrativePageCount]);

  function renderIntroArticle(card: AboutMissionCard, _idx: number, useBinderSkin: boolean) {
    const isLead = card.variant === "lead";
    const hasMedia = Boolean(card.image);
    const cardClass = [
      "ad-about-page__mission-card",
      isLead ? "ad-about-page__mission-card--lead" : "",
      hasMedia ? "ad-about-page__mission-card--has-media" : "",
      useBinderSkin ? "ad-about-page__mission-card--binder" : "",
    ]
      .filter(Boolean)
      .join(" ");
    return (
      <article className={cardClass}>
        {card.image ? (
          <div className="ad-about-page__mission-card-media">
            <img src={card.image} alt="" loading="lazy" decoding="async" />
          </div>
        ) : null}
        <div className="ad-about-page__mission-card-main">
          {card.title ? <h4 className="ad-about-page__mission-card-title">{card.title}</h4> : null}
          <p className="ad-about-page__mission-body">{card.body}</p>
          {card.externalUrl ? (
            <a
              href={card.externalUrl}
              className="ad-about-page__mission-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {card.linkLabel ?? "Learn more"}
            </a>
          ) : card.to ? (
            <Link to={card.to} className="ad-about-page__mission-link">
              {card.linkLabel ?? "Learn more"}
            </Link>
          ) : null}
        </div>
      </article>
    );
  }

  const headingBlock = group.heading ? (
    <h3 className="ad-about-page__mission-group-heading">{group.heading}</h3>
  ) : null;

  if (!isBinder) {
    const grid = (
      <div
        className={["ad-about-page__mission-grid", "ad-about-page__mission-grid--intro"].filter(Boolean).join(" ")}
      >
        {group.cards.map((card, idx) => (
          <Fragment key={`${group.id}-${idx}`}>{renderIntroArticle(card, idx, false)}</Fragment>
        ))}
      </div>
    );
    return (
      <div className="ad-about-page__mission-group ad-about-page__mission-group--intro">
        {headingBlock}
        {grid}
      </div>
    );
  }

  const safeIndex = ((binderIndex % narrativePageCount) + narrativePageCount) % narrativePageCount;
  const activeCard = group.cards[safeIndex]!;

  return (
    <div className="ad-about-page__mission-group ad-about-page__mission-group--intro">
      {headingBlock}
      <div className="ad-about-page__mission-binder">
        <div className="ad-about-page__mission-narrative-frame">
          <button
            type="button"
            className="ad-about-page__mission-narrative-arrow ad-about-page__mission-narrative-arrow--prev"
            aria-label="Previous story"
            disabled={narrativePageCount <= 1}
            onClick={() => setBinderIndex((p) => (p - 1 + narrativePageCount) % narrativePageCount)}
          >
            ‹
          </button>
          <div
            key={safeIndex}
            className="ad-about-page__mission-narrative-track"
            role="group"
            aria-roledescription="Slide"
            aria-label={`Story ${safeIndex + 1} of ${narrativePageCount}`}
            aria-live="polite"
          >
            <div className="ad-about-page__mission-grid ad-about-page__mission-grid--intro ad-about-page__mission-grid--binder">
              <div className="ad-about-page__mission-deck">
                <span className="ad-about-page__mission-deck-layer" aria-hidden />
                <span className="ad-about-page__mission-deck-layer" aria-hidden />
                <span className="ad-about-page__mission-deck-layer" aria-hidden />
                <span className="ad-about-page__mission-deck-layer" aria-hidden />
                {renderIntroArticle(activeCard, safeIndex, true)}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="ad-about-page__mission-narrative-arrow ad-about-page__mission-narrative-arrow--next"
            aria-label="Next story"
            disabled={narrativePageCount <= 1}
            onClick={() => setBinderIndex((p) => (p + 1) % narrativePageCount)}
          >
            ›
          </button>
        </div>
        {narrativePageCount > 1 ? (
          <div className="ad-about-page__mission-narrative-dots" role="tablist" aria-label="Mission stories">
            {Array.from({ length: narrativePageCount }, (_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === safeIndex}
                aria-label={`Story ${i + 1}`}
                className={`ad-about-page__mission-narrative-dot${i === safeIndex ? " ad-about-page__mission-narrative-dot--active" : ""}`}
                onClick={() => setBinderIndex(i)}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function About() {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsive();
  const [introValues, setIntroValues] = useState<Record<string, string>>({});
  const [missionCarouselPage, setMissionCarouselPage] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiUrl("/api/about/sections"), { cache: "no-store" });
        assertApiJsonResponse(res, "About sections");
        const data = (await res.json()) as {
          ok?: boolean;
          sections?: unknown[];
          error?: string;
        };
        if (cancelled) return;
        const rows = Array.isArray(data.sections) ? data.sections : [];
        try {
          setIntroValues(mergeIntroValues(rows));
        } catch (parseErr) {
          console.warn("[About] Unrecognized sections shape from /api/about/sections:", parseErr);
          setIntroValues({});
        }
      } catch (e) {
        console.warn("[About] /api/about/sections failed, using built-in copy:", e);
        if (!cancelled) setIntroValues({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const eyebrow = pickCms(introValues, "eyebrow", "kicker", "label") || "About";
  const title = pickCms(introValues, "title", "heading", "h1") || "Who she is";
  const heroLine2 = (pickCms(introValues, "hero_subtitle", "hero_line_2", "subtitle") ?? "").trim();
  const bodyRaw =
    pickCms(introValues, "description", "body", "text", "copy", "family_intro") || DEFAULT_FAMILY_INTRO;
  const body = typeof bodyRaw === "string" ? bodyRaw : String(bodyRaw);
  const aboutSectionHeading = pickCms(introValues, "about_section_heading", "section_heading") || "About me";
  const heroCtaLabel = pickCms(introValues, "hero_cta_label", "primary_cta") || "Read her story";

  const slides = useMemo(() => {
    const fromAttach = collectAttachImagePaths(introValues)
      .map((u) => resolveErpPublicUrl(u))
      .filter(Boolean);
    if (fromAttach.length > 0) return fromAttach;

    const raw = pickCms(introValues, "slide_urls", "slides_json", "slides", "gallery_urls");
    const urls = parseSlideUrls(raw)
      .map((u) => resolveErpPublicUrl(u))
      .filter(Boolean);
    if (urls.length > 0) return urls;

    return [];
  }, [introValues]);

  const archImage = slides[0] ?? "";
  const heroImage = slides[1] ?? slides[0] ?? "";
  const serviceImages = [slides[2] ?? "", slides[3] ?? "", slides[0] ?? ""] as const;

  const missionGroups = useMemo(
    () => applyErpSlidesToMissionGroups(aboutMissionSection.groups, slides),
    [slides],
  );

  useAos([introValues, missionCarouselPage, slides.length, missionGroups.length]);

  const serviceCards = [
    {
      to: "/work-with-me#speaking",
      title: pickCms(introValues, "service_1_title") || "Speaking & media",
      text:
        pickCms(introValues, "service_1_text") ||
        "Keynotes, panels, and commentary where clinical credibility and public health fluency matter.",
      img: serviceImages[0],
    },
    {
      to: "/blog",
      title: pickCms(introValues, "service_2_title") || "Journal & essays",
      text:
        pickCms(introValues, "service_2_text") ||
        "Long-form thinking on policy, menstrual health equity, pharmacy practice, and dignity in care.",
      img: serviceImages[1],
    },
    {
      to: "/work-with-me#partnerships",
      title: pickCms(introValues, "service_3_title") || "Partnerships",
      text:
        pickCms(introValues, "service_3_text") ||
        "Collaborations with organisations that share rigour, evidence, and respect for communities served.",
      img: serviceImages[2],
    },
  ] as const;

  const chips = [
    { label: "Journal", path: "/blog" },
    { label: "Books", path: "/books" },
    { label: "Contact", path: "/contact?topic=general" },
  ] as const;

  const missionCarouselSlides = useMemo(() => getMissionCarouselSlides(missionGroups), [missionGroups]);
  const missionPerPage = isMobile ? 1 : isTablet ? 2 : 3;
  const missionPageCount = Math.max(1, Math.ceil(missionCarouselSlides.length / missionPerPage));

  useEffect(() => {
    setMissionCarouselPage((p) => Math.min(p, missionPageCount - 1));
  }, [missionPageCount]);

  const missionVisibleStart = missionCarouselPage * missionPerPage;
  const missionVisibleSlides = missionCarouselSlides.slice(
    missionVisibleStart,
    missionVisibleStart + missionPerPage,
  );

  const engageCards = [
    {
      to: "/contact?topic=speaking",
      title: "Speaking Engagements",
      text: "Invite Able to speak at conferences, institutions, or events.",
    },
    {
      to: "/contact?topic=media",
      title: "Media & Interviews",
      text: "Request commentary or expert opinion on pharmacy, public health, and policy.",
    },
    {
      to: "/contact?topic=partnerships",
      title: "Partnerships",
      text: "Collaborate on campaigns, research, education, or advocacy initiatives.",
    },
    {
      to: "/contact?topic=journal",
      title: "Journal",
      text: "Explore essays and insights on pharmacy, policy, public health, and menstrual health.",
    },
  ] as const;

  return (
    <PageChrome>
      <div className="ad-about-page">
        <section
          className={`ad-about-page__hero${heroImage ? "" : " ad-about-page__hero--no-image"}`}
          aria-labelledby="about-hero-heading"
        >
          {heroImage ? (
            <img className="ad-about-page__hero-bg" src={heroImage} alt="" decoding="async" />
          ) : null}
          <div className="ad-about-page__hero-scrim" aria-hidden />
          <div className="ad-container ad-about-page__hero-inner">
            <p className="ad-about-page__hero-eyebrow">{eyebrow}</p>
            <h1 id="about-hero-heading" className="ad-about-page__hero-title">
              {title}
              {heroLine2 ? (
                <>
                  {" "}
                  <em>{heroLine2}</em>
                </>
              ) : null}
            </h1>
            <Link className="ad-about-page__hero-cta" to="#about-story">
              {heroCtaLabel}
            </Link>
          </div>
        </section>

        <section
          id="about-story"
          className="ad-about-page__split"
          data-aos="fade"
          data-aos-duration="2000"
        >
          <div className="ad-about-page__split-grid">
            <div className="ad-about-page__portrait-shell">
              <div className="ad-about-page__arch-wrap">
                <div className="ad-about-page__arch">
                  {archImage ? (
                    <img src={archImage} alt="Able Delalie" width={480} height={620} decoding="async" />
                  ) : null}
                </div>
              </div>
            </div>
            <article className="ad-about-page__story-card">
              <h2>{aboutSectionHeading}</h2>
              <div className="ad-about-page__prose">
                {body.split("\n\n").map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
              <Link className="ad-btn ad-btn--primary ad-about-page__split-cta" to="/contact?topic=general">
                Contact today
              </Link>
              <div className="ad-about-page__chips">
                {chips.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    className="ad-chip"
                    onClick={() => navigate(item.path)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section
          className="ad-about-page__services"
          aria-labelledby="about-services-heading"
          data-aos="fade"
          data-aos-duration="2000"
        >
          <div className="ad-about-page__services-head">
            <h2 id="about-services-heading">How Able works with you</h2>
          </div>
          <div className="ad-about-page__services-grid">
            {serviceCards.map((card) => (
              <Link key={card.to} to={card.to} className="ad-about-page__service-card">
                {card.img ? (
                  <div className="ad-about-page__service-arch">
                    <img src={card.img} alt="" loading="lazy" decoding="async" />
                  </div>
                ) : null}
                <div className="ad-about-page__service-body">
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="ad-about-page__services-foot">
            <Link to="/work-with-me">Learn more</Link>
          </div>
        </section>

        <section
          className="ad-about-page__mission"
          id={aboutMissionSection.sectionId}
          aria-labelledby="about-mission-heading"
        >
          <div
            className="ad-container ad-about-page__mission-inner"
            data-aos="fade"
            data-aos-duration="2500"
          >
            <h2 id="about-mission-heading" className="ad-about-page__mission-title">
              {aboutMissionSection.sectionHeading}
            </h2>
            <div className="ad-about-page__mission-groups">
              {missionGroups
                .filter((g) => g.id === "mission-narrative")
                .map((group) => (
                  <MissionIntroGroup key={group.id} group={group} />
                ))}
            </div>
          </div>

          <div
            className="ad-about-page__mission-showcase"
            aria-labelledby="about-mission-showcase-heading"
            data-aos="fade"
            data-aos-duration="2000"
            data-aos-delay="250"
          >
            <span className="ad-about-page__mission-showcase-letter" aria-hidden>
              M
            </span>
            <div className="ad-container ad-about-page__mission-showcase-inner">
              <h3 id="about-mission-showcase-heading" className="ad-about-page__mission-showcase-title">
                Areas, initiatives &amp; principles
              </h3>
              <div className="ad-about-page__mission-showcase-frame">
                <button
                  type="button"
                  className="ad-about-page__mission-showcase-arrow ad-about-page__mission-showcase-arrow--prev"
                  aria-label="Previous"
                  disabled={missionPageCount <= 1}
                  onClick={() =>
                    setMissionCarouselPage((p) => (p - 1 + missionPageCount) % missionPageCount)
                  }
                >
                  ‹
                </button>
                <div
                  key={missionCarouselPage}
                  className="ad-about-page__mission-carousel-track"
                  role="list"
                  aria-live="polite"
                >
                  {missionVisibleSlides.map((slide) => (
                    <figure key={slide.id} className="ad-about-page__mission-tile" role="listitem">
                      <div className="ad-about-page__mission-tile-avatar">
                        <img src={slide.image} alt="" loading="lazy" decoding="async" />
                      </div>
                      <blockquote className="ad-about-page__mission-tile-card">
                        <p className="ad-about-page__mission-tile-quote">{slide.quote}</p>
                      </blockquote>
                      <figcaption className="ad-about-page__mission-tile-caption">
                        <span className="ad-about-page__mission-tile-role">{slide.name}</span>
                        {slide.to ? (
                          <Link to={slide.to} className="ad-about-page__mission-tile-link">
                            {slide.linkLabel ?? "Learn more"}
                          </Link>
                        ) : null}
                      </figcaption>
                    </figure>
                  ))}
                </div>
                <button
                  type="button"
                  className="ad-about-page__mission-showcase-arrow ad-about-page__mission-showcase-arrow--next"
                  aria-label="Next"
                  disabled={missionPageCount <= 1}
                  onClick={() => setMissionCarouselPage((p) => (p + 1) % missionPageCount)}
                >
                  ›
                </button>
              </div>
              {missionPageCount > 1 ? (
                <div className="ad-about-page__mission-showcase-dots" role="tablist" aria-label="Slide">
                  {Array.from({ length: missionPageCount }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      role="tab"
                      aria-selected={i === missionCarouselPage}
                      aria-label={`Page ${i + 1}`}
                      className={`ad-about-page__mission-showcase-dot${i === missionCarouselPage ? " ad-about-page__mission-showcase-dot--active" : ""}`}
                      onClick={() => setMissionCarouselPage(i)}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section
          className="ad-about-engage"
          aria-labelledby="about-engage-heading"
          data-aos="fade"
          data-aos-duration="2000"
          data-aos-delay="500"
        >
          <div className="ad-container ad-about-engage__inner">
            <header className="ad-about-engage__head">
              <p className="ad-about-engage__eyebrow">Ways to connect</p>
              <h2 id="about-engage-heading" className="ad-about-engage__title">
                Let&apos;s Build Better Health Together
              </h2>
              <p className="ad-about-engage__lede">
                Speaking, media, partnerships, and writing — pick a path that fits what you&apos;re building.
              </p>
            </header>
            <div className="ad-about-engage__grid">
              {engageCards.map((card) => (
                <Link key={card.to} to={card.to} className="ad-about-engage-card">
                  <h3 className="ad-about-engage-card__heading">{card.title}</h3>
                  <p className="ad-about-engage-card__text">{card.text}</p>
                  <span className="ad-about-engage-card__cta">Learn more</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PageChrome>
  );
}

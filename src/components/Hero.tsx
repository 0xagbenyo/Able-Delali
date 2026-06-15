import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ablePortrait } from "../config/brand";
import { LEGACY_HERO_DEFAULT_BIO } from "../content/legacyHeroBio";
import { SITE_FOOTER_TAGLINE } from "../content/siteTagline";
import { resolveErpPublicUrl } from "../config/erpnextPublic";
import { useHomepageSectionValues } from "../context/HomepageCMSProvider";
import { pickCms, splitListFromCms } from "../lib/cmsPick";

const DEFAULT_ROLE_TAGS = ["Pharmacist", "Public health", "Policy", "Writer"] as const;

function go(navigate: ReturnType<typeof useNavigate>, pathOrUrl: string) {
  const p = pathOrUrl.trim();
  if (!p) return;
  if (/^https?:\/\//i.test(p)) {
    window.location.href = p;
    return;
  }
  navigate(p.startsWith("/") ? p : `/${p}`);
}

export default function Hero() {
  const navigate = useNavigate();
  /** ERPNext Web Template may be named `hero_section`; `hero` kept as legacy alias. */
  const vPrimary = useHomepageSectionValues("hero_section");
  const vFallback = useHomepageSectionValues("hero");
  const vCover = useHomepageSectionValues("cover_image");
  const vAboutTeaser = useHomepageSectionValues("about_teaser");
  const v = useMemo(
    () => ({ ...vFallback, ...vPrimary }),
    [vPrimary, vFallback],
  );

  /** Shown in the hero (same copy as former About teaser headline; still edited under **About teaser** in ERPNext). */
  const voiceLine1 =
    pickCms(vAboutTeaser, "headline_line_1", "headline", "title_line_1", "heading") || "Meet Able";
  const voiceLine2 =
    pickCms(vAboutTeaser, "headline_line_2", "headline_muted", "subtitle", "title_line_2") ||
    "the voice that shifts conversations";

  const roleTagsRaw = pickCms(v, "role_tags", "tags", "roles", "pill_labels");
  const roleTags = splitListFromCms(roleTagsRaw ?? "", [...DEFAULT_ROLE_TAGS]);

  const nameFirst = pickCms(v, "name_first", "first_name", "given_name") || "Able";
  const nameSecond = pickCms(v, "name_second", "last_name", "surname") || "Delalie";
  const cmsBio = pickCms(v, "description", "bio", "intro", "body", "text")?.trim() ?? "";
  const taglineNorm = SITE_FOOTER_TAGLINE.trim().toLowerCase();
  const legacyBioNorm = LEGACY_HERO_DEFAULT_BIO.trim().toLowerCase();
  const bio =
    cmsBio &&
    cmsBio.toLowerCase() !== taglineNorm &&
    cmsBio.toLowerCase() !== legacyBioNorm
      ? cmsBio
      : "";

  const primaryLabel =
    pickCms(v, "button_primary_text", "primary_button_text", "primary_cta") || "About Able Delalie";
  const primaryPath =
    pickCms(v, "button_primary_path", "primary_button_path", "primary_path", "primary_url") ||
    "/about";

  const secondaryLabel =
    pickCms(v, "button_secondary_text", "secondary_button_text", "secondary_cta") || "Get in touch";
  const secondaryPath =
    pickCms(v, "button_secondary_path", "secondary_button_path", "secondary_path", "secondary_url") ||
    "/contact";

  const speakingLabel =
    pickCms(v, "button_speaking_text", "button_book_speaking_text", "speaking_cta") || "Book Able to speak";
  const speakingPath =
    pickCms(v, "button_speaking_path", "button_book_speaking_path", "speaking_path") || "/contact";

  /** Red pill like the first tag (“Pharmacist”) — also used for “Policy” when it appears in the tag list. */
  const tagIsAccent = (tag: string, index: number) =>
    index === 0 || tag.trim().toLowerCase() === "policy";

  /** Web Page "Cover Image" block — `url` (then other fields) overrides the hero portrait. */
  const portraitFromCover =
    pickCms(vCover, "url", "description", "image", "cover_image", "image_url", "file", "photo", "banner") || "";
  const portraitFromHero =
    pickCms(v, "portrait", "portrait_url", "image", "photo", "headshot") || "";
  const portraitRaw = portraitFromCover || portraitFromHero;
  const portraitSrc = portraitRaw ? resolveErpPublicUrl(portraitRaw) : ablePortrait;

  return (
    <section
      id="ad-home-main-hero"
      className="cb-ref-hero"
      aria-labelledby="cb-ref-hero-voice cb-ref-hero-title"
    >
      <div className="cb-ref-hero__grid">
        <div className="cb-ref-hero__copy">
          <div className="cb-ref-hero__tags" role="list">
            {roleTags.map((tag, i) => (
              <span
                key={`${tag}-${i}`}
                className={`cb-ref-hero__tag${tagIsAccent(tag, i) ? " cb-ref-hero__tag--active" : ""}`}
                role="listitem"
              >
                {tag}
              </span>
            ))}
          </div>

          <p id="cb-ref-hero-voice" className="cb-ref-hero__voice">
            <span className="cb-ref-hero__voice-line">{voiceLine1}</span>
            <span className="cb-ref-hero__voice-line cb-ref-hero__voice-line--muted">
              <em>{voiceLine2}</em>
            </span>
          </p>

          <h2 id="cb-ref-hero-title" className="cb-ref-hero__title">
            <span className="cb-ref-hero__name">{nameFirst}</span>
            <span className="cb-ref-hero__name cb-ref-hero__name--accent">{nameSecond}</span>
          </h2>

          {bio ? <p className="cb-ref-hero__bio">{bio}</p> : null}

          <div className="cb-ref-hero__actions">
            <button
              type="button"
              className="cb-ref-btn cb-ref-btn--solid"
              onClick={() => go(navigate, primaryPath)}
            >
              {primaryLabel}
            </button>
            <button
              type="button"
              className="cb-ref-btn cb-ref-btn--ghost"
              onClick={() => go(navigate, secondaryPath)}
            >
              {secondaryLabel}
            </button>
            <button
              type="button"
              className="cb-ref-btn cb-ref-btn--red-outline"
              onClick={() => go(navigate, speakingPath)}
            >
              {speakingLabel}
            </button>
          </div>
        </div>

        <div className="cb-ref-hero__visual">
          <img src={portraitSrc} alt={`${nameFirst} ${nameSecond}`} className="cb-ref-hero__portrait" />
        </div>
      </div>
    </section>
  );
}

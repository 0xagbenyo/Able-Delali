import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ablePortrait } from "../config/brand";
import { resolveErpPublicUrl } from "../config/erpnextPublic";
import { useHomepageSectionValues } from "../context/HomepageCMSProvider";
import { pickCms, splitListFromCms } from "../lib/cmsPick";

const DEFAULT_ROLE_TAGS = ["Pharmacist", "Public health", "Advocate", "Writer"] as const;

const DEFAULT_BIO =
  "Pharmacist and public health voice bridging practice and policy — strengthening health systems through evidence, advocacy, and menstrual health equity.";

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
  const v = useMemo(
    () => ({ ...vFallback, ...vPrimary }),
    [vPrimary, vFallback],
  );

  const roleTagsRaw = pickCms(v, "role_tags", "tags", "roles", "pill_labels");
  const roleTags = splitListFromCms(roleTagsRaw ?? "", [...DEFAULT_ROLE_TAGS]);

  const nameFirst = pickCms(v, "name_first", "first_name", "given_name") || "Able";
  const nameSecond = pickCms(v, "name_second", "last_name", "surname") || "Delalie";
  const bio =
    pickCms(v, "description", "bio", "intro", "body", "text") || DEFAULT_BIO;

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

  /** Web Page "Cover Image" block — `url` (then other fields) overrides the hero portrait. */
  const portraitFromCover =
    pickCms(vCover, "url", "description", "image", "cover_image", "image_url", "file", "photo", "banner") || "";
  const portraitFromHero =
    pickCms(v, "portrait", "portrait_url", "image", "photo", "headshot") || "";
  const portraitRaw = portraitFromCover || portraitFromHero;
  const portraitSrc = portraitRaw ? resolveErpPublicUrl(portraitRaw) : ablePortrait;

  return (
    <section className="cb-ref-hero" aria-labelledby="cb-ref-hero-title">
      <div className="cb-ref-hero__grid">
        <div className="cb-ref-hero__copy">
          <div className="cb-ref-hero__tags" role="list">
            {roleTags.map((tag, i) => (
              <span
                key={`${tag}-${i}`}
                className={`cb-ref-hero__tag${i === 0 ? " cb-ref-hero__tag--active" : ""}`}
                role="listitem"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 id="cb-ref-hero-title" className="cb-ref-hero__title">
            <span className="cb-ref-hero__name">{nameFirst}</span>
            <span className="cb-ref-hero__name cb-ref-hero__name--accent">{nameSecond}</span>
          </h1>

          <p className="cb-ref-hero__bio">{bio}</p>

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
          </div>
        </div>

        <div className="cb-ref-hero__visual">
          <img src={portraitSrc} alt={`${nameFirst} ${nameSecond}`} className="cb-ref-hero__portrait" />
        </div>
      </div>
    </section>
  );
}

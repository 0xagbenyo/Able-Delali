import { useMemo } from "react";
import { logoPrimaryNavy } from "../config/brand";
import { socialLinks } from "../config/social";
import { useHomepageSectionValues } from "../context/HomepageCMSProvider";
import { pickCms } from "../lib/cmsPick";

const DEFAULT_BIO =
  "Pharmacist and public health voice bridging practice and policy — strengthening health systems through evidence, advocacy, and menstrual health equity.";

function openMenuOrScrollToHero(): void {
  const menuBtn = document.querySelector(".ad-nav__menu-btn") as HTMLButtonElement | null;
  if (menuBtn) {
    const visible = menuBtn.offsetParent !== null && window.getComputedStyle(menuBtn).display !== "none";
    if (visible) {
      menuBtn.click();
      return;
    }
  }
  document.getElementById("ad-home-main-hero")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Minimal centered “landing” band (reference: Keni-style hero strip) above the split hero.
 * Copy pulls from the same homepage **Hero Section** / **hero** CMS block as {@link Hero}.
 */
export default function HomeLandingStrip() {
  const vPrimary = useHomepageSectionValues("hero_section");
  const vFallback = useHomepageSectionValues("hero");
  const v = useMemo(() => ({ ...vFallback, ...vPrimary }), [vPrimary, vFallback]);

  const nameFirst = pickCms(v, "name_first", "first_name", "given_name") || "Able";
  const nameSecond = pickCms(v, "name_second", "last_name", "surname") || "Delalie";
  const bio = pickCms(v, "description", "bio", "intro", "body", "text") || DEFAULT_BIO;
  const tagline =
    pickCms(v, "landing_tagline", "tagline", "strapline", "subtitle", "kicker_line") || bio;

  return (
    <section className="ad-home-landing" aria-labelledby="ad-home-landing-title">
      <div className="ad-home-landing__inner">
        <img
          className="ad-home-landing__logo"
          src={logoPrimaryNavy}
          alt=""
          decoding="async"
          aria-hidden
        />

        <h1 id="ad-home-landing-title" className="ad-home-landing__name">
          {nameFirst} {nameSecond}
        </h1>

        <p className="ad-home-landing__tagline">{tagline}</p>

        <button type="button" className="ad-home-landing__menu-btn" onClick={openMenuOrScrollToHero}>
          Menu +
        </button>

        <ul className="ad-home-landing__social" aria-label="Social profiles">
          {socialLinks.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.link}>
                <a href={item.link} target="_blank" rel="noopener noreferrer" aria-label={item.label}>
                  <Icon />
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { logoPrimaryNavy } from "../config/brand";
import { socialLinks } from "../config/social";
import { SITE_FOOTER_TAGLINE } from "../content/siteTagline";
import { apiUrl } from "../lib/apiUrl";

const workLinks = [
  { id: "work-with-me", label: "Work with me", to: "/work-with-me" },
  { id: "work-speaker", label: "Book as speaker", to: "/contact" },
  { id: "work-brand", label: "Brand partnerships", to: "/contact" },
  { id: "work-contact", label: "Contact page", to: "/contact" },
] as const;

export default function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(apiUrl("/api/newsletter/subscribe"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setMessage("Successfully subscribed! Check your email.");
        setEmail("");
      } else {
        await res.json().catch(() => null);
        setMessage("Subscription failed. Please try again.");
      }
    } catch (error) {
      setMessage("Error subscribing. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const msgClass =
    message && (message.includes("failed") || message.includes("Error"))
      ? "ad-site-footer__msg ad-site-footer__msg--err"
      : "ad-site-footer__msg ad-site-footer__msg--ok";

  return (
    <footer className="ad-site-footer" id="site-footer" role="contentinfo">
      <div className="ad-site-footer__brand">
        <div className="ad-container ad-site-footer__brand-inner">
          <img className="ad-site-footer__logo" src={logoPrimaryNavy} alt="Able Delalie" decoding="async" />
          <p className="ad-site-footer__tagline">{SITE_FOOTER_TAGLINE}</p>
        </div>

        <nav className="ad-site-footer__social-rail" aria-label="Social profiles">
          <ul
            className="ad-site-footer__social-rail-list"
            style={{ gridTemplateColumns: `repeat(${socialLinks.length}, minmax(0, 1fr))` }}
          >
            {socialLinks.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.label} className="ad-site-footer__social-rail-item">
                  <a
                    className="ad-site-footer__social-rail-link"
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                  >
                    <Icon />
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="ad-site-footer__lower">
        <div className="ad-container">
          <div className="ad-site-footer__grid">
            <div className="ad-site-footer__newsletter" aria-labelledby="footer-newsletter-heading">
              <p className="ad-site-footer__eyebrow">Newsletter</p>
              <h2 id="footer-newsletter-heading" className="ad-site-footer__heading">
                Short reads on health, policy, and equity.
              </h2>
              <p className="ad-site-footer__lede">No spam — just signal.</p>

              <form className="ad-site-footer__form" onSubmit={handleSubscribe}>
                <label className="ad-site-footer__label" htmlFor="site-footer-email">
                  Email address
                </label>
                <div className="ad-site-footer__form-row">
                  <input
                    id="site-footer-email"
                    className="ad-site-footer__input"
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button className="ad-site-footer__submit" type="submit" disabled={loading}>
                    {loading ? "…" : "Subscribe"}
                  </button>
                </div>
              </form>

              {message ? <p className={msgClass}>{message}</p> : null}
            </div>

            <div className="ad-site-footer__collab">
              <p id="footer-collab-heading" className="ad-site-footer__eyebrow">
                Collaborate
              </p>
              <nav className="ad-site-footer__work-nav" aria-labelledby="footer-collab-heading">
                <ul className="ad-site-footer__work-list">
                  {workLinks.map((item) => (
                    <li key={item.id}>
                      <Link className="ad-site-footer__work-link" to={item.to}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>

          <p className="ad-site-footer__meta">© {new Date().getFullYear()} Able Delalie. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

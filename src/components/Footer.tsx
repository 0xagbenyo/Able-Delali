import { useState } from "react";
import { Link } from "react-router-dom";
import { socialLinks } from "../config/social";

const workLinks = [
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
      const res = await fetch("/api/newsletter/subscribe", {
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
      ? "ad-footer__msg ad-footer__msg--err"
      : "ad-footer__msg ad-footer__msg--ok";

  return (
    <footer className="ad-footer">
      <div className="ad-container ad-footer__grid">
        <div className="ad-footer__newsletter">
          <p className="ad-footer__eyebrow">Newsletter</p>
          <h2 className="ad-footer__title">Short reads on health, policy, and equity.</h2>
          <p className="ad-footer__text">No spam — just signal.</p>

          <form className="ad-footer__form" onSubmit={handleSubscribe}>
            <input
              className="ad-footer__input"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button className="ad-footer__submit" type="submit" disabled={loading}>
              {loading ? "…" : "Subscribe"}
            </button>
          </form>

          {message ? <p className={msgClass}>{message}</p> : null}
        </div>

        <aside className="ad-footer__connect" aria-label="Collaboration and social">
          <p id="footer-collab-heading" className="ad-footer__connect-sub">
            Collaborate
          </p>
          <nav className="ad-footer__work-nav" aria-labelledby="footer-collab-heading">
            {workLinks.map((item, i) => (
              <span key={item.id} className="ad-footer__work-item">
                {i > 0 ? (
                  <span className="ad-footer__work-sep" aria-hidden>
                    ·
                  </span>
                ) : null}
                <Link className="ad-footer__work-link" to={item.to}>
                  {item.label}
                </Link>
              </span>
            ))}
          </nav>

          <p className="ad-footer__connect-sub ad-footer__connect-sub--social">Follow</p>
          <div className="ad-footer__social">
            {socialLinks.map((item, i) => {
              const Icon = item.icon;
              return (
                <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" aria-label={item.label}>
                  <Icon />
                </a>
              );
            })}
          </div>
        </aside>
      </div>

      <div className="ad-container">
        <div className="ad-footer__rule" />
        <div className="ad-footer__meta">© {new Date().getFullYear()} Able Delalie. All rights reserved.</div>
      </div>
    </footer>
  );
}

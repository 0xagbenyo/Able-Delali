import { useState } from "react";
import { apiUrl } from "../lib/apiUrl";

/**
 * List signup (email only) — posts to `/api/newsletter/subscribe`.
 * Sits above the free-book / reader-gift band on the homepage.
 */
export default function HomeSubscribeBanner() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
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
        setMessage("You're subscribed — watch your inbox.");
        setEmail("");
      } else {
        setMessage("Something went wrong. Please try again.");
      }
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const msgClass =
    message && message.includes("wrong")
      ? "cb-ref-subscribe-banner__msg cb-ref-subscribe-banner__msg--err"
      : "cb-ref-subscribe-banner__msg cb-ref-subscribe-banner__msg--ok";

  return (
    <section className="cb-ref-subscribe-banner" id="newsletter" aria-labelledby="cb-ref-subscribe-banner-heading">
      <div className="cb-ref-subscribe-banner__inner">
        <div className="cb-ref-subscribe-banner__copy">
          <h2 id="cb-ref-subscribe-banner-heading" className="cb-ref-subscribe-banner__title">
            <span className="cb-ref-subscribe-banner__title-sans">Join the</span>{" "}
            <span className="cb-ref-subscribe-banner__title-serif">Able Newsletter</span>
          </h2>
          <p className="cb-ref-subscribe-banner__lead">
            Short reads on health, policy, and menstrual health equity—delivered when new pieces land. No spam, just
            signal.
          </p>
        </div>

        <form className="cb-ref-subscribe-banner__form" onSubmit={handleSubmit}>
          <label className="cb-ref-subscribe-banner__label" htmlFor="cb-ref-subscribe-banner-email">
            Email address
          </label>
          <div className="cb-ref-subscribe-banner__row">
            <input
              id="cb-ref-subscribe-banner-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="cb-ref-subscribe-banner__input"
            />
            <button type="submit" className="cb-ref-subscribe-banner__submit" disabled={loading}>
              {loading ? "Signing up…" : "Sign me up!"}
            </button>
          </div>
          {message ? <p className={msgClass}>{message}</p> : null}
        </form>
      </div>
    </section>
  );
}

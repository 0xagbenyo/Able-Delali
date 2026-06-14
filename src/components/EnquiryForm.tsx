import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { apiUrl } from "../lib/apiUrl";

const TOPICS = [
  { value: "general", label: "General enquiry" },
  { value: "pastor", label: "Leadership & voice" },
  { value: "data-analyst", label: "Public health & policy" },
  { value: "writer", label: "Writing & advocacy" },
] as const;

type TopicValue = (typeof TOPICS)[number]["value"];

function isTopicValue(v: string): v is TopicValue {
  return TOPICS.some((t) => t.value === v);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EnquiryForm() {
  const location = useLocation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState<TopicValue>("general");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  useEffect(() => {
    const st = location.state as { enquiryTopic?: string } | null;
    const t = st?.enquiryTopic;
    if (t && isTopicValue(t)) {
      setTopic(t);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const nameT = name.trim();
    const emailT = email.trim();
    const phoneT = phone.trim();
    const messageT = message.trim();

    if (!nameT) {
      setStatus({ type: "err", text: "Please add your name or organization." });
      setLoading(false);
      return;
    }

    if (!emailT && !phoneT) {
      setStatus({
        type: "err",
        text: "Please enter either an email or a phone number so we can reach you (both is fine too).",
      });
      setLoading(false);
      return;
    }

    if (emailT && !EMAIL_RE.test(emailT)) {
      setStatus({ type: "err", text: "That email doesn’t look valid — please check it." });
      setLoading(false);
      return;
    }

    if (!messageT) {
      setStatus({
        type: "err",
        text: "Please tell us what you’d like us to know in the message field.",
      });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(apiUrl("/api/enquiry"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameT,
          email: emailT,
          phone: phoneT,
          topic,
          message: messageT,
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      const raw = await res.text();
      let data: {
        ok?: boolean;
        reason?: string;
        detail?: string;
        message?: string;
        hint?: string;
      } = {};

      if (contentType.includes("application/json")) {
        try {
          data = JSON.parse(raw) as typeof data;
        } catch {
          data = {};
        }
      }

      if (res.ok && data.ok) {
        setStatus({
          type: "ok",
          text: "Thank you — your message was sent. I’ll be in touch soon.",
        });
        setName("");
        setEmail("");
        setPhone("");
        setMessage("");
        setTopic("general");
      } else {
        const reason = data.reason;
        const erpDetail =
          typeof data.detail === "string" ? data.detail.trim() : "";

        let text =
          "Something went wrong. Please check your details and try again.";

        if (!contentType.includes("application/json")) {
          text =
            "We couldn’t send your message right now. Please refresh and try again, or email us directly.";
        } else if (typeof data.message === "string" && data.message && !reason) {
          text =
            import.meta.env.DEV
              ? data.message
              : "Something went wrong. Please try again later.";
        } else if (reason === "missing_name") {
          text = "Please add your name or organization.";
        } else if (reason === "missing_contact") {
          text =
            "Please enter either an email or a phone number so we can reach you.";
        } else if (reason === "invalid_email") {
          text = "Please enter a valid email address.";
        } else if (reason === "missing_feedback") {
          text = "Please fill in what you’d like us to know.";
        } else if (reason === "feedback_too_long") {
          text = "Your message is too long. Please shorten it and try again.";
        } else if (reason === "erpnext_not_configured") {
          text =
            "We couldn’t send your message right now. Please try again later or email us directly.";
        } else if (reason === "erpnext_create_failed") {
          text =
            "We couldn’t save your message. Please try again or email us directly.";
        } else if (reason === "erpnext" && erpDetail) {
          const line = erpDetail.split("\n")[0] ?? erpDetail;
          const cleaned = line
            .replace(/^ERPNext API error \(\d+\):\s*/i, "")
            .trim();
          if (
            import.meta.env.DEV &&
            cleaned.length > 0 &&
            cleaned.length < 320
          ) {
            text = `Could not save: ${cleaned}`;
          } else {
            text =
              "We couldn’t save your message. Please try again or email us directly.";
          }
        } else if (reason === "server_error") {
          text =
            typeof data.hint === "string" && import.meta.env.DEV
              ? `Server error: ${data.hint}`
              : "Something went wrong. Please try again or email us directly.";
        }

        setStatus({ type: "err", text });
      }
    } catch {
      setStatus({
        type: "err",
        text: "Network error. Please try again in a moment.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="ad-enquiry-form" onSubmit={handleSubmit}>
      <div className="ad-field">
        <label htmlFor="enquiry-name">Name / Organization</label>
        <input
          id="enquiry-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="ad-field-grid">
        <div className="ad-field">
          <label htmlFor="enquiry-email">Email</label>
          <input
            id="enquiry-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-label="Email (optional if phone provided)"
          />
        </div>
        <div className="ad-field">
          <label htmlFor="enquiry-phone">Phone number</label>
          <input
            id="enquiry-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+233 …"
            aria-label="Phone number (optional if email provided)"
          />
        </div>
      </div>
      <p className="ad-field-hint">
        Whichever you fill in first is fine — we only need <strong>one</strong> way to reach you (email{" "}
        <em>or</em> phone). Both is welcome too.
      </p>

      <div className="ad-field">
        <label htmlFor="enquiry-topic">Feedback type</label>
        <select
          id="enquiry-topic"
          name="topic"
          value={topic}
          onChange={(e) => {
            const v = e.target.value;
            if (isTopicValue(v)) setTopic(v);
          }}
        >
          {TOPICS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="ad-field">
        <label htmlFor="enquiry-message">
          What do you want us to know? <span style={{ color: "var(--ad-red)", fontWeight: 700 }}>*</span>
        </label>
        <textarea
          id="enquiry-message"
          name="message"
          required
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Your question, idea, or context…"
        />
      </div>

      {status ? (
        <p
          role="status"
          className={`ad-status ad-status--${status.type === "ok" ? "ok" : "err"}`}
        >
          {status.text}
        </p>
      ) : null}

      <button type="submit" className="ad-btn ad-btn--navy" disabled={loading}>
        {loading ? "Sending…" : "Submit"}
      </button>
    </form>
  );
}

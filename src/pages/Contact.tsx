import PageChrome from "../components/PageChrome";
import EnquiryForm from "../components/EnquiryForm";

/**
 * Standalone contact / feedback page.
 */
export default function Contact() {
  return (
    <PageChrome>
      <header className="ad-page-head">
        <div className="ad-container">
          <p className="ad-page-head__eyebrow">Contact</p>
          <h1 className="ad-page-head__title">Let&apos;s connect</h1>
          <p className="ad-page-head__lead">
            Tell us what&apos;s on your mind. Add either an email or a phone number (or both) so we can get
            back to you.
          </p>
        </div>
      </header>

      <div className="ad-container ad-form-shell" id="contact">
        <div className="ad-form-card">
          <EnquiryForm />
        </div>
      </div>
    </PageChrome>
  );
}

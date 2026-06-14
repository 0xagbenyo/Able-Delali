import type { CSSProperties, ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

type PageChromeProps = {
  children: ReactNode;
  /** Omit footer on sparse loading states if needed */
  showFooter?: boolean;
  className?: string;
  style?: CSSProperties;
};

/** Shared inner-page shell: fixed nav offset, main column, footer. */
export default function PageChrome({ children, showFooter = true, className, style }: PageChromeProps) {
  const rootClass = ["page-with-fixed-nav", "ad-page", className].filter(Boolean).join(" ");
  return (
    <div className={rootClass} style={style}>
      <Navbar />
      <main className="ad-page__main">{children}</main>
      {showFooter ? <Footer /> : null}
    </div>
  );
}
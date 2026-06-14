import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import useResponsive from "../hooks/useResponsive";
import { useNavigate, useLocation } from "react-router-dom";
import { logoPrimaryNavy } from "../config/brand";

const IDLE_HIDE_MS = 3200;
const TOP_THRESHOLD_PX = 12;

function isAtDocumentTop(): boolean {
  if (typeof window === "undefined") return true;
  return window.scrollY < TOP_THRESHOLD_PX;
}

type SimpleNav = { kind: "simple"; label: string } & ({ id: string } | { path: string });
type DropdownNav = {
  kind: "dropdown";
  label: string;
  items: { label: string; path: string }[];
};

type LeftNavItem = SimpleNav | DropdownNav;

const navLeft: LeftNavItem[] = [
  { kind: "simple", label: "Home", id: "home" },
  { kind: "simple", label: "About", path: "/about" },
  { kind: "simple", label: "Speaking and media", path: "/speaking-and-media" },
  { kind: "simple", label: "Books", path: "/books" },
];

type SheetRow = {
  key: string;
  label: string;
  nested?: boolean;
} & ({ id: string; path?: never } | { path: string; id?: never });

const navRight: readonly ({ label: string } & ({ id: string } | { path: string }))[] = [
  { label: "Journal", path: "/blog" },
  { label: "Newsletter", path: "/#newsletter" },
];

function buildSheetRows(): SheetRow[] {
  const rows: SheetRow[] = [];
  for (const item of navLeft) {
    if (item.kind === "simple") {
      rows.push(
        "path" in item
          ? { key: item.path, label: item.label, path: item.path }
          : { key: item.id, label: item.label, id: item.id },
      );
    } else {
      for (let i = 0; i < item.items.length; i++) {
        const sub = item.items[i]!;
        rows.push({
          key: sub.path,
          label: sub.label,
          path: sub.path,
          nested: i > 0,
        });
      }
    }
  }
  for (const item of navRight) {
    rows.push(
      "path" in item
        ? { key: item.path, label: item.label, path: item.path }
        : { key: item.id, label: item.label, id: item.id },
    );
  }
  return rows;
}

const sheetNavItems: SheetRow[] = buildSheetRows();

function isAboutDropdownActive(pathname: string): boolean {
  return pathname === "/about";
}

export default function Navbar() {
  const { isDesktop } = useResponsive();
  /** Matches `.ad-nav--cb`: menu icon shows below 1024px; sheet must open for that entire range. */
  const useNavSheet = !isDesktop;
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [barVisible, setBarVisible] = useState(() => isAtDocumentTop());

  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuOpenRef = useRef(menuOpen);
  const atScrollTopRef = useRef(isAtDocumentTop());
  menuOpenRef.current = menuOpen;

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    clearHideTimer();
    if (menuOpenRef.current) return;
    if (atScrollTopRef.current) return;
    hideTimerRef.current = window.setTimeout(() => {
      setBarVisible(false);
      setMenuOpen(false);
      hideTimerRef.current = null;
    }, IDLE_HIDE_MS);
  }, [clearHideTimer]);

  const wake = useCallback(() => {
    setBarVisible(true);
    if (!menuOpenRef.current) {
      scheduleHide();
    }
  }, [scheduleHide]);

  const syncScrollTopAndBar = useCallback(() => {
    atScrollTopRef.current = isAtDocumentTop();
    if (atScrollTopRef.current) {
      setBarVisible(true);
      clearHideTimer();
    } else {
      wake();
    }
  }, [wake, clearHideTimer]);

  useEffect(() => {
    setMenuOpen(false);
    clearHideTimer();
    atScrollTopRef.current = isAtDocumentTop();
    setBarVisible(atScrollTopRef.current);
  }, [location.pathname, clearHideTimer]);

  useEffect(() => {
    const passive = { passive: true } as const;
    window.addEventListener("scroll", syncScrollTopAndBar, passive);
    document.addEventListener("touchstart", syncScrollTopAndBar, passive);
    document.addEventListener("touchmove", syncScrollTopAndBar, passive);
    document.addEventListener("wheel", syncScrollTopAndBar, passive);
    document.addEventListener("pointerdown", syncScrollTopAndBar, passive);
    return () => {
      window.removeEventListener("scroll", syncScrollTopAndBar);
      document.removeEventListener("touchstart", syncScrollTopAndBar);
      document.removeEventListener("touchmove", syncScrollTopAndBar);
      document.removeEventListener("wheel", syncScrollTopAndBar);
      document.removeEventListener("pointerdown", syncScrollTopAndBar);
      clearHideTimer();
    };
  }, [syncScrollTopAndBar, clearHideTimer]);

  useEffect(() => {
    if (menuOpen) {
      clearHideTimer();
      setBarVisible(true);
    } else {
      scheduleHide();
    }
  }, [menuOpen, clearHideTimer, scheduleHide]);

  useEffect(() => {
    if (!useNavSheet) {
      document.body.style.overflow = "";
      return;
    }
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, useNavSheet]);

  const goToSection = (id: string | undefined, path?: string) => {
    if (path) {
      const hashIdx = path.indexOf("#");
      if (hashIdx >= 0) {
        const pathname = path.slice(0, hashIdx) || "/";
        const bareHash = path.slice(hashIdx + 1).replace(/^#/, "");
        navigate({
          pathname,
          hash: bareHash ? `#${bareHash}` : "",
        });
        return;
      }
      navigate(path);
      return;
    }
    if (!id) return;
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const hidden = !barVisible;
  const closeMenu = () => setMenuOpen(false);

  const sheetOverlay =
    useNavSheet && menuOpen ? (
      <>
        <button type="button" className="ad-nav__backdrop" aria-label="Close menu" onClick={closeMenu} />
        <aside
          id="ad-nav-mobile-sheet"
          className="ad-nav__sheet"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className="ad-nav__sheet-head">
            Menu
            <button type="button" className="ad-nav__sheet-close" aria-label="Close" onClick={closeMenu}>
              ×
            </button>
          </div>
          <div className="ad-nav__sheet-list">
            {sheetNavItems.map((row) => (
              <button
                key={row.key}
                type="button"
                className={`ad-nav__sheet-item${row.nested ? " ad-nav__sheet-item--nested" : ""}`}
                onClick={() => {
                  goToSection("id" in row ? row.id : undefined, "path" in row ? row.path : undefined);
                  closeMenu();
                }}
              >
                {row.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="ad-nav__sheet-cta"
            onClick={() => {
              navigate("/contact");
              closeMenu();
            }}
          >
            Contact
          </button>
        </aside>
      </>
    ) : null;

  const pathname = location.pathname;

  return (
    <header className={`ad-nav ad-nav--editorial ad-nav--cb${hidden ? " ad-nav--hidden" : ""}`} aria-hidden={hidden}>
      <div className="ad-container ad-nav__bar cb-nav__bar">
        <button
          type="button"
          className="ad-nav__menu-btn cb-nav__menu"
          aria-expanded={menuOpen}
          aria-controls={menuOpen ? "ad-nav-mobile-sheet" : undefined}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          tabIndex={hidden ? -1 : 0}
          onClick={() => setMenuOpen((o) => !o)}
        >
          {menuOpen ? "×" : "☰"}
        </button>

        <nav className="cb-nav__left" aria-label="Primary">
          {navLeft.map((item) => {
            if (item.kind === "simple") {
              return (
                <button
                  key={"path" in item ? item.path : item.id}
                  type="button"
                  className="cb-nav__link"
                  tabIndex={hidden ? -1 : 0}
                  onClick={() => goToSection("id" in item ? item.id : undefined, "path" in item ? item.path : undefined)}
                >
                  {item.label}
                </button>
              );
            }
            const aboutActive = isAboutDropdownActive(pathname);
            return (
              <div
                key={item.label}
                className={`cb-nav__dropdown${aboutActive ? " cb-nav__dropdown--active" : ""}`}
              >
                <button
                  type="button"
                  className="cb-nav__link cb-nav__dropdown-trigger"
                  aria-haspopup="true"
                  tabIndex={hidden ? -1 : 0}
                >
                  {item.label}
                  <span className="cb-nav__dropdown-caret" aria-hidden>
                    {" "}
                    ▾
                  </span>
                </button>
                <div className="cb-nav__dropdown-panel" role="menu" aria-label={`${item.label} links`}>
                  {item.items.map((sub) => (
                    <button
                      key={sub.path}
                      type="button"
                      role="menuitem"
                      className="cb-nav__dropdown-item"
                      tabIndex={hidden ? -1 : 0}
                      onClick={() => goToSection(undefined, sub.path)}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <button
          type="button"
          className="ad-nav__logo cb-nav__logo"
          aria-label="Go to home page"
          tabIndex={hidden ? -1 : 0}
          onClick={() => {
            if (location.pathname !== "/") {
              navigate("/");
            } else {
              document.getElementById("home")?.scrollIntoView({ behavior: "smooth" });
            }
          }}
        >
          <img src={logoPrimaryNavy} alt="Able Delalie" />
        </button>

        <nav className="cb-nav__right" aria-label="Primary continued">
          {navRight.map((item) => (
            <button
              key={"path" in item ? item.path : item.id}
              type="button"
              className="cb-nav__link"
              tabIndex={hidden ? -1 : 0}
              onClick={() => goToSection("id" in item ? item.id : undefined, "path" in item ? item.path : undefined)}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            className="ad-nav__cta"
            tabIndex={hidden ? -1 : 0}
            onClick={() => navigate("/contact")}
          >
            Contact
          </button>
        </nav>

        <div className="cb-nav__spacer" aria-hidden />
      </div>

      {sheetOverlay && typeof document !== "undefined" ? createPortal(sheetOverlay, document.body) : null}
    </header>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useResponsive from "../hooks/useResponsive";
import PageChrome from "../components/PageChrome";
import aboutContent from "../content/aboutintro.json";
import { ablePortrait, rhodaImage1, rhodaImage2, patternTexture } from "../config/brand";
import { resolveErpPublicUrl } from "../config/erpnextPublic";
import { pickCms } from "../lib/cmsPick";
import { apiUrl, assertApiJsonResponse } from "../lib/apiUrl";

const DEFAULT_FAMILY_INTRO =
  typeof aboutContent?.familyIntro === "string" && aboutContent.familyIntro.trim().length > 0
    ? aboutContent.familyIntro
    : "Able Delalie is a pharmacist and public health voice bridging practice and policy.";

const DEFAULT_SLIDES = [ablePortrait, rhodaImage1, rhodaImage2, patternTexture] as const;

type SectionPayload = { key: string; values: Record<string, string> };

function parseSlideUrls(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  const s = raw.trim();
  try {
    const j = JSON.parse(s) as unknown;
    if (Array.isArray(j)) {
      return j.map((x) => String(x).trim()).filter(Boolean);
    }
  } catch {
    /* plain list */
  }
  return s
    .split(/[\n|,]+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

/** ERPNext Web Template Attach Image fields (Page Builder), in carousel order. */
function collectAttachImagePaths(values: Record<string, string>): string[] {
  const keys = [
    ["image"],
    ["image2", "image_2"],
    ["image3", "image_3"],
    ["image4", "image_4"],
  ] as const;
  const out: string[] = [];
  for (const group of keys) {
    let raw: string | undefined;
    for (const k of group) {
      raw = pickCms(values, k);
      if (raw) break;
    }
    if (raw) out.push(raw);
  }
  return out;
}

function mergeIntroValues(sections: SectionPayload[]): Record<string, string> {
  const m = new Map<string, Record<string, string>>();
  for (const row of sections) {
    m.set(row.key, row.values);
  }
  const about = m.get("about") ?? {};
  const intro = m.get("about_intro") ?? {};
  return { ...about, ...intro };
}

export default function About() {
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [introValues, setIntroValues] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiUrl("/api/about/sections"), { cache: "no-store" });
        assertApiJsonResponse(res, "About sections");
        const data = (await res.json()) as {
          ok?: boolean;
          sections?: SectionPayload[];
          error?: string;
        };
        if (cancelled) return;
        const rows = Array.isArray(data.sections) ? data.sections : [];
        setIntroValues(mergeIntroValues(rows));
      } catch (e) {
        console.warn("[About] /api/about/sections failed, using built-in copy:", e);
        if (!cancelled) setIntroValues({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const eyebrow = pickCms(introValues, "eyebrow", "kicker", "label") || "About";
  const title = pickCms(introValues, "title", "heading", "h1") || "Who she is";
  const bodyRaw =
    pickCms(introValues, "description", "body", "text", "copy", "family_intro") || DEFAULT_FAMILY_INTRO;
  const body = typeof bodyRaw === "string" ? bodyRaw : String(bodyRaw);

  const slides = useMemo(() => {
    const fromAttach = collectAttachImagePaths(introValues)
      .map((u) => resolveErpPublicUrl(u))
      .filter(Boolean);
    if (fromAttach.length > 0) return fromAttach;

    const raw = pickCms(introValues, "slide_urls", "slides_json", "slides", "gallery_urls");
    const urls = parseSlideUrls(raw)
      .map((u) => resolveErpPublicUrl(u))
      .filter(Boolean);
    if (urls.length > 0) return urls;

    return [...DEFAULT_SLIDES];
  }, [introValues]);

  useEffect(() => {
    setIndex((i) => (slides.length > 0 && i >= slides.length ? 0 : i));
  }, [slides.length]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % Math.max(slides.length, 1));
    }, 4000);
    return () => window.clearInterval(interval);
  }, [slides.length]);

  const chips = [
    { label: "Journal", path: "/blog" },
    { label: "Books", path: "/books" },
    { label: "Contact", path: "/contact" },
  ] as const;

  return (
    <PageChrome>
      <div className="ad-container ad-section">
        <div className="ad-pillar-intro" style={{ marginBottom: 0 }}>
          <div className="ad-pillar-intro__media" style={{ minHeight: isMobile ? 320 : undefined }}>
            {slides.map((img, i) => (
              <img
                key={`${img}-${i}`}
                src={img}
                alt=""
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                  opacity: i === index ? 1 : 0,
                  transition: "opacity 1.2s ease",
                }}
              />
            ))}
          </div>

          <div className="ad-pillar-intro__panel">
            <p className="ad-page-head__eyebrow" style={{ marginBottom: 12 }}>
              {eyebrow}
            </p>
            <h1 className="ad-pillar-intro__title">{title}</h1>

            <div className="ad-prose" style={{ maxWidth: "none", margin: "20px 0 0" }}>
              {body.split("\n\n").map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            <div className="ad-chip-row" style={{ marginTop: 28 }}>
              {chips.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="ad-chip"
                  style={isMobile ? { width: "100%", textAlign: "center" } : undefined}
                  onClick={() => navigate(item.path)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageChrome>
  );
}

import { pickCms } from "../lib/cmsPick";
import { aboutIntroHeroImages } from "./aboutIntroImages";

export type AboutHeroSlide = {
  id: string;
  image: string;
  eyebrow: string;
  title: string;
  subtitle: string;
};

const ROTATING_COPY: ReadonlyArray<Pick<AboutHeroSlide, "eyebrow" | "title" | "subtitle">> = [
  {
    eyebrow: "Advocacy",
    title: "Health with equity",
    subtitle: "Menstrual health and fairer systems",
  },
  {
    eyebrow: "Evidence",
    title: "Clarity in public debate",
    subtitle: "Policy, pharmacy, and purpose",
  },
  {
    eyebrow: "Collaborate",
    title: "Better health outcomes",
    subtitle: "Speaking, writing, and partnerships",
  },
  {
    eyebrow: "Practice",
    title: "Pharmacy that serves people",
    subtitle: "Safety, access, and accountable care",
  },
  {
    eyebrow: "Policy",
    title: "Systems that deliver",
    subtitle: "Evidence turned into lasting change",
  },
];

type CmsHeroSlideRow = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  line2?: string;
  hero_subtitle?: string;
  image?: string;
  image_url?: string;
  image_index?: number;
};

function parseCmsHeroSlidesJson(raw: string | undefined): CmsHeroSlideRow[] | null {
  if (!raw?.trim()) return null;
  try {
    const j = JSON.parse(raw.trim()) as unknown;
    if (!Array.isArray(j)) return null;
    return j.filter((row) => row && typeof row === "object") as CmsHeroSlideRow[];
  } catch {
    return null;
  }
}

/**
 * Pair hero background images with headline copy.
 * CMS: optional `hero_slides_json` array; slide 0 defaults to `title` / `hero_subtitle` fields.
 * Images: `image2` … `image10` from About Intro (see aboutIntroImages.ts).
 */
export function buildAboutHeroSlides(
  images: string[],
  introValues: Record<string, string>,
): AboutHeroSlide[] {
  const defaultEyebrow = pickCms(introValues, "eyebrow", "kicker", "label") || "About";
  const defaultTitle = pickCms(introValues, "title", "heading", "h1") || "Who she is";
  const defaultSubtitle = (pickCms(introValues, "hero_subtitle", "hero_line_2", "subtitle") ?? "").trim();

  const cmsRows = parseCmsHeroSlidesJson(
    pickCms(introValues, "hero_slides_json", "hero_carousel_json"),
  );

  if (cmsRows && cmsRows.length > 0) {
    return cmsRows
      .map((row, i) => {
        const imageFromRow = (row.image_url ?? row.image ?? "").trim();
        const imageFromIndex =
          typeof row.image_index === "number" && images[row.image_index]
            ? images[row.image_index]!
            : "";
        const image = imageFromRow || imageFromIndex || images[i] || images[0] || "";
        const subtitle = (row.subtitle ?? row.line2 ?? row.hero_subtitle ?? "").trim();
        return {
          id: `cms-${i}`,
          image,
          eyebrow: row.eyebrow?.trim() || defaultEyebrow,
          title: row.title?.trim() || defaultTitle,
          subtitle,
        };
      })
      .filter((s) => s.image || s.title);
  }

  const imgs = aboutIntroHeroImages(images);
  if (imgs.length === 0) {
    return [
      {
        id: "0",
        image: "",
        eyebrow: defaultEyebrow,
        title: defaultTitle,
        subtitle: defaultSubtitle,
      },
    ];
  }

  return imgs.map((image, i) => {
    if (i === 0) {
      return {
        id: "0",
        image,
        eyebrow: defaultEyebrow,
        title: defaultTitle,
        subtitle: defaultSubtitle,
      };
    }
    const rotate = ROTATING_COPY[(i - 1) % ROTATING_COPY.length]!;
    return {
      id: String(i),
      image,
      eyebrow: rotate.eyebrow,
      title: rotate.title,
      subtitle: rotate.subtitle,
    };
  });
}

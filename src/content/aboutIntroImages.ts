import { pickCms } from "../lib/cmsPick";

/** ERPNext About Intro attach slots: `image`, `image2` … `image10`. */
export const ABOUT_INTRO_IMAGE_COUNT = 10;

function imageSlotKeys(index: number): string[] {
  if (index === 0) return ["image"];
  const n = index + 1;
  return [`image${n}`, `image_${n}`];
}

/** Ordered attach paths from About Intro (`image` … `image10`). Missing slots are `""`. */
export function collectAboutIntroImagePaths(values: Record<string, string>): string[] {
  const out: string[] = [];
  for (let i = 0; i < ABOUT_INTRO_IMAGE_COUNT; i++) {
    let raw: string | undefined;
    for (const k of imageSlotKeys(i)) {
      raw = pickCms(values, k);
      if (raw) break;
    }
    out.push(raw?.trim() ?? "");
  }
  return out;
}

/** `image` — arch portrait in the About split. */
export function aboutIntroArchImage(slides: string[]): string {
  return slides[0] ?? "";
}

/** `image2` … `image10` — hero background carousel. */
export function aboutIntroHeroImages(slides: string[]): string[] {
  return slides.slice(1).filter(Boolean);
}

/** `image5` … `image7` for service cards, with fallbacks. */
export function aboutIntroServiceImages(slides: string[]): [string, string, string] {
  const pick = (index: number, fallbacks: number[]) => {
    if (slides[index]) return slides[index]!;
    for (const f of fallbacks) {
      if (slides[f]) return slides[f]!;
    }
    return "";
  };
  return [pick(4, [1, 2, 0]), pick(5, [2, 3, 0]), pick(6, [3, 1, 0])];
}

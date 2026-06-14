/**
 * Press kit defaults for `/press-kit` when ERPNext has no images yet or the API fails.
 * Primary copy is shared with ERP seed in **`pressKitCopy.ts`**.
 */
import { ablePortrait, bookPlaceholder, patternTexture } from "../config/brand";
import * as copy from "./pressKitCopy";

export type PressHeadshot = {
  src: string;
  alt: string;
  credit: string;
};

export type PressBioBlock = {
  usage: string;
  body: string;
};

export const pressKitData = {
  metaTitle: "Press kit — Able Delalie",
  metaDescription:
    "Headshots, approved headline, and short, mid-length, and full bios for media, events, and speaker materials.",

  pageHeading: copy.PRESS_KIT_PAGE_HEADING,
  pageIntro: copy.PRESS_KIT_PAGE_INTRO,
  preferredHeadline: copy.PRESS_KIT_PREFERRED_HEADLINE,

  shortBio: {
    usage: copy.PRESS_KIT_SHORT_USAGE,
    body: copy.PRESS_KIT_SHORT_BODY,
  } satisfies PressBioBlock,

  midBio: {
    usage: copy.PRESS_KIT_MID_USAGE,
    body: copy.PRESS_KIT_MID_BODY,
  } satisfies PressBioBlock,

  fullBio: {
    usage: copy.PRESS_KIT_FULL_USAGE,
    body: copy.PRESS_KIT_FULL_BODY,
  } satisfies PressBioBlock,

  headshots: [
    {
      src: ablePortrait,
      alt: "Able Delalie — portrait",
      credit: "Brand photography — Able Delalie press assets",
    },
    {
      src: bookPlaceholder,
      alt: "Able Delalie — secondary brand texture",
      credit: "Brand pattern — Able Delalie Brand Book",
    },
    {
      src: patternTexture,
      alt: "Able Delalie — brand pattern (use where a neutral visual is needed)",
      credit: "Able Delalie brand pattern — Brand Book",
    },
  ] as const satisfies readonly PressHeadshot[],

  socialHandles: [
    { label: "Facebook", handle: "facebook.com/share/1Ha68oisNs", url: "https://www.facebook.com/share/1Ha68oisNs/" },
    { label: "Instagram", handle: "@abledelalie", url: "https://www.instagram.com/abledelalie" },
    { label: "X", handle: "@abledelalie", url: "https://x.com/abledelalie" },
  ] as const,
};

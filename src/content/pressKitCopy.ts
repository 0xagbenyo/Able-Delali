/**
 * Plain-text press kit copy (no image imports) — used by ERP seed + React fallbacks.
 * Keep in sync with marketing / Brand Guide when you update wording.
 */
export const PRESS_KIT_PAGE_HEADING = "Press kit";

export const PRESS_KIT_PAGE_INTRO =
  "This press kit contains headshots and profiles of different lengths for **Able Delalie** — pharmacist, public health advocate, and writer — for media, programmes, and event materials.";

export const PRESS_KIT_PREFERRED_HEADLINE =
  "Able Delalie | Pharmacist & public health voice | Evidence, policy & menstrual health equity";

export const PRESS_KIT_SHORT_USAGE = "For event programs, conference directories, and short introductions.";
export const PRESS_KIT_SHORT_BODY = [
  "**Able Delalie** is a pharmacist and public health professional whose work bridges clinical practice, policy, and public conversation — with a through-line of menstrual health equity and fairer health systems.",
  "She writes and speaks with warmth and rigour: long-form trust matters more to her than visibility for its own sake. Her advocacy is grounded in evidence, listening in communities, and language that respects both science and dignity.",
].join("\n\n");

export const PRESS_KIT_MID_USAGE = "For speaker profiles, event websites, and award nominations.";
export const PRESS_KIT_MID_BODY = [
  "**Able Delalie** is a pharmacist and public health voice working where practice meets policy — especially on menstrual health equity, health workforce issues, and how ordinary people experience the health system.",
  "Her writing appears in the site journal (Stat Dose and related series), where she connects Ghanaian and African health realities to wider debates on governance, institutions, and accountability. Away from screens, she is grounded by family, faith, and the same curiosity that first pulled her toward medicine: making complex things clearer for someone who needs an answer today.",
  "She welcomes collaborations and invitations through her contact page.",
].join("\n\n");

export const PRESS_KIT_FULL_USAGE =
  "For media features, speaker bureau submissions, and institutional profiles.";
export const PRESS_KIT_FULL_BODY = [
  "**Able Delalie** is a pharmacist and advocate whose work sits at the intersection of clinical practice, public health, and public conversation. She cares deeply about how people experience care — particularly menstrual health and equity — and about how evidence is used in debates that shape policy and lives.",
  "Her story is not a list of job titles stitched together. It is years of listening in clinics and communities, reading the research, and choosing language that honours both rigour and dignity. She shows up with patience, precision, and a bias toward outcomes that actually improve lives.",
  "**Themes she is known for in her public writing include:** health systems and workforce pressures in Ghana and the region; menstrual health equity; civic and policy commentary grounded in professional ethics; and long-form essays that treat readers as thoughtful partners, not as an audience to perform for.",
  "For press, speaking requests, and brand partnerships, email **hello@abledelalie.com** or use the **Contact** page on this site.",
].join("\n\n");

export const PRESS_KIT_SOCIAL_HANDLES_JSON = JSON.stringify([
  {
    label: "Facebook",
    handle: "facebook.com/share/1Ha68oisNs",
    url: "https://www.facebook.com/share/1Ha68oisNs/",
  },
  { label: "Instagram", handle: "@abledelalie", url: "https://www.instagram.com/abledelalie" },
  { label: "X", handle: "@abledelalie", url: "https://x.com/abledelalie" },
]);

/** Field names must match Web Template `fieldname` values in ERPNext. */
export function buildPressKitErpSeedValues(): Record<string, string> {
  return {
    page_heading: PRESS_KIT_PAGE_HEADING,
    page_intro: PRESS_KIT_PAGE_INTRO,
    preferred_headline: PRESS_KIT_PREFERRED_HEADLINE,
    short_bio_usage: PRESS_KIT_SHORT_USAGE,
    short_bio: PRESS_KIT_SHORT_BODY,
    mid_bio_usage: PRESS_KIT_MID_USAGE,
    mid_bio: PRESS_KIT_MID_BODY,
    full_bio_usage: PRESS_KIT_FULL_USAGE,
    full_bio: PRESS_KIT_FULL_BODY,
    social_handles_json: PRESS_KIT_SOCIAL_HANDLES_JSON,
  };
}

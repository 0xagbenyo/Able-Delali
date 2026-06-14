/**
 * Default homepage CMS seeds for `provision-homepage.ts`.
 * Keep aligned with `src/config/homeEditorial.ts`, `src/content/about.json`,
 * `src/components/Hero.tsx`, `src/content/facebookPublicThemes.ts`, etc.
 */
export const MARQUEE_CHUNKS = [
  "Pharmacist",
  "Public health",
  "Evidence & policy",
  "Menstrual health equity",
  "Leadership",
  "Writing & advocacy",
  "Practice meets policy",
] as const;

export const HERO_STATS = [
  { valueMain: "15", valueAccent: "+", sub: "Years bridging care & policy" },
  { valueMain: "UK", valueAccent: "+", sub: "Talks, panels & partnerships" },
  { valueMain: "50", valueAccent: "+", sub: "Essays, rooms & programmes shaped" },
  { valueMain: "1", valueAccent: "", sub: "North star: menstrual health equity" },
] as const;

export const DEFAULT_ROLE_TAGS = [
  "Pharmacist",
  "Public health",
  "Advocate",
  "Writer",
] as const;

export const DEFAULT_HERO_BIO =
  "Pharmacist and public health voice bridging practice and policy — strengthening health systems through evidence, advocacy, and menstrual health equity.";

export const ABOUT_PARAGRAPHS = [
  "Able Delalie is a pharmacist and advocate whose work sits where clinical practice meets public conversation — especially on menstrual health equity and fairer health systems.",
  "She writes and speaks from experience, not performance: long-form trust, warmth, and rigour matter more to her than visibility.",
  "Her through-line is simple — clarity for people who need it, integrity in how evidence is used, and health outcomes that serve communities first.",
] as const;

export const OUTREACH_INTRO =
  "Able Delalie’s public commentary and advocacy show up across Facebook, Instagram, and X. Facebook is the main place she threads workforce campaigns (for example #HirePharmacistsNow), patient-safety framing, and calls for accountability in Ghana’s health system. This site can’t mirror every post automatically — use the buttons below for the live feeds, and the list for work that independent outlets have already documented.";

export const OUTREACH_HIGHLIGHTS = [
  {
    title: "Commentary: “Three hours to die — how Ghana failed Charles Amissah”",
    note: "Long-form piece on systemic emergency-care failure, “no bed” referrals, and institutional accountability — published under her byline on Asaase Radio.",
    url: "https://asaaseradio.com/able-delalie-writes-three-hours-to-die-how-ghana-failed-charles-amissah/",
    source: "Asaase Radio",
  },
  {
    title: "Professional profile (as summarised by Asaase Radio)",
    note: "Ghanaian hospital pharmacist and public-health practitioner; Doctor of Pharmacy and MPH; described as leading pharmaceutical services at a faith-based hospital with focus on medicines management, patient safety, supply chain, menstrual health, access, and accountability.",
    url: "https://asaaseradio.com/able-delalie-writes-three-hours-to-die-how-ghana-failed-charles-amissah/",
    source: "Asaase Radio (author bio)",
  },
  {
    title: "#HirePharmacistsNow — public-sector pharmacist recruitment campaign",
    note: "ECPG-led nationwide advocacy calling for large-scale recruitment of pharmacists into Ghana’s public system; stresses patient safety, rural gaps, and storytelling on social media.",
    url: "https://ghanapharmaceuticaljournal.com/news/ecpg-set-to-launch-a-nationwide-call-to-hirepharmacistsnow-following-advocacy-training-with-cdd-ghana/",
    source: "Ghana Pharmaceutical Journal",
  },
  {
    title: "CPPA endorsement of #HirePharmacistsNow",
    note: "Community Practice Pharmacists Association backs the campaign and repeats stark workforce numbers (e.g. thousands of early-career pharmacists vs. facilities served).",
    url: "https://gna.org.gh/2025/07/cppa-government-must-act-on-pharmacist-shortage/",
    source: "Ghana News Agency",
  },
] as const;

export const OUTREACH_PRESS_LINKS = [
  {
    label: "Asaase Radio — committee: medical neglect and delays in Charles Amissah case",
    url: "https://asaaseradio.com/probe-finds-medical-neglect-not-injuries-killed-charles-amissah/",
  },
  {
    label: "GBC Online — “No bed syndrome” and emergency care (mentions Amissah case)",
    url: "https://www.gbcghanaonline.com/features/no-bed-syndrome-ghana/2026/",
  },
] as const;

export const LINKEDIN_NOTE =
  "A dedicated public LinkedIn profile URL for “Able Delalie” did not show up clearly in open web search from this environment. Paste your profile URL into `linkedinProfileUrl` at the top of `src/content/facebookPublicThemes.ts` to show a LinkedIn button here.";

export const LATEST_ARTICLES_INTRO =
  "The place where essays go a little deeper — practice, policy, faith, and menstrual health equity. New pieces land here first.";

export const HOME_INSIGHTS_LEDE =
  "Long-form notes, advocacy reflections, and the conversations that do not always fit elsewhere — plus a free resource when you join the list.";

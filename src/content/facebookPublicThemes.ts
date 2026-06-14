/**
 * Optional: paste your public LinkedIn profile URL here (e.g. https://www.linkedin.com/in/your-handle).
 * Leave empty to hide the LinkedIn button on the homepage.
 */
export let linkedinProfileUrl = "";

/** Rhoda Delali Agbenyo — public profile & references (search: “Rhoda Delali Agbenyo”, “Agbenyo Delali Rhoda”). */
export const rhodaDelaliAgbenyo = {
  displayName: "Rhoda Delali Agbenyo",
  nameNote: "Also searched as Agbenyo Delali Rhoda — same person on LinkedIn.",
  roleLine: "Pharmacist | Public health | Menstrual health & policy | Founder, Period Matters | PharmD, MPH",
  linkedin: "https://www.linkedin.com/in/rhodadelaliagbenyo",
  summary:
    "LinkedIn shows co-authored commentary on Ghana’s health workforce, #HirePharmacistsNow–style advocacy, and leadership in menstrual health through Period Matters.",
  links: [
    {
      title: "Junior Graphic — Remove tax on pads",
      note: "Coverage of calls to remove tax on sanitary pads and period poverty — interview attributed in the piece to Period Matters’ founder (naming varies in the press).",
      url: "https://graphic.com.gh/junior-graphic/junior-news/remove-tax-on-pads.html",
      source: "Graphic Online",
    },
    {
      title: "S4D LEARN HUB — member profile",
      note: "Directory listing under Rhoda Delali Agbenyo.",
      url: "https://www.s4dlearnhub.com/members-directory/rhodadelaligmail-con/",
      source: "S4D LEARN HUB",
    },
  ],
} as const;

export default {
  intro: `Able Delalie’s public commentary and advocacy show up across Facebook, Instagram, and X. Facebook is the main place she threads workforce campaigns (for example #HirePharmacistsNow), patient-safety framing, and calls for accountability in Ghana’s health system. This site can’t mirror every post automatically — use the buttons below for the live feeds, and the list for work that independent outlets have already documented.`,

  /** Themes that match reporting on her advocacy and published commentary (not an exhaustive Facebook export). */
  highlights: [
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
  ],

  /** Additional reporting linked to the same national conversation (context). */
  pressLinks: [
    {
      label: "Asaase Radio — committee: medical neglect and delays in Charles Amissah case",
      url: "https://asaaseradio.com/probe-finds-medical-neglect-not-injuries-killed-charles-amissah/",
    },
    {
      label: "GBC Online — “No bed syndrome” and emergency care (mentions Amissah case)",
      url: "https://www.gbcghanaonline.com/features/no-bed-syndrome-ghana/2026/",
    },
  ],

  linkedinNote:
    "A dedicated public LinkedIn profile URL for “Able Delalie” did not show up clearly in open web search from this environment. Paste your profile URL into `linkedinProfileUrl` at the top of `src/content/facebookPublicThemes.ts` to show a LinkedIn button here.",
} as const;

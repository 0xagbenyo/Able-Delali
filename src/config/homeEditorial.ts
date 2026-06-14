/** Homepage editorial strip (marquee) — brand phrases, no external data. */
export const MARQUEE_CHUNKS = [
  "Pharmacist",
  "Public health",
  "Evidence & policy",
  "Menstrual health equity",
  "Leadership",
  "Writing & advocacy",
  "Practice meets policy",
] as const;

/** About + stats grid (reference layout): main numeral + accent suffix in Life Red */
export const HERO_STATS = [
  { valueMain: "15", valueAccent: "+", sub: "Years bridging care & policy" },
  { valueMain: "UK", valueAccent: "+", sub: "Talks, panels & partnerships" },
  { valueMain: "50", valueAccent: "+", sub: "Essays, rooms & programmes shaped" },
  { valueMain: "1", valueAccent: "", sub: "North star: menstrual health equity" },
] as const;

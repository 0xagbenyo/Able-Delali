/**
 * Long-form mission copy for the About page (card grid; replaces former testimonials block).
 * Images are supplied at runtime from ERPNext About Intro attach fields / slide_urls.
 */

export type AboutMissionCard = {
  /** Larger opening typography */
  variant?: "lead" | "default";
  title?: string;
  body: string;
  /** Photo from ERPNext (resolved public URL) */
  image?: string;
  /** In-app route */
  to?: string;
  /** Opens in new tab */
  externalUrl?: string;
  linkLabel?: string;
};

export type AboutMissionGroup = {
  id: string;
  heading?: string;
  /** `intro` = single readable column; `tiles` = responsive card grid */
  grid: "intro" | "tiles";
  /** For `tiles` only: 2×2 for four cards, or one row of three on large screens */
  tileLayout?: "two-by-two" | "three-across";
  cards: AboutMissionCard[];
};

const aboutMissionGroups: AboutMissionGroup[] = [
  {
    id: "mission-narrative",
    grid: "intro" as const,
    cards: [
      {
        variant: "lead",
        body: "Health is shaped by more than medicine. It is shaped by the policies we enact, the systems we strengthen, and the decisions we make every day.",
      },
      {
        body: "I'm Able Delalie, a pharmacist, public health professional, writer, and health policy advocate committed to building stronger, more equitable health systems. My work sits at the intersection of pharmacy, public health, and policy, where evidence becomes action and ideas become meaningful change.",
      },
      {
        body: "Over the years, I have served in clinical practice, hospital leadership, public health, and advocacy. These experiences have shown me that many of the greatest health challenges are not simply clinical. They are systemic. They are shaped by policy, access, education, and the quality of the decisions we make as professionals and as a society.",
      },
      {
        body: "Today, my work focuses on translating evidence into action. Whether I am improving medication safety, writing about health policy, advocating for the pharmacy profession, advancing menstrual health equity, or educating the public, I am driven by one purpose: helping people make better health decisions and helping systems deliver better health outcomes.",
      },
    ],
  },
  {
    id: "areas-of-focus",
    heading: "Areas of Focus",
    grid: "tiles" as const,
    tileLayout: "two-by-two" as const,
    cards: [
      {
        title: "Health Policy",
        body: "Contributing to conversations and solutions that strengthen health systems and improve access to quality healthcare.",
      },
      {
        title: "Pharmacy Practice",
        body: "Promoting medication safety, rational medicine use, and the role of pharmacists in achieving better patient outcomes.",
      },
      {
        title: "Public Health",
        body: "Communicating evidence in ways that empower individuals, communities, and decision-makers.",
      },
      {
        title: "Menstrual Health Equity",
        body: "Advancing menstrual health as a public health priority through education, advocacy, and policy engagement.",
      },
    ],
  },
  {
    id: "current-initiatives",
    heading: "Current Initiatives",
    grid: "tiles" as const,
    tileLayout: "three-across" as const,
    cards: [
      {
        title: "Period Matters",
        body: "A platform dedicated to advancing menstrual health awareness, education, and policy conversations.",
      },
      {
        title: "Able Journal",
        body: "Essays and reflections exploring pharmacy, public health, health systems, leadership, and policy.",
        to: "/blog",
        linkLabel: "Read the journal",
      },
      {
        title: "Health Advocacy",
        body: "Championing stronger health systems, equitable access to care, and evidence-informed decision-making through public engagement and strategic advocacy.",
        to: "/work-with-me",
        linkLabel: "Work with Able",
      },
    ],
  },
  {
    id: "mission-closing",
    grid: "intro" as const,
    cards: [
      {
        title: "Guiding principles",
        body: "Everything I create is guided by the same principles: integrity, evidence, equity, and accountability. I believe credibility is earned through consistency, advocacy is strongest when grounded in evidence, and meaningful impact comes from improving systems, not simply responding to their shortcomings.",
      },
      {
        title: "More than a brand",
        body: "Able Delalie is more than a personal brand. It is a platform for ideas, dialogue, and action. It exists to inform, influence, and contribute to healthier communities and stronger health systems.",
      },
      {
        title: "Join the conversation",
        body: "Whether you're a policymaker, healthcare professional, researcher, journalist, organization, or someone looking for trusted health information, I'm glad you're here. I hope you'll join the conversation.",
      },
    ],
  },
];

/** Assign ERPNext slide URLs to mission cards in order (cycles when fewer images than cards). */
export function applyErpSlidesToMissionGroups(
  groups: AboutMissionGroup[],
  slideUrls: string[],
): AboutMissionGroup[] {
  if (slideUrls.length === 0) {
    return groups.map((g) => ({
      ...g,
      cards: g.cards.map((c) => {
        const { image: _removed, ...rest } = c;
        return rest;
      }),
    }));
  }

  let index = 0;
  const nextImage = () => slideUrls[index++ % slideUrls.length]!;

  return groups.map((g) => ({
    ...g,
    cards: g.cards.map((c) => ({ ...c, image: nextImage() })),
  }));
}

export const aboutMissionSection = {
  sectionId: "about-mission",
  sectionHeading: "Mission & focus",
  groups: aboutMissionGroups,
};

/** Slides for the luxury-style testimonial carousel (areas, initiatives, closing). */
export type AboutMissionCarouselSlide = {
  id: string;
  image: string;
  quote: string;
  name: string;
  to?: string;
  linkLabel?: string;
};

export function getMissionCarouselSlides(groups: AboutMissionGroup[]): AboutMissionCarouselSlide[] {
  const slides: AboutMissionCarouselSlide[] = [];
  for (const g of groups) {
    if (g.id === "areas-of-focus" || g.id === "current-initiatives") {
      g.cards.forEach((c, i) => {
        if (!c.image) return;
        const name = c.title?.trim() || g.heading || "Focus";
        slides.push({
          id: `${g.id}-${i}`,
          image: c.image,
          quote: c.body,
          name,
          to: c.to,
          linkLabel: c.linkLabel,
        });
      });
    } else if (g.id === "mission-closing") {
      g.cards.forEach((c, i) => {
        if (!c.image) return;
        const name = c.title?.trim() || "Able Delalie";
        slides.push({
          id: `mission-closing-${i}`,
          image: c.image,
          quote: c.body,
          name,
          to: c.to,
          linkLabel: c.linkLabel,
        });
      });
    }
  }
  return slides;
}

import { useCallback, useState } from "react";
import type { AboutHeroSlide } from "../content/aboutHeroSlides";
import { useCarouselAutoplay } from "../hooks/useCarouselAutoplay";

type Props = {
  slides: AboutHeroSlide[];
};

export default function AboutHeroCarousel({ slides }: Props) {
  const pageCount = Math.max(1, slides.length);
  const [index, setIndex] = useState(0);
  const safeIndex = ((index % pageCount) + pageCount) % pageCount;
  const active = slides[safeIndex] ?? slides[0]!;

  const advance = useCallback(() => {
    setIndex((p) => (p + 1) % pageCount);
  }, [pageCount]);

  const { controlProps } = useCarouselAutoplay(pageCount, advance, 4500);

  const hasImage = slides.some((s) => Boolean(s.image));

  return (
    <section
      className={`ad-about-page__hero${hasImage ? "" : " ad-about-page__hero--no-image"}`}
      aria-labelledby="about-hero-heading"
      {...controlProps}
    >
      {hasImage ? (
        <div className="ad-about-page__hero-media" aria-hidden>
          {slides.map((slide, i) =>
            slide.image ? (
              <img
                key={slide.id}
                className={`ad-about-page__hero-bg${i === safeIndex ? " ad-about-page__hero-bg--active" : ""}`}
                src={slide.image}
                alt=""
                decoding="async"
              />
            ) : null,
          )}
        </div>
      ) : null}

      <div className="ad-about-page__hero-scrim" aria-hidden />

      <div className="ad-container ad-about-page__hero-inner">
        <div key={safeIndex} className="ad-about-page__hero-copy">
          <p className="ad-about-page__hero-eyebrow">{active.eyebrow}</p>
          <h1 id="about-hero-heading" className="ad-about-page__hero-heading">
            <span className="ad-about-page__hero-line1">{active.title}</span>
            {active.subtitle ? (
              <span className="ad-about-page__hero-line2">{active.subtitle}</span>
            ) : null}
          </h1>
        </div>
      </div>
    </section>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AboutHeroSlide } from "../content/aboutHeroSlides";
import { useCarouselAutoplay } from "../hooks/useCarouselAutoplay";
import { usePreloadImages } from "../hooks/usePreloadImages";

type Props = {
  slides: AboutHeroSlide[];
};

export default function AboutHeroCarousel({ slides }: Props) {
  const pageCount = Math.max(1, slides.length);
  const [index, setIndex] = useState(0);
  const safeIndex = ((index % pageCount) + pageCount) % pageCount;
  const active = slides[safeIndex] ?? slides[0]!;

  const imageUrls = useMemo(
    () => slides.map((s) => s.image).filter(Boolean),
    [slides],
  );
  const imagesReady = usePreloadImages(imageUrls);

  const advance = useCallback(() => {
    setIndex((p) => {
      const next = (p + 1) % pageCount;
      if (pageCount <= 1) return next;
      const nextImage = slides[next]?.image?.trim();
      if (nextImage && !imagesReady.has(nextImage)) return p;
      return next;
    });
  }, [pageCount, slides, imagesReady]);

  const { controlProps } = useCarouselAutoplay(pageCount, advance, 4500);

  useEffect(() => {
    setIndex(0);
  }, [slides]);

  useEffect(() => {
    const links: HTMLLinkElement[] = [];
    for (const url of imageUrls) {
      if (imagesReady.has(url)) continue;
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = url;
      document.head.appendChild(link);
      links.push(link);
    }
    return () => {
      for (const link of links) link.remove();
    };
  }, [imageUrls, imagesReady]);

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
                loading="eager"
                decoding={i === 0 ? "sync" : "async"}
                fetchPriority={i <= 1 ? "high" : "low"}
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

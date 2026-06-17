import { useEffect, useState } from "react";

/** Preload image URLs in the background; returns a set of URLs that have finished loading. */
export function usePreloadImages(urls: readonly string[]): ReadonlySet<string> {
  const [ready, setReady] = useState<ReadonlySet<string>>(() => new Set());

  useEffect(() => {
    const unique = [...new Set(urls.map((u) => u.trim()).filter(Boolean))];
    if (unique.length === 0) {
      setReady(new Set());
      return;
    }

    let cancelled = false;
    const loaded = new Set<string>();

    const markReady = (src: string) => {
      if (cancelled || loaded.has(src)) return;
      loaded.add(src);
      setReady(new Set(loaded));
    };

    for (const src of unique) {
      const img = new Image();
      img.onload = () => markReady(src);
      img.onerror = () => markReady(src);
      img.src = src;
      if (img.complete) markReady(src);
    }

    return () => {
      cancelled = true;
    };
  }, [urls.join("|")]);

  return ready;
}

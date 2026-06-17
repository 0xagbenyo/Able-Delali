import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_INTERVAL_MS = 6500;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Advances a carousel on an interval. Pauses on hover/focus/touch; call `restart` after manual nav.
 */
export function useCarouselAutoplay(
  pageCount: number,
  onAdvance: () => void,
  intervalMs = DEFAULT_INTERVAL_MS,
) {
  const pausedRef = useRef(false);
  const onAdvanceRef = useRef(onAdvance);
  onAdvanceRef.current = onAdvance;

  const [epoch, setEpoch] = useState(0);

  const pause = useCallback(() => {
    pausedRef.current = true;
  }, []);

  const resume = useCallback(() => {
    pausedRef.current = false;
  }, []);

  const restart = useCallback(() => {
    pausedRef.current = false;
    setEpoch((e) => e + 1);
  }, []);

  useEffect(() => {
    if (pageCount <= 1 || prefersReducedMotion()) return;

    const id = window.setInterval(() => {
      if (!pausedRef.current) onAdvanceRef.current();
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [pageCount, intervalMs, epoch]);

  const controlProps = {
    onMouseEnter: pause,
    onMouseLeave: resume,
    onFocusCapture: pause,
    onBlurCapture: resume,
    onTouchStart: pause,
    onTouchEnd: () => {
      window.setTimeout(resume, 4500);
    },
  } as const;

  return { pause, resume, restart, controlProps };
}

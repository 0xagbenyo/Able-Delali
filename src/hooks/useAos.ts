import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

let aosInitialized = false;

const AOS_OPTIONS = {
  once: false,
  duration: 2000,
  easing: "ease-out-cubic" as const,
  offset: 120,
};

/** Initialise AOS once app-wide; call `AOS.refresh()` when layout/content deps change. */
export function useAos(refreshDeps: readonly unknown[] = []) {
  useEffect(() => {
    if (!aosInitialized) {
      aosInitialized = true;
      AOS.init(AOS_OPTIONS);
    } else {
      AOS.refresh();
    }
  }, []);

  useEffect(() => {
    if (!aosInitialized) return;
    AOS.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller passes explicit refresh triggers
  }, refreshDeps);
}

export function refreshAos() {
  if (aosInitialized) AOS.refresh();
}

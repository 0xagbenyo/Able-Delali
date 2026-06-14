import { useEffect } from "react";
import { logoSecondaryNavy } from "../config/brand";

const OUT_PX = 320;
const ZOOM = 1.45;

function getOrCreateLink(rel: string, type?: string): HTMLLinkElement {
  const selector = `link[rel="${rel}"]`;
  let el = document.querySelector(selector) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    if (type) el.type = type;
    document.head.appendChild(el);
  } else if (type) {
    el.type = type;
  }
  return el;
}

function iconSrcToZoomedPngDataUrl(src: string, size: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      if (!iw || !ih) {
        reject(new Error("Invalid image size"));
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("No canvas context"));
        return;
      }

      const cover = Math.max(size / iw, size / ih);
      const scale = cover * ZOOM;
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = (size - dw) / 2;
      const dy = (size - dh) / 2;

      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, dx, dy, dw, dh);

      let dataUrl: string;
      try {
        dataUrl = canvas.toDataURL("image/png");
      } catch {
        reject(new Error("toDataURL failed"));
        return;
      }
      resolve(dataUrl);
    };
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

/** Sets tab / touch icon from the approved Able Delalie mark (single static favicon). */
export default function RotatingFavicon() {
  useEffect(() => {
    let cancelled = false;

    const favicon = getOrCreateLink("icon", "image/png");
    const apple = getOrCreateLink("apple-touch-icon", "image/png");
    favicon.setAttribute("sizes", `${OUT_PX}x${OUT_PX}`);
    apple.setAttribute("sizes", `${OUT_PX}x${OUT_PX}`);

    void (async () => {
      let href: string;
      try {
        href = await iconSrcToZoomedPngDataUrl(logoSecondaryNavy, OUT_PX);
      } catch {
        href = logoSecondaryNavy;
      }
      if (cancelled) return;
      favicon.href = href;
      apple.href = href;
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}

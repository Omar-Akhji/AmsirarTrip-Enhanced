import type Lenis from "lenis";

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

export function setupSideScroll(element: HTMLElement, prefix: string): (() => void) | null {
  const track = element.querySelector<HTMLElement>(`.${prefix}-track`);
  const stage = element.querySelector<HTMLElement>(`.${prefix}-stage`);
  const slider = element.querySelector<HTMLElement>(`.${prefix}-slider`);

  if (!track || !stage || !slider) {
    return null;
  }

  const prefersReduced =
    typeof window !== "undefined"
    && globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReduced) {
    slider.style.transform = "";
    return null;
  }

  let rafId: number | null = null;
  let lastTransform = "";
  let needsMeasure = true;
  let stageHeight = 0;
  let trackHeight = 0;
  let maxTranslate = 0;

  const updateTransforms = () => {
    rafId = null;

    const trackRect = track.getBoundingClientRect();
    if (needsMeasure) {
      stageHeight = stage.offsetHeight;
      trackHeight = track.offsetHeight;
      maxTranslate = Math.max(0, slider.scrollWidth - stage.clientWidth);
      needsMeasure = false;
    }
    const maxScroll = Math.max(1, trackHeight - stageHeight);

    // Stage is sticky at top: 80px (top-20)
    const scrolled = 80 - trackRect.top;
    const progress = clamp01(scrolled / maxScroll);

    const currentTranslate = progress * maxTranslate;

    const transformStr = `translate3d(${(-currentTranslate).toFixed(1)}px, 0px, 0px)`;
    if (lastTransform === transformStr) {
      return;
    }

    lastTransform = transformStr;
    slider.style.transform = transformStr;
  };

  const schedule = () => {
    rafId ??= globalThis.requestAnimationFrame(updateTransforms);
  };

  const onResize = () => {
    needsMeasure = true;
    schedule();
  };

  const lenis = (globalThis as unknown as { __lenis?: Lenis }).__lenis;
  if (lenis) {
    lenis.on("scroll", schedule);
  } else {
    window.addEventListener("scroll", schedule, { passive: true });
  }

  window.addEventListener("resize", onResize, { passive: true });
  schedule();

  return () => {
    if (rafId !== null) {
      globalThis.cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (lenis) {
      lenis.off("scroll", schedule);
    } else {
      window.removeEventListener("scroll", schedule);
    }
    window.removeEventListener("resize", onResize);
  };
}

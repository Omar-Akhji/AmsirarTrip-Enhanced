function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

function setupSideScrollFallback(element: HTMLElement): (() => void) | null {
  const track = element.querySelector<HTMLElement>("[data-side-track]");
  const stage = element.querySelector<HTMLElement>("[data-side-stage]");
  const slider = element.querySelector<HTMLElement>("[data-side-slider]");

  if (!track || !stage || !slider) {
    return null;
  }

  const prefersReduced =
    typeof window !== "undefined"
    && globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const supportsCssTimeline =
    typeof CSS !== "undefined"
    && CSS.supports("animation-timeline", "view()")
    && CSS.supports("timeline-scope", "--a");

  if (prefersReduced || supportsCssTimeline) {
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
    const scrolled = 80 - trackRect.top;
    const progress = clamp01(scrolled / maxScroll);
    const currentTranslate = progress * maxTranslate;

    const transformStr = `translate3d(${(-currentTranslate).toFixed(1)}px, 0px, 0px)`;
    if (lastTransform === transformStr) return;

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

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });
  schedule();

  return () => {
    if (rafId !== null) {
      globalThis.cancelAnimationFrame(rafId);
      rafId = null;
    }
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", onResize);
  };
}

class SideScrollElement extends HTMLElement {
  private cleanup: (() => void) | null = null;

  connectedCallback() {
    this.cleanup?.();
    this.cleanup = setupSideScrollFallback(this);
  }

  disconnectedCallback() {
    this.cleanup?.();
    this.cleanup = null;
  }
}

if (typeof customElements !== "undefined" && !customElements.get("side-scroll")) {
  customElements.define("side-scroll", SideScrollElement);
}

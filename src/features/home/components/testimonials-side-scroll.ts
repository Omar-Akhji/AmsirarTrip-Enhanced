import type Lenis from "lenis";

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

function setupTestimonialsSideScroll(element: HTMLElement): (() => void) | null {
  const track = element.querySelector<HTMLElement>(".testimonials-side-track");
  const stage = element.querySelector<HTMLElement>(".testimonials-side-stage");
  const slider = element.querySelector<HTMLElement>(".testimonials-side-slider");

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

  const updateTransforms = () => {
    rafId = null;

    const trackRect = track.getBoundingClientRect();
    const stageHeight = stage.offsetHeight;
    const trackHeight = track.offsetHeight;
    const maxScroll = Math.max(1, trackHeight - stageHeight);

    // Stage is sticky at top: 80px (top-20)
    const scrolled = 80 - trackRect.top;
    const progress = clamp01(scrolled / maxScroll);

    // Maximum distance slider can translate to the left across the screen
    const maxTranslate = Math.max(0, slider.scrollWidth - stage.clientWidth);
    const currentTranslate = progress * maxTranslate;

    const transformStr = `translate3d(${-currentTranslate.toFixed(1)}px, 0px, 0px)`;
    if (lastTransform === transformStr) {
      return;
    }

    lastTransform = transformStr;
    slider.style.transform = transformStr;
  };

  const schedule = () => {
    rafId ??= globalThis.requestAnimationFrame(updateTransforms);
  };

  const lenis = (globalThis as unknown as { __lenis?: Lenis }).__lenis;
  if (lenis) {
    lenis.on("scroll", schedule);
  }
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });

  const resizeObserver = new ResizeObserver(schedule);
  resizeObserver.observe(element);
  resizeObserver.observe(track);
  resizeObserver.observe(stage);
  resizeObserver.observe(slider);

  updateTransforms();

  return () => {
    if (rafId !== null) {
      globalThis.cancelAnimationFrame(rafId);
    }
    resizeObserver.disconnect();
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    if (lenis) {
      lenis.off("scroll", schedule);
    }
  };
}

class TestimonialsSideScrollElement extends HTMLElement {
  private cleanupFn: (() => void) | null = null;

  connectedCallback(): void {
    requestAnimationFrame(() => {
      this.cleanupFn = setupTestimonialsSideScroll(this);
    });
  }

  disconnectedCallback(): void {
    if (!this.cleanupFn) {
      return;
    }

    this.cleanupFn();
    this.cleanupFn = null;
  }
}

if (!customElements.get("testimonials-side-scroll")) {
  customElements.define("testimonials-side-scroll", TestimonialsSideScrollElement);
}

import type Lenis from "lenis";

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

function setupTestimonialsScrollStack(element: HTMLElement): (() => void) | null {
  const track = element.querySelector<HTMLElement>(".testimonials-stack-track");
  const stage = element.querySelector<HTMLElement>(".testimonials-stack-stage");
  const cardSlots = [...element.querySelectorAll<HTMLElement>("[data-stack-card]")];

  if (!track || !stage || cardSlots.length === 0) {
    return null;
  }

  const count = cardSlots.length;
  const prefersReduced =
    typeof window !== "undefined"
    && globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const cache = new Map<string, string | number>();
  let rafId: number | null = null;

  const updateTransforms = () => {
    rafId = null;

    if (prefersReduced) {
      for (const slot of cardSlots) {
        slot.style.transform = "";
        slot.style.opacity = "";
      }
      return;
    }

    // 1. Calculate overall scroll progress through track (0.0 -> 1.0)
    const trackRect = track.getBoundingClientRect();
    const stageHeight = stage.offsetHeight;
    const trackHeight = track.offsetHeight;
    const maxScroll = Math.max(1, trackHeight - stageHeight);
    const scrolled = 72 - trackRect.top;
    const progress = clamp01(scrolled / maxScroll);

    // 2. Cards Scroll & Stack across all N cards
    // Reserve last 10% (0.90 -> 1.00) to hold the finished stacked deck
    const activeRange = 0.9;
    const step = count > 1 ? activeRange / (count - 1) : 1;
    const cardStepOffset = Math.min(14, Math.floor(96 / count));
    const rawHeight = cardSlots[0]?.offsetHeight ?? 0;
    const cardHeight = rawHeight > 0 ? rawHeight : 420;
    const initialY = Math.round(cardHeight * 0.88);

    for (let i = 0; i < count; i++) {
      const slot = cardSlots[i];
      if (!slot) continue;

      let y = 0;
      let opacity = 1;
      let tilt = 0;
      let scale = 1;

      if (i === 0) {
        // Base card gets pushed deeper into perspective as cards stack on top of it
        let cardsOnTop = 0;
        for (let j = 1; j < count; j++) {
          const start = (j - 1) * step;
          const p = clamp01((progress - start) / step);
          cardsOnTop += p;
        }
        scale = Math.max(0.82, 1 - 0.022 * cardsOnTop);
        tilt = -1.2 * cardsOnTop;
        y = 0;
        opacity = 1;
      } else {
        const start = (i - 1) * step;
        const pCard = clamp01((progress - start) / step);

        const targetY = i * cardStepOffset;
        y = initialY - pCard * (initialY - targetY);
        opacity = clamp01(pCard * 2.5);

        // Subsequent cards landing on top of card i
        let subsequentOnTop = 0;
        for (let j = i + 1; j < count; j++) {
          const s = (j - 1) * step;
          const p = clamp01((progress - s) / step);
          subsequentOnTop += p;
        }

        scale = Math.max(0.85, 1 - 0.022 * subsequentOnTop);
        tilt = -1.2 * subsequentOnTop;
      }

      const slotTransform = `perspective(1200px) translateY(${y.toFixed(1)}px) rotateX(${tilt.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
      const slotCacheKey = `slot${i}`;

      if (cache.get(slotCacheKey) !== slotTransform) {
        cache.set(slotCacheKey, slotTransform);
        slot.style.transformOrigin = "top center";
        slot.style.transform = slotTransform;
      }

      const opStr = opacity.toFixed(3);
      const opCacheKey = `op${i}`;
      if (cache.get(opCacheKey) === opStr) {
        continue;
      }

      cache.set(opCacheKey, opStr);
      slot.style.opacity = opStr;
    }
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

class TestimonialsScrollStackElement extends HTMLElement {
  private cleanupFn: (() => void) | null = null;

  connectedCallback(): void {
    requestAnimationFrame(() => {
      this.cleanupFn = setupTestimonialsScrollStack(this);
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

if (!customElements.get("testimonials-scroll-stack")) {
  customElements.define("testimonials-scroll-stack", TestimonialsScrollStackElement);
}

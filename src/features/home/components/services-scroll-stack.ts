import type Lenis from "lenis";
import gsap from "gsap";

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

function setupServicesScrollStack(element: HTMLElement): (() => void) | null {
  const track = element.querySelector<HTMLElement>(".services-stack-track");
  const stage = element.querySelector<HTMLElement>(".services-stack-stage");
  const card0 = element.querySelector<HTMLElement>('[data-stack-card="0"]');
  const card1 = element.querySelector<HTMLElement>('[data-stack-card="1"]');
  const card2 = element.querySelector<HTMLElement>('[data-stack-card="2"]');

  if (!track || !stage || !card0 || !card1 || !card2) {
    return null;
  }

  const cardSlots = [card0, card1, card2];
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

    // 2. Cards Scroll & Stack
    // Card 1 scrolls up during first half (0.00 -> 0.45)
    // Card 2 scrolls up during second half (0.45 -> 0.90)
    // 0.90 -> 1.00 holds the finished stacked deck
    const pCard1 = clamp01(progress / 0.45);
    const pCard2 = clamp01((progress - 0.45) / 0.45);

    // Card 1 scrolls up into 32px offset
    const card1Y = 360 - pCard1 * (360 - 32);
    const card1Opacity = clamp01(pCard1 * 2.5);

    // Card 2 scrolls up into 64px offset
    const card2Y = 360 - pCard2 * (360 - 64);
    const card2Opacity = clamp01(pCard2 * 2.5);

    // Perspective & Scaling for physical card deck stacking
    const tilt0 = -3 * pCard1 - 3 * pCard2;
    const scale0 = 1 - 0.045 * pCard1 - 0.045 * pCard2;
    const y0 = 0;

    const tilt1 = -3 * pCard2;
    const scale1 = 1 - 0.045 * pCard2;
    const y1 = card1Y;

    const scale2 = 1;
    const y2 = card2Y;

    const cardsData = [
      { y: y0, tilt: tilt0, scale: scale0, opacity: 1 },
      { y: y1, tilt: tilt1, scale: scale1, opacity: card1Opacity },
      { y: y2, tilt: 0, scale: scale2, opacity: card2Opacity },
    ];

    for (const [index, slot] of cardSlots.entries()) {
      const cardData = cardsData[index];
      if (!cardData) continue;

      const slotTransform = `perspective(1200px) translateY(${cardData.y.toFixed(1)}px) rotateX(${cardData.tilt.toFixed(2)}deg) scale(${cardData.scale.toFixed(4)})`;
      const slotCacheKey = `slot${index}`;

      if (cache.get(slotCacheKey) !== slotTransform) {
        cache.set(slotCacheKey, slotTransform);
        gsap.set(slot, { transform: slotTransform, transformOrigin: "top center", force3D: true });
      }

      const opStr = cardData.opacity.toFixed(3);
      const opCacheKey = `op${index}`;
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

class ServicesScrollStackElement extends HTMLElement {
  private cleanupFn: (() => void) | null = null;

  connectedCallback(): void {
    requestAnimationFrame(() => {
      this.cleanupFn = setupServicesScrollStack(this);
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

if (!customElements.get("services-scroll-stack")) {
  customElements.define("services-scroll-stack", ServicesScrollStackElement);
}

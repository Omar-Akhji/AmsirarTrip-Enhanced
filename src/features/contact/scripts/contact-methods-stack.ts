import type Lenis from "lenis";
import gsap from "gsap";

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

function setupContactMethodsStack(element: HTMLElement): (() => void) | null {
  const cardSlots = [...element.querySelectorAll<HTMLElement>("[data-stack-card]")];
  if (cardSlots.length === 0) {
    return null;
  }

  const prefersReduced =
    typeof window !== "undefined"
    && globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const cache = new Map<string, string | number>();
  let rafId: number | null = null;

  const updateTransforms = () => {
    rafId = null;

    if (prefersReduced) {
      for (const slot of cardSlots) {
        const card = slot.querySelector<HTMLElement>(".contact-info-card");
        if (!card) continue;
        card.style.transform = "";
        card.style.filter = "";
        card.style.removeProperty("--card-dim");
      }
      return;
    }

    const tops = cardSlots.map((s) => s.getBoundingClientRect().top);
    const heights = cardSlots.map((s) => s.offsetHeight);

    const depths = cardSlots.map(() => 0);
    for (let j = 1; j < cardSlots.length; j++) {
      const prevTop = tops[j - 1] ?? 0;
      const prevHeight = heights[j - 1] ?? 0;
      const start = prevTop + prevHeight;
      const span = Math.max(1, prevHeight - 24);
      const currTop = tops[j] ?? 0;
      const cover = clamp01((start - currTop) / span);
      for (let i = 0; i < j; i++) {
        depths[i] = (depths[i] ?? 0) + cover;
      }
    }

    for (const [index, slot] of cardSlots.entries()) {
      const card = slot.querySelector<HTMLElement>(".contact-info-card");
      if (!card) continue;

      const depth = depths[index] ?? 0;
      const baseScale = 1 - depth * 0.055;
      const baseTilt = -depth * 2.2;
      const dim = Math.min(1, depth * 0.16);

      const cardTransform =
        depth < 0.001 ? "" : (
          `perspective(1000px) rotateX(${baseTilt.toFixed(2)}deg) scale(${baseScale.toFixed(4)})`
        );

      const cacheKey = `card${index}`;
      if (cache.get(cacheKey) !== cardTransform) {
        cache.set(cacheKey, cardTransform);
        gsap.set(card, { transform: cardTransform, transformOrigin: "top center", force3D: true });
      }

      const dimStr = dim.toFixed(3);
      const dimKey = `dim${index}`;
      if (cache.get(dimKey) === dimStr) continue;

      cache.set(dimKey, dimStr);
      card.style.setProperty("--card-dim", dimStr);
    }
  };

  const schedule = () => {
    rafId ??= globalThis.requestAnimationFrame(updateTransforms);
  };

  const lenis = (globalThis as unknown as { __lenis?: Lenis }).__lenis;
  if (lenis) {
    lenis.on("scroll", schedule);
  }
  globalThis.addEventListener("scroll", schedule, { passive: true });
  globalThis.addEventListener("resize", schedule, { passive: true });

  const resizeObserver = new ResizeObserver(schedule);
  resizeObserver.observe(element);

  updateTransforms();

  return () => {
    if (rafId !== null) {
      globalThis.cancelAnimationFrame(rafId);
    }
    resizeObserver.disconnect();
    globalThis.removeEventListener("scroll", schedule);
    globalThis.removeEventListener("resize", schedule);
    if (lenis) {
      lenis.off("scroll", schedule);
    }
  };
}

class ContactMethodsStackElement extends HTMLElement {
  private cleanupFn: (() => void) | null = null;

  connectedCallback() {
    this.cleanupFn?.();
    this.cleanupFn = setupContactMethodsStack(this);
  }

  disconnectedCallback() {
    this.cleanupFn?.();
    this.cleanupFn = null;
  }
}

if (!customElements.get("contact-methods-stack")) {
  customElements.define("contact-methods-stack", ContactMethodsStackElement);
}

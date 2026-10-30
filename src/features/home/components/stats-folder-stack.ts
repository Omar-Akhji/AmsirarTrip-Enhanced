import type Lenis from "lenis";
import gsap from "gsap";

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

function setupStatsFolderStack(element: HTMLElement): (() => void) | null {
  const track = element.querySelector<HTMLElement>(".stats-folder-track");
  const stage = element.querySelector<HTMLElement>(".stats-folder-stage");
  const card0 = element.querySelector<HTMLElement>('[data-stack-card="0"]');
  const card1 = element.querySelector<HTMLElement>('[data-stack-card="1"]');
  const card2 = element.querySelector<HTMLElement>('[data-stack-card="2"]');
  const folderBack = element.querySelector<HTMLElement>(".folder-back-plate");
  const folderFront = element.querySelector<HTMLElement>(".folder-front-pocket");

  if (!track || !stage || !card0 || !card1 || !card2 || !folderBack || !folderFront) {
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
        const card = slot.querySelector<HTMLElement>(".stat-card");
        if (!card) continue;
        card.style.transform = "";
        card.style.removeProperty("--card-dim");
      }
      folderBack.style.transform = "";
      folderBack.style.opacity = "";
      folderFront.style.transform = "";
      folderFront.style.opacity = "";
      return;
    }

    // 1. Calculate overall scroll progress through track (0.0 -> 1.0)
    const trackRect = track.getBoundingClientRect();
    const stageHeight = stage.offsetHeight;
    const trackHeight = track.offsetHeight;
    const maxScroll = Math.max(1, trackHeight - stageHeight);
    const scrolled = 72 - trackRect.top;
    const progress = clamp01(scrolled / maxScroll);

    // 2. Chapter 1: Cards Scroll & Stack (0.00 -> 0.45)
    const pCard1 = clamp01(progress / 0.22);
    const pCard2 = clamp01((progress - 0.22) / 0.23);

    // Card 1 scrolls up into 40px
    const card1Y = 340 - pCard1 * (340 - 40);
    const card1Opacity = clamp01(pCard1 * 2.2);

    // Card 2 scrolls up into 56px
    const card2Y = 340 - pCard2 * (340 - 56);
    const card2Opacity = clamp01(pCard2 * 2.2);

    // 3. Chapter 2: Folder Appears & Rises Up (0.45 -> 0.70)
    const pFolderRise = clamp01((progress - 0.45) / 0.25);
    const folderY = (1 - pFolderRise) * 340;
    const folderOpacity = clamp01(pFolderRise * 3.5);
    const frontTilt = -24 * (1 - pFolderRise);

    // 4. Chapter 3: Cards Slide Deep Inside Folder (0.70 -> 1.00)
    // Only ~2mm of card top borders peek out above the front pocket
    const pCardInsert = clamp01((progress - 0.7) / 0.3);
    const snugScale = 1 - pCardInsert * 0.035;

    // Apply Folder Back (Layer 1, behind cards)
    const backTransform = `translateY(${folderY.toFixed(1)}px)`;
    if (cache.get("backT") !== backTransform) {
      cache.set("backT", backTransform);
      gsap.set(folderBack, { transform: backTransform, force3D: true });
    }
    const folderOpStr = folderOpacity.toFixed(3);
    if (cache.get("backO") !== folderOpStr) {
      cache.set("backO", folderOpStr);
      folderBack.style.opacity = folderOpStr;
    }

    // Apply Folder Front (Layer 3, in front of cards)
    const frontTransform = `perspective(1000px) translateY(${folderY.toFixed(1)}px) rotateX(${frontTilt.toFixed(2)}deg)`;
    if (cache.get("frontT") !== frontTransform) {
      cache.set("frontT", frontTransform);
      gsap.set(folderFront, {
        transform: frontTransform,
        transformOrigin: "bottom center",
        force3D: true,
      });
    }
    if (cache.get("frontO") !== folderOpStr) {
      cache.set("frontO", folderOpStr);
      folderFront.style.opacity = folderOpStr;
    }

    // Individual card transforms:
    // Cards sink deep into the pocket so only a ~2mm sliver remains visible
    const tilt0 = -3.5 * pCard1 - 3.5 * pCard2;
    const scale0 = (1 - 0.05 * pCard1 - 0.05 * pCard2) * snugScale;
    const y0 = 24 + pCardInsert * 119; // Lands at 143px (16px above pocket lip)
    const dim0 = Math.min(1, 0.15 * pCard1 + 0.13 * pCard2);

    const tilt1 = -3.5 * pCard2;
    const scale1 = (1 - 0.05 * pCard2) * snugScale;
    const y1 = card1Y + pCardInsert * 107; // Lands at 147px (12px above pocket lip)
    const dim1 = Math.min(1, 0.15 * pCard2);

    const scale2 = snugScale;
    const y2 = card2Y + pCardInsert * 95; // Lands at 151px (8px above pocket lip)
    const dim2 = 0;

    const cardsData = [
      { y: y0, tilt: tilt0, scale: scale0, opacity: 1, dim: dim0 },
      { y: y1, tilt: tilt1, scale: scale1, opacity: card1Opacity, dim: dim1 },
      { y: y2, tilt: 0, scale: scale2, opacity: card2Opacity, dim: dim2 },
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
      if (cache.get(opCacheKey) !== opStr) {
        cache.set(opCacheKey, opStr);
        slot.style.opacity = opStr;
      }

      const card = slot.querySelector<HTMLElement>(".stat-card");
      if (!card) continue;

      const dimStr = cardData.dim.toFixed(3);
      const dimCacheKey = `dim${index}`;
      if (cache.get(dimCacheKey) === dimStr) continue;

      cache.set(dimCacheKey, dimStr);
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
  resizeObserver.observe(track);

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

class StatsFolderStackElement extends HTMLElement {
  private cleanupFn: (() => void) | null = null;

  connectedCallback() {
    this.cleanupFn?.();
    this.cleanupFn = setupStatsFolderStack(this);
  }

  disconnectedCallback() {
    this.cleanupFn?.();
    this.cleanupFn = null;
  }
}

if (!customElements.get("stats-folder-stack")) {
  customElements.define("stats-folder-stack", StatsFolderStackElement);
}

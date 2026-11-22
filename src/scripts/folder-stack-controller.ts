function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

const CARD_1_TARGET_Y = 40;
const CARD_2_TARGET_Y = 56;

interface FolderFrameTransforms {
  readonly backTransform: string;
  readonly cardsData: readonly {
    readonly opacity: number;
    readonly scale: number;
    readonly tilt: number;
    readonly y: number;
  }[];
  readonly folderOpacityStr: string;
  readonly frontTransform: string;
}

function resetFolderStyles(
  cardSlots: readonly HTMLElement[],
  folderBack: HTMLElement,
  folderFront: HTMLElement,
): void {
  for (const slot of cardSlots) {
    slot.style.transform = "";
    slot.style.opacity = "";
  }
  folderBack.style.transform = "";
  folderBack.style.opacity = "";
  folderFront.style.transform = "";
  folderFront.style.opacity = "";
}

function computeFolderFrameTransforms(progress: number): FolderFrameTransforms {
  const pCard1 = clamp01(progress / 0.22);
  const pCard2 = clamp01((progress - 0.22) / 0.23);
  const card1Y = 340 - pCard1 * (340 - CARD_1_TARGET_Y);
  const card1Opacity = clamp01(pCard1 * 2.2);
  const card2Y = 340 - pCard2 * (340 - CARD_2_TARGET_Y);
  const card2Opacity = clamp01(pCard2 * 2.2);

  const pFolderRise = clamp01((progress - 0.45) / 0.25);
  const folderY = (1 - pFolderRise) * 340;
  const folderOpacity = clamp01(pFolderRise * 3.5);
  const frontTilt = -24 * (1 - pFolderRise);

  const pCardInsert = clamp01((progress - 0.7) / 0.3);
  const snugScale = 1 - pCardInsert * 0.035;

  return {
    backTransform: `translateY(${folderY.toFixed(1)}px)`,
    folderOpacityStr: folderOpacity.toFixed(3),
    frontTransform: `perspective(1000px) translateY(${folderY.toFixed(1)}px) rotateX(${frontTilt.toFixed(2)}deg)`,
    cardsData: [
      {
        y: 24 + pCardInsert * 119,
        tilt: -3.5 * pCard1 - 3.5 * pCard2,
        scale: (1 - 0.05 * pCard1 - 0.05 * pCard2) * snugScale,
        opacity: 1,
      },
      {
        y: card1Y + pCardInsert * 107,
        tilt: -3.5 * pCard2,
        scale: (1 - 0.05 * pCard2) * snugScale,
        opacity: card1Opacity,
      },
      { y: card2Y + pCardInsert * 95, tilt: 0, scale: snugScale, opacity: card2Opacity },
    ],
  };
}

function applyFolderCachedStyles(
  cache: Map<string, string | number>,
  cardSlots: readonly HTMLElement[],
  folderBack: HTMLElement,
  folderFront: HTMLElement,
  frame: FolderFrameTransforms,
): void {
  if (cache.get("backT") !== frame.backTransform) {
    cache.set("backT", frame.backTransform);
    folderBack.style.translate = "0px 0px";
    folderBack.style.transform = frame.backTransform;
  }
  if (cache.get("backO") !== frame.folderOpacityStr) {
    cache.set("backO", frame.folderOpacityStr);
    folderBack.style.opacity = frame.folderOpacityStr;
  }
  if (cache.get("frontT") !== frame.frontTransform) {
    cache.set("frontT", frame.frontTransform);
    folderFront.style.translate = "0px 0px";
    folderFront.style.transformOrigin = "bottom center";
    folderFront.style.transform = frame.frontTransform;
  }
  if (cache.get("frontO") !== frame.folderOpacityStr) {
    cache.set("frontO", frame.folderOpacityStr);
    folderFront.style.opacity = frame.folderOpacityStr;
  }

  for (const [index, slot] of cardSlots.entries()) {
    const cardData = frame.cardsData[index];
    if (!cardData) continue;

    const slotTransform = `perspective(1200px) translateY(${cardData.y.toFixed(1)}px) rotateX(${cardData.tilt.toFixed(2)}deg) scale(${cardData.scale.toFixed(4)})`;
    const slotCacheKey = `slot${index}`;
    if (cache.get(slotCacheKey) !== slotTransform) {
      cache.set(slotCacheKey, slotTransform);
      slot.style.transformOrigin = "top center";
      slot.style.transform = slotTransform;
    }

    const opStr = cardData.opacity.toFixed(3);
    const opCacheKey = `op${index}`;
    if (cache.get(opCacheKey) === opStr) continue;

    cache.set(opCacheKey, opStr);
    slot.style.opacity = opStr;
  }
}

export function setupFolderStack(element: HTMLElement): (() => void) | null {
  const track = element.querySelector<HTMLElement>("[data-folder-track]");
  const stage = element.querySelector<HTMLElement>("[data-folder-stage]");
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
  const supportsCssTimeline =
    typeof CSS !== "undefined"
    && CSS.supports("animation-timeline", "view()")
    && CSS.supports("timeline-scope", "--a");

  if (prefersReduced || supportsCssTimeline) {
    resetFolderStyles(cardSlots, folderBack, folderFront);
    return null;
  }

  const cache = new Map<string, string | number>();
  let rafId: number | null = null;
  let needsMeasure = true;
  let stageHeight = 0;
  let trackHeight = 0;

  const updateTransforms = () => {
    rafId = null;
    const trackRect = track.getBoundingClientRect();
    if (needsMeasure) {
      stageHeight = stage.offsetHeight;
      trackHeight = track.offsetHeight;
      needsMeasure = false;
    }
    const maxScroll = Math.max(1, trackHeight - stageHeight);
    const progress = clamp01((72 - trackRect.top) / maxScroll);
    applyFolderCachedStyles(
      cache,
      cardSlots,
      folderBack,
      folderFront,
      computeFolderFrameTransforms(progress),
    );
  };

  const schedule = () => {
    rafId ??= globalThis.requestAnimationFrame(updateTransforms);
  };
  const onResize = () => {
    needsMeasure = true;
    schedule();
  };

  globalThis.addEventListener("scroll", schedule, { passive: true });
  globalThis.addEventListener("resize", onResize, { passive: true });
  const resizeObserver = new ResizeObserver(onResize);
  resizeObserver.observe(element);
  resizeObserver.observe(track);
  schedule();

  return () => {
    if (rafId !== null) {
      globalThis.cancelAnimationFrame(rafId);
    }
    resizeObserver.disconnect();
    globalThis.removeEventListener("scroll", schedule);
    globalThis.removeEventListener("resize", onResize);
  };
}

class FolderStackElement extends HTMLElement {
  private cleanupFn: (() => void) | null = null;

  connectedCallback() {
    this.cleanupFn?.();
    this.cleanupFn = setupFolderStack(this);
  }

  disconnectedCallback() {
    this.cleanupFn?.();
    this.cleanupFn = null;
  }
}

if (typeof customElements !== "undefined" && !customElements.get("folder-stack")) {
  customElements.define("folder-stack", FolderStackElement);
}

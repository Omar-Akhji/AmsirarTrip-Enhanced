/**
 * Tour Itinerary Scroll Tracker: syncs the sticky day heading/progress bar and stage dots using
 * IntersectionObserver aligned to the sticky header trigger line, while CSS scroll-driven
 * animations (`view-timeline` + `exit-crossing`) drive the vertical fill line with a scroll
 * fallback only when CSS scroll-driven animations are unsupported.
 */

interface StageMetadata {
  readonly element: HTMLElement;
  readonly node: HTMLElement;
  readonly ordinalLabel: string;
  readonly route: string;
  readonly stageNumber: number;
  readonly title: string;
}

interface StickyUiElements {
  readonly container: HTMLElement;
  readonly routeGroups: readonly HTMLElement[];
  readonly stages: readonly StageMetadata[];
  readonly stickyCounterCurrent: HTMLElement | null;
  readonly stickyHeading: HTMLElement | null;
  readonly stickyProgress: HTMLElement | null;
}

const NOOP = (): void => undefined;

function collectItineraryStages(container: HTMLElement): StageMetadata[] {
  return [...container.querySelectorAll<HTMLElement>("[data-itinerary-stage]")].map((el, index) => {
    const rawNumber = el.dataset["stageNumber"];
    const stageNumber = rawNumber ? Number(rawNumber) : index + 1;
    const ordinalLabel = el.dataset["stageOrdinal"] ?? String(stageNumber);
    const title = el.dataset["stageTitle"] ?? "";
    const route = el.dataset["stageRoute"] ?? title;
    const node = el.querySelector<HTMLElement>(".stage-node") ?? el;

    return { element: el, node, stageNumber, ordinalLabel, title, route };
  });
}

function measureStickyTriggerOffset(stickyHeader: HTMLElement | null): number {
  if (!stickyHeader) return 160;
  const stickyTop = Number(globalThis.getComputedStyle(stickyHeader).top.replace("px", "")) || 80;
  return Math.round(stickyTop + stickyHeader.offsetHeight);
}

function computeNextActiveIndex(stages: readonly StageMetadata[], triggerLine: number): number {
  let nextActiveIndex = 0;
  for (const [i, stage] of stages.entries()) {
    const rect = stage.node.getBoundingClientRect();
    if (rect.top + rect.height / 2 <= triggerLine + 4) {
      nextActiveIndex = i;
    } else {
      break;
    }
  }
  return nextActiveIndex;
}

function writeActiveStageState(ui: StickyUiElements, index: number, triggerOffset: number): void {
  const { container, routeGroups, stages, stickyCounterCurrent, stickyHeading, stickyProgress } =
    ui;
  const activeStage = stages[index];
  if (!activeStage) return;

  for (const [i, stage] of stages.entries()) {
    if (i === index) {
      stage.element.dataset["active"] = "true";
      delete stage.element.dataset["passed"];
    } else if (i < index) {
      delete stage.element.dataset["active"];
      stage.element.dataset["passed"] = "true";
    } else {
      delete stage.element.dataset["active"];
      delete stage.element.dataset["passed"];
    }
  }

  for (const [i, group] of routeGroups.entries()) {
    group.classList.toggle("hidden", i !== index);
  }

  container.style.setProperty("--itinerary-trigger-offset", `${triggerOffset}px`);

  if (stickyHeading) {
    stickyHeading.textContent = activeStage.ordinalLabel.toLocaleUpperCase(
      document.documentElement.lang || "en",
    );
  }

  if (stickyCounterCurrent) {
    stickyCounterCurrent.textContent = String(activeStage.stageNumber).padStart(2, "0");
  }

  if (stickyProgress) {
    stickyProgress.style.width = `${(activeStage.stageNumber / stages.length) * 100}%`;
  }
}

function computeFallbackTimelineRatio(
  stages: readonly StageMetadata[],
  nextActiveIndex: number,
  trackRect: DOMRect,
  triggerLine: number,
): number {
  let fillOffset = 0;
  if (nextActiveIndex >= stages.length - 1) {
    const last = stages.at(-1);
    if (last) {
      const rect = last.node.getBoundingClientRect();
      fillOffset = rect.top + rect.height / 2 - trackRect.top;
    }
  } else {
    const currentStage = stages[nextActiveIndex];
    const nextStage = stages[nextActiveIndex + 1];
    if (currentStage && nextStage) {
      const curRect = currentStage.node.getBoundingClientRect();
      const nextRect = nextStage.node.getBoundingClientRect();
      const currentY = curRect.top + curRect.height / 2 - trackRect.top;
      const nextY = nextRect.top + nextRect.height / 2 - trackRect.top;
      const currentViewportY = curRect.top + curRect.height / 2;
      const stageDistance = nextRect.top + nextRect.height / 2 - currentViewportY;
      const t =
        stageDistance > 0 ?
          Math.max(0, Math.min(1, (triggerLine - currentViewportY) / stageDistance))
        : 0;
      fillOffset = currentY + t * (nextY - currentY);
    }
  }
  return Math.max(0, Math.min(1, fillOffset / trackRect.height));
}

export function initTourItineraryTracker(): () => void {
  const container = document.querySelector<HTMLElement>("tour-itinerary-tracker");
  if (!container) return NOOP;

  const stages = collectItineraryStages(container);
  if (stages.length === 0) return NOOP;

  const stickyHeader = container.querySelector<HTMLElement>("[data-itinerary-header]");
  const timelineTrack = container.querySelector<HTMLElement>("[data-timeline-track]");
  const timelineFill = container.querySelector<HTMLElement>("[data-timeline-progress-fill]");

  const ui: StickyUiElements = {
    container,
    routeGroups: [...container.querySelectorAll<HTMLElement>("[data-sticky-route-group]")],
    stages,
    stickyCounterCurrent: container.querySelector<HTMLElement>("[data-sticky-counter-current]"),
    stickyHeading: container.querySelector<HTMLElement>("[data-sticky-heading]"),
    stickyProgress: container.querySelector<HTMLElement>("[data-sticky-progress]"),
  };

  let activeIndex = -1;
  let cachedTriggerOffset = 160;
  let observer: IntersectionObserver | null = null;

  const getTriggerLine = (): number =>
    stickyHeader ? stickyHeader.getBoundingClientRect().bottom : 160;

  const evaluateActiveStage = (): number => {
    const nextActiveIndex = computeNextActiveIndex(stages, getTriggerLine());
    if (nextActiveIndex !== activeIndex) {
      activeIndex = nextActiveIndex;
      writeActiveStageState(ui, nextActiveIndex, cachedTriggerOffset);
    }
    return nextActiveIndex;
  };

  const bindObserver = (): void => {
    observer?.disconnect();
    cachedTriggerOffset = measureStickyTriggerOffset(stickyHeader);
    container.style.setProperty("--itinerary-trigger-offset", `${cachedTriggerOffset}px`);

    if (typeof IntersectionObserver === "undefined") return;
    observer = new IntersectionObserver(
      () => {
        evaluateActiveStage();
      },
      { rootMargin: `-${cachedTriggerOffset}px 0px 0px 0px`, threshold: [0, 0.5, 1] },
    );
    for (const stage of stages) {
      observer.observe(stage.node);
    }
  };

  bindObserver();
  evaluateActiveStage();

  const prefersReduced =
    typeof window !== "undefined"
    && globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const supportsCssTimeline =
    typeof CSS !== "undefined" && CSS.supports("animation-timeline", "view()");

  if (prefersReduced || supportsCssTimeline) {
    const handleResize = (): void => {
      bindObserver();
      evaluateActiveStage();
    };
    globalThis.addEventListener("resize", handleResize, { passive: true });
    return () => {
      observer?.disconnect();
      globalThis.removeEventListener("resize", handleResize);
    };
  }

  let rafId: number | null = null;
  const updateFallbackFill = (): void => {
    rafId = null;
    // Batch all geometry reads before performing stage and progress-fill DOM writes.
    const triggerLine = getTriggerLine();
    const nextActiveIndex = computeNextActiveIndex(stages, triggerLine);
    const trackHeight = timelineTrack?.offsetHeight ?? 0;
    const trackRect =
      timelineTrack && timelineFill && trackHeight > 0 ?
        timelineTrack.getBoundingClientRect()
      : null;

    const ratio =
      trackRect ? computeFallbackTimelineRatio(stages, nextActiveIndex, trackRect, triggerLine) : 0;

    if (nextActiveIndex !== activeIndex) {
      activeIndex = nextActiveIndex;
      writeActiveStageState(ui, nextActiveIndex, cachedTriggerOffset);
    }

    if (timelineFill && trackRect) {
      timelineFill.style.scale = `1 ${ratio.toFixed(4)}`;
    }
  };

  const scheduleFallback = (): void => {
    rafId ??= globalThis.requestAnimationFrame(updateFallbackFill);
  };

  globalThis.addEventListener("scroll", scheduleFallback, { passive: true });
  globalThis.addEventListener("resize", scheduleFallback, { passive: true });
  scheduleFallback();

  return () => {
    observer?.disconnect();
    if (rafId !== null) {
      globalThis.cancelAnimationFrame(rafId);
    }
    globalThis.removeEventListener("scroll", scheduleFallback);
    globalThis.removeEventListener("resize", scheduleFallback);
  };
}

let cleanupTracker: (() => void) | null = null;

function setup(): void {
  if (cleanupTracker) {
    cleanupTracker();
    cleanupTracker = null;
  }
  cleanupTracker = initTourItineraryTracker();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup, { once: true });
  } else {
    setup();
  }
  globalThis.addEventListener(
    "pagehide",
    () => {
      if (!cleanupTracker) return;
      cleanupTracker();
      cleanupTracker = null;
    },
    { once: true },
  );
}

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

const NOOP = (): void => undefined;

export function initTourItineraryTracker(): () => void {
  const container = document.querySelector<HTMLElement>("tour-itinerary-tracker");
  if (!container) return NOOP;

  const stickyHeader = container.querySelector<HTMLElement>("[data-itinerary-header]");
  const stickyHeading = container.querySelector<HTMLElement>("[data-sticky-heading]");
  const stickyCounterCurrent = container.querySelector<HTMLElement>(
    "[data-sticky-counter-current]",
  );
  const stickyProgress = container.querySelector<HTMLElement>("[data-sticky-progress]");
  const timelineTrack = container.querySelector<HTMLElement>("[data-timeline-track]");
  const timelineFill = container.querySelector<HTMLElement>("[data-timeline-progress-fill]");
  const routeGroups = [...container.querySelectorAll<HTMLElement>("[data-sticky-route-group]")];

  const stageElements = [...container.querySelectorAll<HTMLElement>("[data-itinerary-stage]")];
  const totalStages = stageElements.length;
  if (totalStages === 0) return NOOP;

  const stages: StageMetadata[] = stageElements.map((el, index) => {
    const rawNumber = el.dataset["stageNumber"];
    const stageNumber = rawNumber ? Number(rawNumber) : index + 1;
    const ordinalLabel = el.dataset["stageOrdinal"] ?? String(stageNumber);
    const title = el.dataset["stageTitle"] ?? "";
    const route = el.dataset["stageRoute"] ?? title;
    const node = el.querySelector<HTMLElement>(".stage-node") ?? el;

    return { element: el, node, stageNumber, ordinalLabel, title, route };
  });

  let activeIndex = -1;

  const getStickyTriggerOffset = (): number => {
    if (!stickyHeader) return 160;
    const stickyTop = Number(globalThis.getComputedStyle(stickyHeader).top.replace("px", "")) || 80;
    return Math.round(stickyTop + stickyHeader.offsetHeight);
  };

  const getTriggerLine = (): number =>
    stickyHeader ? stickyHeader.getBoundingClientRect().bottom : 160;

  const syncActiveStage = (index: number): void => {
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

    container.style.setProperty("--itinerary-trigger-offset", `${getStickyTriggerOffset()}px`);

    if (stickyHeading) {
      stickyHeading.textContent = activeStage.ordinalLabel.toLocaleUpperCase(
        document.documentElement.lang || "en",
      );
    }

    if (stickyCounterCurrent) {
      stickyCounterCurrent.textContent = String(activeStage.stageNumber).padStart(2, "0");
    }

    if (stickyProgress) {
      stickyProgress.style.width = `${(activeStage.stageNumber / totalStages) * 100}%`;
    }
  };

  const evaluateActiveStage = (): number => {
    const triggerLine = getTriggerLine();
    let nextActiveIndex = 0;

    for (const [i, stage] of stages.entries()) {
      const rect = stage.node.getBoundingClientRect();
      if (rect.top + rect.height / 2 <= triggerLine + 4) {
        nextActiveIndex = i;
      } else {
        break;
      }
    }

    if (nextActiveIndex !== activeIndex) {
      activeIndex = nextActiveIndex;
      syncActiveStage(nextActiveIndex);
    }

    return nextActiveIndex;
  };

  let observer: IntersectionObserver | null = null;

  const bindObserver = (): void => {
    observer?.disconnect();
    const triggerOffset = getStickyTriggerOffset();
    container.style.setProperty("--itinerary-trigger-offset", `${triggerOffset}px`);

    if (typeof IntersectionObserver === "undefined") return;
    observer = new IntersectionObserver(
      () => {
        evaluateActiveStage();
      },
      { rootMargin: `-${triggerOffset}px 0px 0px 0px`, threshold: [0, 0.5, 1] },
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
    const currentIdx = evaluateActiveStage();
    if (!timelineTrack || !timelineFill || timelineTrack.offsetHeight <= 0) return;

    const triggerLine = getTriggerLine();
    const trackRect = timelineTrack.getBoundingClientRect();
    let fillOffset = 0;

    if (currentIdx >= totalStages - 1) {
      const last = stages.at(-1);
      if (last) {
        const rect = last.node.getBoundingClientRect();
        fillOffset = rect.top + rect.height / 2 - trackRect.top;
      }
    } else {
      const currentStage = stages[currentIdx];
      const nextStage = stages[currentIdx + 1];
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

    const ratio = Math.max(0, Math.min(1, fillOffset / trackRect.height));
    timelineFill.style.scale = `1 ${ratio.toFixed(4)}`;
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
  document.addEventListener("astro:page-load", setup);
  document.addEventListener("astro:before-swap", () => {
    if (!cleanupTracker) return;
    cleanupTracker();
    cleanupTracker = null;
  });
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup, { once: true });
  } else {
    setup();
  }
}

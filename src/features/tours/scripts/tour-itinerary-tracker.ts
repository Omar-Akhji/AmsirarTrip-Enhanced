/**
 * Tour Itinerary Scroll Tracker Syncs the sticky "Expedition Itinerary" header and travelling
 * timeline dot with the active Day-by-Day schedule.
 */

interface StageMetadata {
  readonly element: HTMLElement;
  readonly stageNumber: number;
  readonly ordinalLabel: string;
  readonly title: string;
  readonly route: string;
}

interface LenisGlobal {
  __lenis?: {
    stop: () => void;
    start: () => void;
    scrollTo: (target: number | HTMLElement, options?: { immediate?: boolean }) => void;
  };
}

const getLenis = (): LenisGlobal["__lenis"] => {
  return (globalThis as unknown as LenisGlobal).__lenis;
};

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
  const timelineDot = container.querySelector<HTMLElement>("[data-timeline-traveling-dot]");
  const routeGroups = [...container.querySelectorAll<HTMLElement>("[data-sticky-route-group]")];

  const stageElements = [...container.querySelectorAll<HTMLElement>("[data-itinerary-stage]")];
  const totalStages = stageElements.length;
  if (totalStages === 0) return NOOP;

  const stages: StageMetadata[] = stageElements.map((el, index) => {
    const rawNumber = el.dataset["stageNumber"];
    const stageNumber = rawNumber ? Number(rawNumber) : index + 1;
    const ordinalLabel = el.dataset["stageOrdinal"] ?? `Day ${stageNumber}`;
    const title = el.dataset["stageTitle"] ?? "";
    const route = el.dataset["stageRoute"] ?? title;

    return { element: el, stageNumber, ordinalLabel, title, route };
  });

  let activeIndex = -1;
  let isTicking = false;
  let isScrollPaused = false;
  let canResumeScroll = false;
  let pauseCooldownTimer: ReturnType<typeof setTimeout> | undefined;
  let lastPausedStageIndex = -1;

  const getTriggerLine = (): number => {
    const stickyBottom = stickyHeader ? stickyHeader.getBoundingClientRect().bottom : 80;
    return stickyBottom + 24;
  };

  const getStageNodeCenterY = (stageEl: HTMLElement, trackTop: number): number => {
    const node = stageEl.querySelector<HTMLElement>(".stage-node");
    if (node) {
      const nodeRect = node.getBoundingClientRect();
      return nodeRect.top + nodeRect.height / 2 - trackTop;
    }
    return stageEl.getBoundingClientRect().top - trackTop;
  };

  const getStageNodeViewportY = (stageEl: HTMLElement): number => {
    const node = stageEl.querySelector<HTMLElement>(".stage-node");
    if (node) {
      const nodeRect = node.getBoundingClientRect();
      return nodeRect.top + nodeRect.height / 2;
    }
    return stageEl.getBoundingClientRect().top;
  };

  const resumeScroll = (): void => {
    if (!isScrollPaused) return;
    isScrollPaused = false;
    canResumeScroll = false;
    clearTimeout(pauseCooldownTimer);

    const lenis = getLenis();
    if (lenis) {
      lenis.start();
    }
  };

  const pauseAtStage = (stageIndex: number): void => {
    if (stageIndex === lastPausedStageIndex || stageIndex <= 0) return;
    lastPausedStageIndex = stageIndex;

    const stage = stages[stageIndex];
    if (!stage) return;

    // Align the stage node directly with triggerLine so the orange dot replaces the gray one
    const triggerLine = getTriggerLine();
    const nodeViewportY = getStageNodeViewportY(stage.element);
    const snapDelta = nodeViewportY - triggerLine;

    const lenis = getLenis();
    if (Math.abs(snapDelta) > 1) {
      const targetScroll = globalThis.scrollY + snapDelta;
      if (lenis) {
        lenis.scrollTo(targetScroll, { immediate: true });
      } else {
        globalThis.scrollTo({ top: targetScroll, behavior: "instant" });
      }
    }

    // Stop scrolling at this exact position until another scroll is made
    isScrollPaused = true;
    canResumeScroll = false;

    if (lenis) {
      lenis.stop();
    }

    clearTimeout(pauseCooldownTimer);
    pauseCooldownTimer = setTimeout(() => {
      canResumeScroll = true;
    }, 400);
  };

  const syncActiveStage = (index: number): void => {
    const activeStage = stages[index];
    if (!activeStage) return;

    for (const [i, s] of stages.entries()) {
      if (i === index) {
        s.element.dataset["active"] = "true";
        delete s.element.dataset["passed"];
      } else if (i < index) {
        delete s.element.dataset["active"];
        s.element.dataset["passed"] = "true";
      } else {
        delete s.element.dataset["active"];
        delete s.element.dataset["passed"];
      }
    }

    for (const [i, group] of routeGroups.entries()) {
      group.classList.toggle("hidden", i !== index);
    }

    if (stickyHeading) {
      stickyHeading.textContent = activeStage.ordinalLabel.toUpperCase();
    }

    if (stickyCounterCurrent) {
      stickyCounterCurrent.textContent = String(activeStage.stageNumber).padStart(2, "0");
    }

    if (!stickyProgress) return;
    const percentage = (activeStage.stageNumber / totalStages) * 100;
    stickyProgress.style.width = `${percentage}%`;
  };

  const update = (): void => {
    const triggerLine = getTriggerLine();

    let newActiveIndex = 0;
    for (const [i, stage] of stages.entries()) {
      const nodeViewportY = getStageNodeViewportY(stage.element);
      if (nodeViewportY <= triggerLine) {
        newActiveIndex = i;
      } else {
        break;
      }
    }

    if (newActiveIndex !== activeIndex) {
      const previousIndex = activeIndex;
      activeIndex = newActiveIndex;
      syncActiveStage(newActiveIndex);

      if (previousIndex >= 0 && newActiveIndex > previousIndex) {
        pauseAtStage(newActiveIndex);
      }
    }

    if (!timelineTrack || !timelineDot) return;
    const trackRect = timelineTrack.getBoundingClientRect();
    const stickyBottom = stickyHeader ? stickyHeader.getBoundingClientRect().bottom : 80;

    let dotOffset = 0;
    if (newActiveIndex >= totalStages - 1) {
      const lastStage = stages.at(-1);
      if (lastStage) {
        dotOffset = getStageNodeCenterY(lastStage.element, trackRect.top);

        // When scrolling past the final stage, hide orange dot so it does not appear in front of it
        const lastNodeViewportY = getStageNodeViewportY(lastStage.element);
        timelineDot.style.opacity = lastNodeViewportY < stickyBottom ? "0" : "1";
      }
    } else {
      timelineDot.style.opacity = "1";
      const currentStage = stages[newActiveIndex];
      const nextStage = stages[newActiveIndex + 1];
      if (currentStage && nextStage) {
        const currentY = getStageNodeCenterY(currentStage.element, trackRect.top);
        const nextY = getStageNodeCenterY(nextStage.element, trackRect.top);

        const currentViewportY = getStageNodeViewportY(currentStage.element);
        const nextViewportY = getStageNodeViewportY(nextStage.element);
        const stageDistance = nextViewportY - currentViewportY;

        let t = 0;
        if (stageDistance > 0) {
          const scrollDistance = triggerLine - currentViewportY;
          t = Math.max(0, Math.min(1, scrollDistance / stageDistance));
        }

        dotOffset = currentY + t * (nextY - currentY);
      }
    }

    // Place the center of the orange dot exactly at dotOffset
    timelineDot.style.transform = `translate3d(-50%, calc(${dotOffset}px - 50%), 0)`;

    if (!timelineFill) return;
    const fillPercentage = (dotOffset / trackRect.height) * 100;
    timelineFill.style.height = `${fillPercentage}%`;
  };

  const requestTick = (): void => {
    if (isTicking) return;
    isTicking = true;
    requestAnimationFrame(() => {
      update();
      isTicking = false;
    });
  };

  const handleUserScrollInput = (e: Event): void => {
    if (!isScrollPaused) return;
    if (!canResumeScroll) {
      e.preventDefault();
      return;
    }
    // The user initiated another scroll gesture -> unlock and allow movement
    resumeScroll();
  };

  const handleKeyDown = (e: KeyboardEvent): void => {
    if (
      !isScrollPaused
      || !["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Space"].includes(e.code)
    ) {
      return;
    }

    if (!canResumeScroll) {
      e.preventDefault();
      return;
    }
    resumeScroll();
  };

  globalThis.addEventListener("scroll", requestTick, { passive: true });
  globalThis.addEventListener("resize", requestTick, { passive: true });
  globalThis.addEventListener("wheel", handleUserScrollInput, { passive: false });
  globalThis.addEventListener("touchmove", handleUserScrollInput, { passive: false });
  globalThis.addEventListener("keydown", handleKeyDown);

  update();

  return () => {
    globalThis.removeEventListener("scroll", requestTick);
    globalThis.removeEventListener("resize", requestTick);
    globalThis.removeEventListener("wheel", handleUserScrollInput);
    globalThis.removeEventListener("touchmove", handleUserScrollInput);
    globalThis.removeEventListener("keydown", handleKeyDown);
    resumeScroll();
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

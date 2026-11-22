/** Interactive Hero 3D Clip-Path Carousel Controller. */

function parseCssDurationMs(element: HTMLElement, property: string, fallbackMs: number): number {
  const raw = getComputedStyle(element).getPropertyValue(property).trim();
  if (!raw) return fallbackMs;
  if (raw.endsWith("ms")) {
    const parsed = Number(raw.slice(0, -2));
    return Number.isNaN(parsed) ? fallbackMs : parsed;
  }
  if (raw.endsWith("s")) {
    const parsed = Number(raw.slice(0, -1)) * 1000;
    return Number.isNaN(parsed) ? fallbackMs : parsed;
  }
  return fallbackMs;
}

function syncActiveSlideAria(sliderList: HTMLElement): void {
  const items = sliderList.querySelectorAll<HTMLElement>(":scope > .item");
  for (const [index, item] of items.entries()) {
    const isActive = index === 0;
    item.setAttribute("aria-hidden", isActive ? "false" : "true");
  }
}

function applyInitialThumbnailOffset(slider: HTMLElement, thumbnail: HTMLElement): void {
  const initialThumbnails = thumbnail.querySelectorAll<HTMLElement>(":scope > .item");
  const firstThumb = initialThumbnails[0];
  if (firstThumb && !slider.dataset["offsetApplied"]) {
    thumbnail.append(firstThumb);
    slider.dataset["offsetApplied"] = "true";
  }
}

interface CompletionScheduleOptions {
  readonly animatedImg: HTMLImageElement | null;
  readonly durationMs: number;
  readonly expectedAnimation: string;
  readonly onDone: () => void;
  readonly registerSafetyTimer: (timer: ReturnType<typeof setTimeout>) => void;
  readonly signal: AbortSignal;
}

function scheduleSlideCompletion({
  animatedImg,
  durationMs,
  expectedAnimation,
  onDone,
  registerSafetyTimer,
  signal,
}: CompletionScheduleOptions): void {
  let completed = false;
  const onAnimationEnd = (event: AnimationEvent): void => {
    if (event.animationName === expectedAnimation) {
      finish();
    }
  };

  const timerId = setTimeout(() => {
    finish();
  }, durationMs + 50);

  function finish(): void {
    if (completed) return;
    completed = true;
    clearTimeout(timerId);
    animatedImg?.removeEventListener("animationend", onAnimationEnd);
    onDone();
  }

  animatedImg?.addEventListener("animationend", onAnimationEnd, { signal });
  registerSafetyTimer(timerId);
}

interface SlideTransitionContext {
  readonly direction: "next" | "prev";
  readonly durationMs: number;
  readonly finishAnimation: () => void;
  readonly registerSafetyTimer: (timer: ReturnType<typeof setTimeout>) => void;
  readonly signal: AbortSignal;
  readonly slider: HTMLElement;
  readonly sliderList: HTMLElement;
  readonly thumbnail: HTMLElement;
}

function performSlideTransition(ctx: SlideTransitionContext): boolean {
  const {
    direction,
    durationMs,
    finishAnimation,
    registerSafetyTimer,
    signal,
    slider,
    sliderList,
    thumbnail,
  } = ctx;
  const currentSliderItems = sliderList.querySelectorAll<HTMLElement>(":scope > .item");
  const currentThumbnailItems = thumbnail.querySelectorAll<HTMLElement>(":scope > .item");

  if (currentSliderItems.length < 2 || currentThumbnailItems.length < 2) {
    return false;
  }

  const activeSlide = currentSliderItems[0];
  if (direction === "next") {
    const incomingSlide = currentSliderItems[1];
    const firstThumb = currentThumbnailItems[0];
    if (!activeSlide || !incomingSlide || !firstThumb) return false;

    activeSlide.classList.add("is-outgoing");
    incomingSlide.classList.add("is-incoming");
    firstThumb.classList.add("is-expanding");
    slider.classList.add("is-next");

    scheduleSlideCompletion({
      animatedImg: incomingSlide.querySelector<HTMLImageElement>("img"),
      durationMs,
      expectedAnimation: "heroShowImageClip",
      registerSafetyTimer,
      signal,
      onDone: () => {
        sliderList.append(activeSlide);
        thumbnail.append(firstThumb);
        activeSlide.classList.remove("is-outgoing");
        incomingSlide.classList.remove("is-incoming");
        firstThumb.classList.remove("is-expanding");
        slider.classList.remove("is-next");
        syncActiveSlideAria(sliderList);
        finishAnimation();
      },
    });
    return true;
  }

  const lastSlide = currentSliderItems[currentSliderItems.length - 1];
  const lastThumb = currentThumbnailItems[currentThumbnailItems.length - 1];
  if (!activeSlide || !lastSlide || !lastThumb) return false;

  sliderList.prepend(lastSlide);
  lastThumb.style.opacity = "0";
  activeSlide.classList.add("is-outgoing");
  lastSlide.classList.add("is-incoming");
  slider.classList.add("is-prev");

  scheduleSlideCompletion({
    animatedImg: activeSlide.querySelector<HTMLImageElement>("img"),
    durationMs,
    expectedAnimation: "heroHideImageClip",
    registerSafetyTimer,
    signal,
    onDone: () => {
      thumbnail.prepend(lastThumb);
      lastThumb.style.opacity = "";
      activeSlide.classList.remove("is-outgoing");
      lastSlide.classList.remove("is-incoming");
      slider.classList.remove("is-prev");
      syncActiveSlideAria(sliderList);
      finishAnimation();
    },
  });
  return true;
}

function advanceDomBeforeTarget(
  sliderList: HTMLElement,
  thumbnail: HTMLElement,
  targetIndex: number,
  moveSlider: (direction: "next" | "prev") => void,
): void {
  const activeItem = sliderList.querySelector<HTMLElement>(":scope > .item:first-child");
  const activeIndexStr = activeItem?.dataset["index"];
  if (activeIndexStr === undefined) return;

  const activeIndex = Number(activeIndexStr);
  if (targetIndex === activeIndex) return;

  if (targetIndex > activeIndex) {
    const steps = targetIndex - activeIndex;
    for (let i = 0; i < steps - 1; i++) {
      const intermediateSlide = sliderList.querySelector<HTMLElement>(
        ":scope > .item:nth-child(2)",
      );
      const firstThumb = thumbnail.querySelector<HTMLElement>(":scope > .item");
      if (intermediateSlide) sliderList.append(intermediateSlide);
      if (firstThumb) thumbnail.append(firstThumb);
    }
    moveSlider("next");
    return;
  }

  const steps = activeIndex - targetIndex;
  for (let i = 0; i < steps - 1; i++) {
    const lastSlide = sliderList.querySelector<HTMLElement>(":scope > .item:last-child");
    const lastThumb = thumbnail.querySelector<HTMLElement>(":scope > .item:last-child");
    if (lastSlide) sliderList.prepend(lastSlide);
    if (lastThumb) thumbnail.prepend(lastThumb);
  }
  moveSlider("prev");
}

function bindSliderPauseButton(
  sliderSection: HTMLElement,
  signal: AbortSignal,
  onToggle: () => boolean,
): void {
  const pauseToggleBtn = sliderSection.querySelector<HTMLButtonElement>("[data-slider-toggle]");
  if (!pauseToggleBtn) return;

  pauseToggleBtn.addEventListener(
    "click",
    () => {
      const paused = onToggle();
      pauseToggleBtn.setAttribute("aria-pressed", paused ? "true" : "false");
      const nextLabel =
        paused ? pauseToggleBtn.dataset["labelPlay"] : pauseToggleBtn.dataset["labelPause"];
      if (nextLabel) {
        pauseToggleBtn.setAttribute("aria-label", nextLabel);
      }
      pauseToggleBtn
        .querySelector<HTMLElement>("[data-icon-pause]")
        ?.classList.toggle("hidden", paused);
      pauseToggleBtn
        .querySelector<HTMLElement>("[data-icon-play]")
        ?.classList.toggle("hidden", !paused);
    },
    { signal },
  );
}

interface SliderInteractionsOptions {
  readonly isAnimating: () => boolean;
  readonly moveSlider: (direction: "next" | "prev") => void;
  readonly onGoToSlide: (targetIndex: number) => void;
  readonly signal: AbortSignal;
  readonly slider: HTMLElement;
  readonly sliderSection: HTMLElement;
  readonly startAutoplay: () => void;
  readonly stopAutoplay: () => void;
  readonly thumbnail: HTMLElement;
}

function bindSliderInteractions(opts: SliderInteractionsOptions): void {
  const {
    isAnimating,
    moveSlider,
    onGoToSlide,
    signal,
    slider,
    sliderSection,
    startAutoplay,
    stopAutoplay,
    thumbnail,
  } = opts;

  thumbnail.addEventListener(
    "click",
    (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest<HTMLElement>(".item");
      if (!target || isAnimating()) return;

      const targetIndexStr = target.dataset["index"];
      if (!targetIndexStr) {
        stopAutoplay();
        moveSlider("next");
        startAutoplay();
        return;
      }
      onGoToSlide(Number(targetIndexStr));
    },
    { signal },
  );

  sliderSection.addEventListener(
    "keydown",
    (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (
        e.target instanceof HTMLInputElement
        || e.target instanceof HTMLTextAreaElement
        || e.target instanceof HTMLSelectElement
        || (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }
      if (e.key === "ArrowRight") {
        stopAutoplay();
        moveSlider("next");
        startAutoplay();
      } else if (e.key === "ArrowLeft") {
        stopAutoplay();
        moveSlider("prev");
        startAutoplay();
      }
    },
    { signal },
  );

  let activePointerId: number | null = null;
  let touchStartX = 0;
  let touchStartY = 0;

  slider.addEventListener(
    "pointerdown",
    (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      activePointerId = e.pointerId;
      touchStartX = e.clientX;
      touchStartY = e.clientY;
    },
    { passive: true, signal },
  );
  slider.addEventListener(
    "pointerup",
    (e: PointerEvent) => {
      if (e.pointerType === "mouse" || activePointerId !== e.pointerId) return;
      activePointerId = null;
      const diffX = e.clientX - touchStartX;
      const diffY = e.clientY - touchStartY;
      if (!(Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40)) return;
      stopAutoplay();
      moveSlider(diffX < 0 ? "next" : "prev");
      startAutoplay();
    },
    { passive: true, signal },
  );
  slider.addEventListener(
    "pointercancel",
    (e: PointerEvent) => {
      if (activePointerId === e.pointerId) activePointerId = null;
    },
    { passive: true, signal },
  );

  slider.addEventListener("mouseenter", stopAutoplay, { signal });
  slider.addEventListener("mouseleave", startAutoplay, { signal });
  slider.addEventListener("focusin", stopAutoplay, { signal });
  slider.addEventListener("focusout", startAutoplay, { signal });
}

function initSlider(): void {
  const slider = document.querySelector<HTMLElement>("#home-hero-slider");
  if (!slider || slider.dataset["sliderInitialized"] === "true") return;

  const sliderList = slider.querySelector<HTMLElement>(":scope > .list");
  const thumbnail = slider.querySelector<HTMLElement>(":scope > .thumbnail");
  if (!sliderList || !thumbnail) return;

  slider.dataset["sliderInitialized"] = "true";
  const sliderSection = slider.closest<HTMLElement>("#home-hero-slider-section") ?? slider;
  const controller = new AbortController();
  const { signal } = controller;

  applyInitialThumbnailOffset(slider, thumbnail);
  syncActiveSlideAria(sliderList);

  let isAnimating = false;
  let isPausedByUser = false;
  let autoplayTimer: ReturnType<typeof setInterval> | undefined;
  let activeSafetyTimer: ReturnType<typeof setTimeout> | undefined;
  const slideDurationMs = parseCssDurationMs(slider, "--hero-duration", 750);

  const stopAutoplay = (): void => {
    if (!autoplayTimer) return;
    clearInterval(autoplayTimer);
    autoplayTimer = undefined;
  };

  const moveSlider = (direction: "next" | "prev"): void => {
    if (isAnimating) return;
    isAnimating = true;
    const started = performSlideTransition({
      direction,
      durationMs: slideDurationMs,
      finishAnimation: () => {
        isAnimating = false;
      },
      registerSafetyTimer: (timer) => {
        activeSafetyTimer = timer;
      },
      signal,
      slider,
      sliderList,
      thumbnail,
    });
    if (!started) isAnimating = false;
  };

  const startAutoplay = (): void => {
    stopAutoplay();
    if (isPausedByUser || globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    autoplayTimer = setInterval(() => {
      moveSlider("next");
    }, 2000);
  };

  bindSliderPauseButton(sliderSection, signal, () => {
    isPausedByUser = !isPausedByUser;
    if (isPausedByUser) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
    return isPausedByUser;
  });

  bindSliderInteractions({
    isAnimating: () => isAnimating,
    moveSlider,
    signal,
    slider,
    sliderSection,
    startAutoplay,
    stopAutoplay,
    thumbnail,
    onGoToSlide: (targetIndex) => {
      if (isAnimating) return;
      stopAutoplay();
      advanceDomBeforeTarget(sliderList, thumbnail, targetIndex, moveSlider);
      startAutoplay();
    },
  });

  startAutoplay();

  globalThis.addEventListener(
    "pagehide",
    () => {
      clearTimeout(activeSafetyTimer);
      delete slider.dataset["sliderInitialized"];
      stopAutoplay();
      controller.abort();
    },
    { once: true },
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSlider, { once: true });
} else {
  initSlider();
}

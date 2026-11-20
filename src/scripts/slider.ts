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

function initSlider(): void {
  const rootSlider = document.querySelector<HTMLElement>("#home-hero-slider");
  if (!rootSlider || rootSlider.dataset["sliderInitialized"] === "true") {
    return;
  }

  const rootList = rootSlider.querySelector<HTMLElement>(":scope > .list");
  const rootThumb = rootSlider.querySelector<HTMLElement>(":scope > .thumbnail");

  if (!rootList || !rootThumb) return;
  rootSlider.dataset["sliderInitialized"] = "true";

  const slider = rootSlider;
  const sliderList = rootList;
  const thumbnail = rootThumb;

  let pendingTargetIndex: number | null = null;

  // Offset thumbnail list by 1 so the upcoming slide appears first.
  const initialThumbnails = thumbnail.querySelectorAll<HTMLElement>(":scope > .item");
  if (initialThumbnails.length > 0 && !slider.dataset["offsetApplied"]) {
    const firstThumb = initialThumbnails[0];
    if (firstThumb) {
      thumbnail.append(firstThumb);
      slider.dataset["offsetApplied"] = "true";
    }
  }

  let isAnimating = false;
  let autoplayTimer: ReturnType<typeof setInterval> | undefined;
  let activeSafetyTimer: ReturnType<typeof setTimeout> | undefined;

  function scheduleCompletion(
    animatedImg: HTMLImageElement | null,
    expectedAnimation: string,
    onDone: () => void,
  ): void {
    let completed = false;
    const finish = () => {
      if (completed) return;
      completed = true;
      clearTimeout(activeSafetyTimer);
      animatedImg?.removeEventListener("animationend", onAnimationEnd);
      onDone();
    };

    const onAnimationEnd = (event: AnimationEvent) => {
      if (event.animationName === expectedAnimation) {
        finish();
      }
    };

    animatedImg?.addEventListener("animationend", onAnimationEnd);
    const durationMs = parseCssDurationMs(slider, "--hero-duration", 750);
    activeSafetyTimer = setTimeout(finish, durationMs + 50);
  }

  function flushPendingTarget(): void {
    if (pendingTargetIndex === null) return;
    const nextTarget = pendingTargetIndex;
    pendingTargetIndex = null;
    const currentActive = sliderList.querySelector<HTMLElement>(":scope > .item:first-child");
    const currentIndex = Number(currentActive?.dataset["index"] ?? 0);
    if (nextTarget !== currentIndex) {
      goToSlide(nextTarget);
    }
  }

  function moveSlider(direction: "next" | "prev"): void {
    if (isAnimating) return;
    isAnimating = true;

    const currentSliderItems = sliderList.querySelectorAll<HTMLElement>(":scope > .item");
    const currentThumbnailItems = thumbnail.querySelectorAll<HTMLElement>(":scope > .item");

    if (currentSliderItems.length < 2 || currentThumbnailItems.length < 2) {
      isAnimating = false;
      return;
    }

    const activeSlide = currentSliderItems[0];

    if (direction === "next") {
      const incomingSlide = currentSliderItems[1];
      const firstThumb = currentThumbnailItems[0];

      if (!activeSlide || !incomingSlide || !firstThumb) {
        isAnimating = false;
        return;
      }

      activeSlide.classList.add("is-outgoing");
      incomingSlide.classList.add("is-incoming");
      firstThumb.classList.add("is-expanding");
      slider.classList.add("is-next");

      const animatedImg = incomingSlide.querySelector<HTMLImageElement>("img");
      scheduleCompletion(animatedImg, "heroShowImageClip", () => {
        sliderList.append(activeSlide);
        thumbnail.append(firstThumb);

        activeSlide.classList.remove("is-outgoing");
        incomingSlide.classList.remove("is-incoming");
        firstThumb.classList.remove("is-expanding");
        slider.classList.remove("is-next");

        isAnimating = false;
        flushPendingTarget();
      });
    } else {
      const lastSlide = currentSliderItems[currentSliderItems.length - 1];
      const lastThumb = currentThumbnailItems[currentThumbnailItems.length - 1];

      if (!activeSlide || !lastSlide || !lastThumb) {
        isAnimating = false;
        return;
      }

      sliderList.prepend(lastSlide);
      lastThumb.style.opacity = "0";

      activeSlide.classList.add("is-outgoing");
      lastSlide.classList.add("is-incoming");
      slider.classList.add("is-prev");

      const animatedImg = activeSlide.querySelector<HTMLImageElement>("img");
      scheduleCompletion(animatedImg, "heroHideImageClip", () => {
        thumbnail.prepend(lastThumb);
        lastThumb.style.opacity = "";

        activeSlide.classList.remove("is-outgoing");
        lastSlide.classList.remove("is-incoming");
        slider.classList.remove("is-prev");

        isAnimating = false;
        flushPendingTarget();
      });
    }
  }

  const AUTOPLAY_INTERVAL = 2000;

  function startAutoplay(): void {
    stopAutoplay();
    if (globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    autoplayTimer = setInterval(() => {
      moveSlider("next");
    }, AUTOPLAY_INTERVAL);
  }

  function stopAutoplay(): void {
    if (!autoplayTimer) return;
    clearInterval(autoplayTimer);
    autoplayTimer = undefined;
  }

  function goToSlide(targetIndex: number): void {
    if (isAnimating) return;

    const currentSliderItems = sliderList.querySelectorAll<HTMLElement>(":scope > .item");
    const currentThumbnailItems = thumbnail.querySelectorAll<HTMLElement>(":scope > .item");

    if (currentSliderItems.length < 2 || currentThumbnailItems.length < 2) return;

    const activeItem = sliderList.querySelector<HTMLElement>(":scope > .item:first-child");
    const activeIndexStr = activeItem?.dataset["index"];
    if (activeIndexStr === undefined) return;

    const activeIndex = Number(activeIndexStr);
    if (targetIndex === activeIndex) return;

    stopAutoplay();

    if (targetIndex > activeIndex) {
      const steps = targetIndex - activeIndex;
      if (steps > 1) {
        for (let i = 0; i < steps - 1; i++) {
          const intermediateSlide = sliderList.querySelector<HTMLElement>(
            ":scope > .item:nth-child(2)",
          );
          const firstThumb = thumbnail.querySelector<HTMLElement>(":scope > .item");
          if (intermediateSlide) sliderList.append(intermediateSlide);
          if (firstThumb) thumbnail.append(firstThumb);
        }
      }
      moveSlider("next");
    } else {
      const steps = activeIndex - targetIndex;
      if (steps > 1) {
        for (let i = 0; i < steps - 1; i++) {
          const lastSlide = sliderList.querySelector<HTMLElement>(":scope > .item:last-child");
          const lastThumb = thumbnail.querySelector<HTMLElement>(":scope > .item:last-child");
          if (lastSlide) sliderList.prepend(lastSlide);
          if (lastThumb) thumbnail.prepend(lastThumb);
        }
      }
      moveSlider("prev");
    }

    startAutoplay();
  }

  const onThumbnailClick = (e: MouseEvent) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>(".item");
    if (!target || isAnimating) return;

    const targetIndexStr = target.dataset["index"];
    if (!targetIndexStr) {
      stopAutoplay();
      moveSlider("next");
      startAutoplay();
      return;
    }

    goToSlide(Number(targetIndexStr));
  };

  thumbnail.addEventListener("click", onThumbnailClick);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
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
  };

  globalThis.addEventListener("keydown", onKeyDown);

  let touchStartX = 0;
  let touchStartY = 0;

  const onTouchStart = (e: TouchEvent) => {
    const touch = e.changedTouches[0];
    if (!touch) return;
    touchStartX = touch.screenX;
    touchStartY = touch.screenY;
  };

  const onTouchEnd = (e: TouchEvent) => {
    const touch = e.changedTouches[0];
    if (!touch) return;

    const diffX = touch.screenX - touchStartX;
    const diffY = touch.screenY - touchStartY;

    if (!(Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40)) {
      return;
    }

    stopAutoplay();
    moveSlider(diffX < 0 ? "next" : "prev");
    startAutoplay();
  };

  slider.addEventListener("touchstart", onTouchStart, { passive: true });
  slider.addEventListener("touchend", onTouchEnd, { passive: true });
  slider.addEventListener("mouseenter", stopAutoplay);
  slider.addEventListener("mouseleave", startAutoplay);
  slider.addEventListener("focusin", stopAutoplay);
  slider.addEventListener("focusout", startAutoplay);

  startAutoplay();

  const cleanup = () => {
    clearTimeout(activeSafetyTimer);
    delete slider.dataset["sliderInitialized"];
    stopAutoplay();
    thumbnail.removeEventListener("click", onThumbnailClick);
    globalThis.removeEventListener("keydown", onKeyDown);
    slider.removeEventListener("touchstart", onTouchStart);
    slider.removeEventListener("touchend", onTouchEnd);
    slider.removeEventListener("mouseenter", stopAutoplay);
    slider.removeEventListener("mouseleave", startAutoplay);
    slider.removeEventListener("focusin", stopAutoplay);
    slider.removeEventListener("focusout", startAutoplay);
    document.removeEventListener("astro:before-swap", cleanup);
  };

  document.addEventListener("astro:before-swap", cleanup, { once: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSlider);
} else {
  initSlider();
}

document.addEventListener("astro:page-load", initSlider);

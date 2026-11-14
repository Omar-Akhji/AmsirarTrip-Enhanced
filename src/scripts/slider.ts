/**
 * Interactive Slider Controller Inspired by Lun Dev Magic 3D Carousel Slider Implements fluid
 * thumbnail expansion, bidirectional animation, touch gestures, keyboard controls, and accessible
 * lifecycle management.
 */

function initSlider(): void {
  const rootSlider = document.querySelector<HTMLElement>("#home-hero-slider");
  if (
    !rootSlider
    || rootSlider.id === "home-hero-slider-skeleton"
    || rootSlider.dataset["sliderInitialized"] === "true"
  ) {
    return;
  }

  const rootList = rootSlider.querySelector<HTMLElement>(":scope > .list");
  const rootThumb = rootSlider.querySelector<HTMLElement>(":scope > .thumbnail");

  if (!rootList || !rootThumb) return;
  rootSlider.dataset["sliderInitialized"] = "true";

  const slider: HTMLElement = rootSlider;
  const sliderList: HTMLElement = rootList;
  const thumbnail: HTMLElement = rootThumb;

  const nextBtn = slider.querySelector<HTMLButtonElement>(".next");
  const prevBtn = slider.querySelector<HTMLButtonElement>(".prev");
  const progressBar = slider.querySelector<HTMLElement>("#slider-progress-bar");
  const numberItems = slider.querySelectorAll<HTMLElement>(":scope .slide-numbers .number-item");
  const dotButtons = slider.querySelectorAll<HTMLButtonElement>(".hero-dot-btn");
  const lineFills = slider.querySelectorAll<HTMLElement>(".hero-dot-line-fill");
  const totalSlides = sliderList.querySelectorAll<HTMLElement>(":scope > .item").length || 3;

  let pendingTargetIndex: number | null = null;

  function updatePagination(forcedIndex?: number): void {
    let activeIndex: number;
    if (typeof forcedIndex === "number") {
      activeIndex = forcedIndex;
    } else {
      const activeItem = sliderList.querySelector<HTMLElement>(":scope > .item:first-child");
      const activeIndexStr = activeItem?.dataset["index"];
      activeIndex = activeIndexStr ? Number(activeIndexStr) : 0;
    }

    if (progressBar) {
      const percentage = ((activeIndex + 1) / totalSlides) * 100;
      progressBar.style.width = `${percentage}%`;
    }

    for (const [index, el] of numberItems.entries()) {
      el.classList.toggle("active", index === activeIndex);
    }

    for (const [index, dot] of dotButtons.entries()) {
      const isActive = index === activeIndex;
      dot.classList.toggle("active", isActive);
      dot.toggleAttribute("aria-current", isActive);
    }

    for (const [lineIndex, lineFill] of lineFills.entries()) {
      if (lineIndex < activeIndex) {
        lineFill.style.height = "100%";
      } else {
        lineFill.style.height = "0%";
      }
    }
  }

  // Re-order initial thumbnail by 1 step so that thumbnail list displays the upcoming slide first
  const initialThumbnails = thumbnail.querySelectorAll<HTMLElement>(":scope > .item");
  if (initialThumbnails.length > 0 && !slider.dataset["offsetApplied"]) {
    const firstThumb = initialThumbnails[0];
    if (firstThumb) {
      thumbnail.append(firstThumb);
      slider.dataset["offsetApplied"] = "true";
    }
  }

  updatePagination();

  let isAnimating = false;
  let autoplayTimer: ReturnType<typeof setInterval> | undefined;

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

      const nextIndex = Number(incomingSlide.dataset["index"] ?? 0);
      updatePagination(nextIndex);

      let cleanedUp = false;
      const finalizeNext = () => {
        if (cleanedUp) return;
        cleanedUp = true;

        sliderList.append(activeSlide);
        thumbnail.append(firstThumb);

        activeSlide.classList.remove("is-outgoing");
        incomingSlide.classList.remove("is-incoming");
        firstThumb.classList.remove("is-expanding");
        slider.classList.remove("is-next");

        isAnimating = false;

        if (pendingTargetIndex !== null) {
          const nextTarget = pendingTargetIndex;
          pendingTargetIndex = null;
          const currentActive = sliderList.querySelector<HTMLElement>(":scope > .item:first-child");
          const currentIndex = Number(currentActive?.dataset["index"] ?? 0);
          if (nextTarget !== currentIndex) {
            goToSlide(nextTarget);
          }
        }
      };

      setTimeout(finalizeNext, 760);
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

      const prevIndex = Number(lastSlide.dataset["index"] ?? 0);
      updatePagination(prevIndex);

      let cleanedUp = false;
      const finalizePrev = () => {
        if (cleanedUp) return;
        cleanedUp = true;

        thumbnail.prepend(lastThumb);
        lastThumb.style.opacity = "";

        activeSlide.classList.remove("is-outgoing");
        lastSlide.classList.remove("is-incoming");
        slider.classList.remove("is-prev");

        isAnimating = false;

        if (pendingTargetIndex !== null) {
          const nextTarget = pendingTargetIndex;
          pendingTargetIndex = null;
          const currentActive = sliderList.querySelector<HTMLElement>(":scope > .item:first-child");
          const currentIndex = Number(currentActive?.dataset["index"] ?? 0);
          if (nextTarget !== currentIndex) {
            goToSlide(nextTarget);
          }
        }
      };

      setTimeout(finalizePrev, 760);
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

  // Button clicks
  const onNextClick = (e: MouseEvent) => {
    e.preventDefault();
    stopAutoplay();
    moveSlider("next");
    startAutoplay();
  };

  const onPrevClick = (e: MouseEvent) => {
    e.preventDefault();
    stopAutoplay();
    moveSlider("prev");
    startAutoplay();
  };

  nextBtn?.addEventListener("click", onNextClick);
  prevBtn?.addEventListener("click", onPrevClick);

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
      if (steps === 1) {
        moveSlider("next");
      } else {
        // Multi-step forward: bring target slide right behind active slide
        for (let i = 0; i < steps - 1; i++) {
          const intermediateSlide = sliderList.querySelector<HTMLElement>(
            ":scope > .item:nth-child(2)",
          );
          const firstThumb = thumbnail.querySelector<HTMLElement>(":scope > .item");
          if (intermediateSlide) {
            sliderList.append(intermediateSlide);
          }
          if (firstThumb) {
            thumbnail.append(firstThumb);
          }
        }
        moveSlider("next");
      }
    } else {
      const steps = activeIndex - targetIndex;
      if (steps === 1) {
        moveSlider("prev");
      } else {
        // Multi-step backward: bring target slide to the end so moveSlider("prev") prepends it
        for (let i = 0; i < steps - 1; i++) {
          const lastSlide = sliderList.querySelector<HTMLElement>(":scope > .item:last-child");
          const lastThumb = thumbnail.querySelector<HTMLElement>(":scope > .item:last-child");
          if (lastSlide) {
            sliderList.prepend(lastSlide);
          }
          if (lastThumb) {
            thumbnail.prepend(lastThumb);
          }
        }
        moveSlider("prev");
      }
    }

    startAutoplay();
  }

  // Vertical dot buttons navigation
  const onDotClick = (e: MouseEvent) => {
    e.preventDefault();
    const btn = (e.currentTarget as HTMLElement).closest<HTMLButtonElement>(".hero-dot-btn");
    if (!btn || isAnimating) return;
    const targetIndexStr = btn.dataset["index"];
    if (targetIndexStr !== undefined) {
      const idx = Number(targetIndexStr);
      goToSlide(idx);
    }
  };

  for (const dot of dotButtons) {
    dot.addEventListener("click", onDotClick);
  }

  // Thumbnail direct click & multi-slide navigation
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

    const idx = Number(targetIndexStr);
    goToSlide(idx);
  };

  thumbnail.addEventListener("click", onThumbnailClick);

  // Keyboard navigation
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

  // Touch swipe support
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

  // Autoplay pause on hover / focus
  slider.addEventListener("mouseenter", stopAutoplay);
  slider.addEventListener("mouseleave", startAutoplay);
  slider.addEventListener("focusin", stopAutoplay);
  slider.addEventListener("focusout", startAutoplay);

  startAutoplay();

  // Clean up on Astro page transition
  const cleanup = () => {
    delete slider.dataset["sliderInitialized"];
    stopAutoplay();
    nextBtn?.removeEventListener("click", onNextClick);
    prevBtn?.removeEventListener("click", onPrevClick);
    for (const dot of dotButtons) {
      dot.removeEventListener("click", onDotClick);
    }
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

// Support initial load and Astro client-side navigation
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSlider);
} else {
  initSlider();
}

document.addEventListener("astro:page-load", initSlider);

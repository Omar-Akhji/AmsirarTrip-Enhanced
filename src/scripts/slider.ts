/**
 * Interactive Slider Controller Inspired by Lun Dev Magic 3D Carousel Slider Implements fluid
 * thumbnail expansion, bidirectional animation, touch gestures, keyboard controls, and accessible
 * lifecycle management with GSAP BlurText word animation.
 */
import gsap from "gsap";

function animateBlurText(slideItem: HTMLElement | null): void {
  if (!slideItem) return;
  const blurContainers = slideItem.querySelectorAll<HTMLElement>("[data-blur-text]");
  if (blurContainers.length === 0) return;

  if (globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const allTokens = slideItem.querySelectorAll<HTMLElement>(".blur-token");
    gsap.set(allTokens, { opacity: 1, y: 0, filter: "none" });
    return;
  }

  for (const container of blurContainers) {
    const tokens = container.querySelectorAll<HTMLElement>(".blur-token");
    if (tokens.length === 0) continue;

    const direction = container.dataset["direction"] ?? "bottom";
    const delay = Number(container.dataset["delay"] ?? 200) / 1000;
    const duration = Number(container.dataset["stepDuration"] ?? 0.65);
    const blur = Number(container.dataset["blur"] ?? 4);
    const distance = Number(container.dataset["distance"] ?? 20);
    const stagger = Number(container.dataset["stagger"] ?? 0.02);

    const initialY = direction === "top" ? -distance : distance;

    gsap.killTweensOf(tokens);
    gsap.set(tokens, {
      opacity: 0,
      y: initialY,
      filter: `blur(${blur}px)`,
      willChange: "transform, filter, opacity",
    });

    gsap.to(tokens, {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration,
      stagger: { each: stagger, from: "start" },
      ease: "power3.out",
      delay,
      clearProps: "willChange,filter",
    });
  }
}

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
  const totalSlides = sliderList.querySelectorAll<HTMLElement>(":scope > .item").length || 3;

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
  animateBlurText(sliderList.querySelector<HTMLElement>(":scope > .item:first-child"));

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

    if (direction === "next") {
      const activeSlide = currentSliderItems[0];
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
      animateBlurText(incomingSlide);

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
      };

      setTimeout(finalizeNext, 760);
    } else {
      const activeSlide = currentSliderItems[0];
      const lastSlide = currentSliderItems[currentSliderItems.length - 1];
      const lastThumb = currentThumbnailItems[currentThumbnailItems.length - 1];

      if (!activeSlide || !lastSlide || !lastThumb) {
        isAnimating = false;
        return;
      }

      sliderList.prepend(lastSlide);
      thumbnail.prepend(lastThumb);

      activeSlide.classList.add("is-outgoing");
      lastSlide.classList.add("is-incoming");
      slider.classList.add("is-prev");

      const prevIndex = Number(lastSlide.dataset["index"] ?? 0);
      updatePagination(prevIndex);
      animateBlurText(lastSlide);

      let cleanedUp = false;
      const finalizePrev = () => {
        if (cleanedUp) return;
        cleanedUp = true;

        activeSlide.classList.remove("is-outgoing");
        lastSlide.classList.remove("is-incoming");
        slider.classList.remove("is-prev");

        isAnimating = false;
      };

      setTimeout(finalizePrev, 760);
    }
  }

  function startAutoplay(): void {
    if (globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      moveSlider("next");
    }, 7000);
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

  // Thumbnail direct click & multi-slide navigation
  const onThumbnailClick = (e: MouseEvent) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>(".item");
    if (!target || isAnimating) return;

    const targetIndexStr = target.dataset["index"];
    const activeItem = sliderList.querySelector<HTMLElement>(":scope > .item:first-child");
    const activeIndexStr = activeItem?.dataset["index"];

    if (!targetIndexStr || !activeIndexStr) {
      stopAutoplay();
      moveSlider("next");
      startAutoplay();
      return;
    }

    const targetIndex = Number(targetIndexStr);
    const activeIndex = Number(activeIndexStr);

    if (targetIndex === activeIndex) return;

    stopAutoplay();

    const forwardSteps = (targetIndex - activeIndex + totalSlides) % totalSlides;

    if (forwardSteps === totalSlides - 1) {
      moveSlider("prev");
    } else if (forwardSteps === 1) {
      moveSlider("next");
    } else {
      // Bring target slide right behind the active slide so active slide stays visible while target expands
      for (let i = 0; i < forwardSteps - 1; i++) {
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

    startAutoplay();
  };

  const onThumbnailKeyDown = (e: KeyboardEvent) => {
    if (!(e.key === "Enter" || e.key === " ")) {
      return;
    }

    const target = (e.target as HTMLElement).closest<HTMLElement>(".item");
    if (!target) {
      return;
    }

    e.preventDefault();
    target.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  };

  thumbnail.addEventListener("click", onThumbnailClick);
  thumbnail.addEventListener("keydown", onThumbnailKeyDown);

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
    thumbnail.removeEventListener("click", onThumbnailClick);
    thumbnail.removeEventListener("keydown", onThumbnailKeyDown);
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

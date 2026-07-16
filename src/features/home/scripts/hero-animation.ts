function initHero() {
  const section = document.querySelector<HTMLElement>("#home-hero-section");
  if (!section) return;

  const phrasesAttr = section.dataset["phrases"];
  const phrases: string[] = phrasesAttr ? (JSON.parse(phrasesAttr) as string[]) : [];
  if (phrases.length === 0) return;

  const slides = section.querySelectorAll<HTMLElement>(".hero-slide");
  const srText = section.querySelector<HTMLElement>(".hero-sr-text");
  const mobileText = section.querySelector<HTMLElement>("#hero-mobile-text");
  const desktopPlaceholder = section.querySelector<HTMLElement>("#hero-desktop-placeholder");
  const desktopText = section.querySelector<HTMLElement>("#hero-desktop-text");
  const cursor = section.querySelector<HTMLElement>("#hero-cursor");

  // Carousel State
  let currentSlideIndex = 0;
  const carouselInterval = setInterval(() => {
    if (slides.length === 0) return;
    const currentSlide = slides[currentSlideIndex];
    if (currentSlide) {
      currentSlide.style.opacity = "0";
    }
    currentSlideIndex = (currentSlideIndex + 1) % slides.length;
    const nextSlide = slides[currentSlideIndex];
    if (nextSlide) {
      nextSlide.style.opacity = "1";
    }
  }, 5000);

  // Reduced motion preference
  const prefersReducedMotion = globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Let's check window size dynamically using media query matching
  const mediaQuery = globalThis.matchMedia("(max-width: 1023px)");
  let isMobile = mediaQuery.matches;

  // Track animation frames and intervals
  let mobileInterval: ReturnType<typeof setInterval> | undefined;
  let mobileTimeout: ReturnType<typeof setTimeout> | undefined;
  let animationFrameId: number | undefined;
  let isDesktopAnimating = false;

  function handleResize() {
    const newIsMobile = mediaQuery.matches;
    if (newIsMobile !== isMobile) {
      isMobile = newIsMobile;
      restartAnimation();
    }
  }

  mediaQuery.addEventListener("change", handleResize);

  function stopAllAnimations() {
    if (mobileInterval) clearInterval(mobileInterval);
    if (mobileTimeout) clearTimeout(mobileTimeout);
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    isDesktopAnimating = false;
  }

  let currentPhraseIndex = 0;

  function startMobileAnimation() {
    if (prefersReducedMotion) {
      if (mobileText) mobileText.textContent = phrases[0] ?? "";
      if (srText) srText.textContent = phrases[0] ?? "";
      return;
    }
    mobileInterval = setInterval(() => {
      if (!mobileText) {
        return;
      }

      mobileText.style.opacity = "0";
      mobileTimeout = setTimeout(() => {
        currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
        mobileText.textContent = phrases[currentPhraseIndex] ?? "";
        if (srText) srText.textContent = phrases[currentPhraseIndex] ?? "";
        mobileText.style.opacity = "1";
      }, 500);
    }, 4000);
  }

  function startDesktopAnimation() {
    if (prefersReducedMotion) {
      if (desktopText) desktopText.textContent = phrases[0] ?? "";
      if (srText) srText.textContent = phrases[0] ?? "";
      if (cursor) cursor.style.display = "none";
      return;
    }

    if (isDesktopAnimating) return;
    isDesktopAnimating = true;

    let isDeleting = false;
    let textIndex = 0;
    let lastTime = performance.now();
    let pauseTimer = 0;

    function tick(timestamp: number) {
      if (!isDesktopAnimating) return;

      let delta = timestamp - lastTime;
      if (delta > 100) delta = 0; // Handle tab backgrounding
      lastTime = timestamp;

      if (pauseTimer > 0) {
        pauseTimer -= delta;
        animationFrameId = requestAnimationFrame(tick);
        return;
      }

      const fullText = phrases[currentPhraseIndex] || "";
      let text = "";

      if (isDeleting) {
        // Deleting phase
        const speed = 0.022;
        textIndex -= delta * speed;

        if (textIndex <= 0) {
          textIndex = 0;
          isDeleting = false;
          currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
          pauseTimer = 1000; // Pause for 1.0s when erased
        }
        text = fullText.slice(0, Math.ceil(textIndex));
      } else {
        // Typing phase
        const speed = 0.01;
        textIndex += delta * speed;

        if (textIndex >= fullText.length) {
          textIndex = fullText.length;
          isDeleting = true;
          pauseTimer = 2500; // Pause for 2.5s when fully typed
        }
        text = fullText.slice(0, Math.floor(textIndex));
      }

      if (desktopText) desktopText.textContent = text;
      if (desktopPlaceholder) desktopPlaceholder.textContent = fullText;
      if (srText) srText.textContent = text;

      animationFrameId = requestAnimationFrame(tick);
    }

    animationFrameId = requestAnimationFrame(tick);
  }

  function restartAnimation() {
    stopAllAnimations();
    if (isMobile) {
      startMobileAnimation();
    } else {
      startDesktopAnimation();
    }
  }

  // Initial animation start
  restartAnimation();

  // Cleanup handler for View Transitions
  function cleanup() {
    clearInterval(carouselInterval);
    stopAllAnimations();
    mediaQuery.removeEventListener("change", handleResize);
    document.removeEventListener("astro:before-swap", cleanup);
  }
  document.addEventListener("astro:before-swap", cleanup, { once: true });
}

document.addEventListener("astro:page-load", initHero);

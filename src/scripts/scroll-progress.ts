let ticking = false;

function updateProgress(): void {
  const bar = document.querySelector<HTMLElement>("#scrollProgressBar");
  if (!bar) return;

  const doc = document.documentElement;
  const totalHeight = doc.scrollHeight - window.innerHeight;

  if (totalHeight <= 0) {
    bar.style.height = "0%";
    bar.style.opacity = "0";
    ticking = false;
    return;
  }

  const scrollY = window.scrollY || doc.scrollTop || 0;
  const progress = Math.min(Math.max(scrollY / totalHeight, 0), 1);
  const percent = progress * 100;

  bar.style.height = `${percent}%`;
  bar.style.opacity = percent > 0.5 ? "1" : "0";
  ticking = false;
}

function onScroll(): void {
  if (ticking) {
    return;
  }

  globalThis.requestAnimationFrame(updateProgress);
  ticking = true;
}

function setupScrollProgress(): void {
  updateProgress();

  window.removeEventListener("scroll", onScroll);
  window.addEventListener("scroll", onScroll, { passive: true });

  window.removeEventListener("resize", onScroll);
  window.addEventListener("resize", onScroll, { passive: true });

  const container = document.querySelector<HTMLElement>("#scrollProgressBarContainer");
  if (container && !container.dataset["bound"]) {
    container.dataset["bound"] = "true";
    container.addEventListener("click", (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const ratio = Math.min(Math.max(clickY / rect.height, 0), 1);
      const doc = document.documentElement;
      const targetScroll = ratio * (doc.scrollHeight - window.innerHeight);

      if (globalThis.__lenis) {
        globalThis.__lenis.scrollTo(targetScroll);
      } else {
        window.scrollTo({ top: targetScroll, behavior: "smooth" });
      }
    });
  }

  if (globalThis.__lenis) {
    globalThis.__lenis.on("scroll", onScroll);
  }
}

// Astro View Transitions lifecycle hooks
document.addEventListener("astro:page-load", setupScrollProgress);
setupScrollProgress();

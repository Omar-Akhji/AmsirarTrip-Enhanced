const SUPPORTS_SCROLL_TIMELINE =
  typeof CSS !== "undefined" && CSS.supports("animation-timeline", "scroll()");

let ticking = false;

function updateProgress(): void {
  const bar = document.querySelector<HTMLElement>("#scrollProgressBar");
  if (!bar) return;

  const doc = document.documentElement;
  const totalHeight = doc.scrollHeight - window.innerHeight;

  if (totalHeight <= 0) {
    bar.style.transformOrigin = "top center";
    bar.style.transform = "scaleY(0)";
    bar.style.opacity = "0";
    ticking = false;
    return;
  }

  const scrollY = window.scrollY || doc.scrollTop || 0;
  const progress = Math.min(Math.max(scrollY / totalHeight, 0), 1);

  bar.style.transformOrigin = "top center";
  bar.style.transform = `scaleY(${progress})`;
  bar.style.opacity = progress > 0.005 ? "1" : "0";
  ticking = false;
}

function onScroll(): void {
  if (ticking) return;
  globalThis.requestAnimationFrame(updateProgress);
  ticking = true;
}

function setupScrollProgress(): void {
  const container = document.querySelector<HTMLElement>("#scrollProgressBarContainer");
  if (container && !container.dataset["bound"]) {
    container.dataset["bound"] = "true";
    container.addEventListener("click", (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const ratio = Math.min(Math.max(clickY / Math.max(1, rect.height), 0), 1);
      const doc = document.documentElement;
      const targetScroll = ratio * (doc.scrollHeight - window.innerHeight);
      const prefersReduced = globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (globalThis.__lenis) {
        globalThis.__lenis.scrollTo(targetScroll);
      } else {
        window.scrollTo({ top: targetScroll, behavior: prefersReduced ? "auto" : "smooth" });
      }
    });
  }

  if (SUPPORTS_SCROLL_TIMELINE) return;

  updateProgress();

  window.removeEventListener("scroll", onScroll);
  window.addEventListener("scroll", onScroll, { passive: true });

  window.removeEventListener("resize", onScroll);
  window.addEventListener("resize", onScroll, { passive: true });

  globalThis.__lenis?.off("scroll", onScroll);
  globalThis.__lenis?.on("scroll", onScroll);
}

document.addEventListener("astro:page-load", setupScrollProgress);
setupScrollProgress();

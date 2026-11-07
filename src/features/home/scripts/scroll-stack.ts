import type Lenis from "lenis";

function toLength(value: string | number): string {
  return typeof value === "number" ? `${value}px` : value;
}

function resolveOffset(value: string | number, size: number): number {
  if (typeof value === "number") return value;
  const text = value.trim();
  if (text.endsWith("%")) {
    return (Number(text.slice(0, -1)) / 100) * size;
  }
  const parsed = Number(text);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function setupScrollStack(element: HTMLElement): (() => void) | null {
  const inner = element.querySelector<HTMLElement>(".scroll-stack-inner");
  if (!inner) return null;

  const end = element.querySelector<HTMLElement>(".scroll-stack-end");
  const slots = [...inner.querySelectorAll<HTMLElement>(":scope > [data-stack-slot]")];
  if (slots.length === 0) return null;

  const windowed = element.dataset["windowScroll"] !== "false";
  const target: EventTarget = windowed ? globalThis : element;

  const itemDistance = Number(element.dataset["itemDistance"] ?? "100");
  const itemStackDistance = Number(element.dataset["itemStackDistance"] ?? "24");
  const stackPosition = element.dataset["stackPosition"] ?? "84px";
  const itemScale = Number(element.dataset["itemScale"] ?? "0.045");
  const baseScale = Number(element.dataset["baseScale"] ?? "0.80");
  const dimAmount = Number(element.dataset["dimAmount"] ?? "0.20");
  const blurAmount = Number(element.dataset["blurAmount"] ?? "0.8");
  const tiltAmount = Number(element.dataset["tiltAmount"] ?? "2");
  const rotationAmount = Number(element.dataset["rotationAmount"] ?? "1.5");
  const holdDistance = Number(element.dataset["holdDistance"] ?? "200");

  const prefersReduced =
    typeof window !== "undefined"
    && globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const total = slots.length;
  for (const [index, slot] of slots.entries()) {
    slot.style.position = "sticky";
    slot.style.top = `calc(${toLength(stackPosition)} + ${index * itemStackDistance}px)`;
    slot.style.marginBottom = `${(total - 1 - index) * itemStackDistance}px`;
    slot.style.zIndex = String(index + 1);
    if (index === 0) continue;

    const gap = itemDistance - (total - index) * itemStackDistance;
    slot.style.marginTop = `${Math.max(16, gap)}px`;
  }

  if (end) {
    end.style.height = `${holdDistance}px`;
  }

  const cache = new Map<string, string | number>();
  let rafId: number | null = null;

  const updateCardTransforms = () => {
    rafId = null;
    const viewHeight = windowed ? globalThis.innerHeight : element.clientHeight;
    const viewTop = windowed ? 0 : element.getBoundingClientRect().top + element.clientTop;
    const stackTopPx = resolveOffset(stackPosition, viewHeight);
    const heights = slots.map((s) => s.offsetHeight);
    const tops = slots.map((s) => s.getBoundingClientRect().top);

    const depths = slots.map(() => 0);
    for (let j = 1; j < slots.length; j++) {
      const pinBefore = viewTop + stackTopPx + (j - 1) * itemStackDistance;
      const start = pinBefore + (heights[j - 1] ?? 0);
      const span = Math.max(1, start - pinBefore - itemStackDistance);
      const topJ = tops[j] ?? 0;
      const cover = Math.min(1, Math.max(0, (start - topJ) / span));
      for (let i = 0; i < j; i++) {
        depths[i] = (depths[i] ?? 0) + cover;
      }
    }

    const dimStep = Math.min(Math.max(dimAmount, 0), 1);
    for (const [i, slot] of slots.entries()) {
      const card =
        slot.querySelector<HTMLElement>(".scroll-stack-card")
        ?? (slot.firstElementChild as HTMLElement | null);
      if (!card) continue;

      if (prefersReduced) {
        card.style.transform = "";
        card.style.filter = "";
        card.style.removeProperty("--scroll-stack-dim");
        continue;
      }

      const depth = depths[i] ?? 0;
      const lean = Math.min(depth, 1);
      const scale = Math.max(Math.min(baseScale, 1), 1 - depth * itemScale);
      const tilt = -lean * tiltAmount;
      const turn = lean * rotationAmount * (i % 2 === 0 ? 1 : -1);
      const blur = depth * blurAmount;
      const dim = 1 - Math.pow(1 - dimStep, depth);

      const transform =
        depth < 0.0005 ? "" : (
          `perspective(1200px) rotateX(${tilt.toFixed(2)}deg) rotate(${turn.toFixed(2)}deg) scale(${scale.toFixed(4)})`
        );

      if (cache.get(`transform${i}`) !== transform) {
        cache.set(`transform${i}`, transform);
        card.style.transformOrigin = "top center";
        card.style.transform = transform;
      }

      const filterVal = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "";
      if (cache.get(`filter${i}`) !== filterVal) {
        cache.set(`filter${i}`, filterVal);
        card.style.filter = filterVal;
      }

      const dimVal = dim.toFixed(3);
      if (cache.get(`dim${i}`) === dimVal) continue;

      cache.set(`dim${i}`, dimVal);
      card.style.setProperty("--scroll-stack-dim", dimVal);
    }
  };

  const schedule = () => {
    rafId ??= globalThis.requestAnimationFrame(updateCardTransforms);
  };

  const lenis = (globalThis as unknown as { __lenis?: Lenis }).__lenis;
  if (lenis) {
    lenis.on("scroll", schedule);
  }
  target.addEventListener("scroll", schedule, { passive: true });
  globalThis.addEventListener("resize", schedule, { passive: true });

  const resizeObserver = new ResizeObserver(schedule);
  resizeObserver.observe(element);
  resizeObserver.observe(inner);

  updateCardTransforms();

  return () => {
    if (rafId !== null) {
      globalThis.cancelAnimationFrame(rafId);
    }
    resizeObserver.disconnect();
    target.removeEventListener("scroll", schedule);
    globalThis.removeEventListener("resize", schedule);
    if (lenis) {
      lenis.off("scroll", schedule);
    }
  };
}

class ScrollStackElement extends HTMLElement {
  private cleanupFn: (() => void) | null = null;

  connectedCallback() {
    this.cleanupFn?.();
    this.cleanupFn = setupScrollStack(this);
  }

  disconnectedCallback() {
    this.cleanupFn?.();
    this.cleanupFn = null;
  }
}

if (!customElements.get("scroll-stack")) {
  customElements.define("scroll-stack", ScrollStackElement);
}

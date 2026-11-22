interface ScrollStackConfig {
  readonly baseScale: number;
  readonly blurAmount: number;
  readonly dimAmount: number;
  readonly itemScale: number;
  readonly itemStackDistance: number;
  readonly rotationAmount: number;
  readonly stackPosition: string;
  readonly tiltAmount: number;
  readonly windowed: boolean;
}

function resolveOffset(value: string | number, size: number): number {
  if (typeof value === "number") return value;
  const text = value.trim();
  if (text.endsWith("%")) {
    return (Number(text.slice(0, -1)) / 100) * size;
  }
  const normalized = text.endsWith("px") ? text.slice(0, -2) : text;
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function readScrollStackConfig(element: HTMLElement): ScrollStackConfig {
  return {
    windowed: element.dataset["windowScroll"] !== "false",
    itemStackDistance: Number(element.dataset["itemStackDistance"] ?? "24"),
    stackPosition: element.dataset["stackPosition"] ?? "84px",
    itemScale: Number(element.dataset["itemScale"] ?? "0.045"),
    baseScale: Number(element.dataset["baseScale"] ?? "0.80"),
    dimAmount: Number(element.dataset["dimAmount"] ?? "0.20"),
    blurAmount: Number(element.dataset["blurAmount"] ?? "0.8"),
    tiltAmount: Number(element.dataset["tiltAmount"] ?? "2"),
    rotationAmount: Number(element.dataset["rotationAmount"] ?? "1.5"),
  };
}

function computeStackDepths(
  slots: readonly HTMLElement[],
  viewTop: number,
  stackTopPx: number,
  itemStackDistance: number,
): number[] {
  const heights = slots.map((s) => s.offsetHeight);
  const tops = slots.map((s) => s.getBoundingClientRect().top);
  const depths = slots.map(() => 0);

  for (let j = 1; j < slots.length; j++) {
    const pinBefore = viewTop + stackTopPx + (j - 1) * itemStackDistance;
    const start = pinBefore + (heights[j - 1] ?? 0);
    const span = Math.max(1, start - pinBefore - itemStackDistance);
    const cover = Math.min(1, Math.max(0, (start - (tops[j] ?? 0)) / span));
    for (let i = 0; i < j; i++) {
      depths[i] = (depths[i] ?? 0) + cover;
    }
  }
  return depths;
}

interface CardStyleOptions {
  readonly cache: Map<string, string | number>;
  readonly card: HTMLElement;
  readonly config: ScrollStackConfig;
  readonly depth: number;
  readonly index: number;
  readonly prefersReduced: boolean;
}

function applyScrollStackCardStyles({
  cache,
  card,
  config,
  depth,
  index,
  prefersReduced,
}: CardStyleOptions): void {
  if (prefersReduced) {
    card.style.transform = "";
    card.style.filter = "";
    card.style.removeProperty("--scroll-stack-dim");
    return;
  }

  const dimStep = Math.min(Math.max(config.dimAmount, 0), 1);
  const lean = Math.min(depth, 1);
  const scale = Math.max(Math.min(config.baseScale, 1), 1 - depth * config.itemScale);
  const tilt = -lean * config.tiltAmount;
  const turn = lean * config.rotationAmount * (index % 2 === 0 ? 1 : -1);
  const blur = depth * config.blurAmount;
  const dim = 1 - Math.pow(1 - dimStep, depth);

  const transform =
    depth < 0.0005 ? "" : (
      `perspective(1200px) rotateX(${tilt.toFixed(2)}deg) rotate(${turn.toFixed(2)}deg) scale(${scale.toFixed(4)})`
    );

  if (cache.get(`transform${index}`) !== transform) {
    cache.set(`transform${index}`, transform);
    card.style.transformOrigin = "top center";
    card.style.transform = transform;
  }

  const filterVal = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "";
  if (cache.get(`filter${index}`) !== filterVal) {
    cache.set(`filter${index}`, filterVal);
    card.style.filter = filterVal;
  }

  const dimVal = dim.toFixed(3);
  if (cache.get(`dim${index}`) !== dimVal) {
    cache.set(`dim${index}`, dimVal);
    card.style.setProperty("--scroll-stack-dim", dimVal);
  }
}

function setupScrollStack(element: HTMLElement): (() => void) | null {
  const inner = element.querySelector<HTMLElement>(".scroll-stack-inner");
  if (!inner) return null;

  const slots = [...inner.querySelectorAll<HTMLElement>(":scope > [data-stack-slot]")];
  if (slots.length === 0) return null;

  const config = readScrollStackConfig(element);
  const target: EventTarget = config.windowed ? globalThis : element;
  const prefersReduced =
    typeof window !== "undefined"
    && globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const cards = slots.map(
    (slot) =>
      slot.querySelector<HTMLElement>(".scroll-stack-card")
      ?? (slot.firstElementChild as HTMLElement | null),
  );
  const cache = new Map<string, string | number>();
  let rafId: number | null = null;

  const updateCardTransforms = () => {
    rafId = null;
    const viewHeight = config.windowed ? globalThis.innerHeight : element.clientHeight;
    const viewTop = config.windowed ? 0 : element.getBoundingClientRect().top + element.clientTop;
    const stackTopPx = resolveOffset(config.stackPosition, viewHeight);
    const depths = computeStackDepths(slots, viewTop, stackTopPx, config.itemStackDistance);

    for (const [index, card] of cards.entries()) {
      if (!card) continue;
      applyScrollStackCardStyles({
        cache,
        card,
        config,
        depth: depths[index] ?? 0,
        index,
        prefersReduced,
      });
    }
  };

  const schedule = () => {
    rafId ??= globalThis.requestAnimationFrame(updateCardTransforms);
  };

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

if (typeof customElements !== "undefined" && !customElements.get("scroll-stack")) {
  customElements.define("scroll-stack", ScrollStackElement);
}

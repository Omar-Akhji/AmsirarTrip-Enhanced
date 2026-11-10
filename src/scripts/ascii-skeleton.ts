import {
  createAsciiReveal,
  type AsciiRevealController,
  type AsciiRevealOptions,
  type Duration,
  type Origin,
  type Preset,
  type PresetName,
} from "ascii-reveal/core";

/**
 * Finely calibrated ASCII dither preset with a high refresh rate tick (48ms / ~21fps) and 5
 * progressive cell sizes for realistic, silky-smooth character & image decodes.
 */
export const SMOOTH_DITHER_PRESET: Preset = {
  ramp: "░▒▓█",
  scramble: "░▒▓█",
  mode: "ramp",
  color: "source",
  cells: [18, 13, 9, 6, 4],
  tick: 48,
};

let stopGlobalShimmer: (() => void) | null = null;
let activePageReveal: AsciiRevealController | null = null;

const noop = (): void => {
  // Safe no-op for SSR or reduced-motion environments
};

interface SkeletonRow {
  i: number;
  x: number;
  y: number;
  w: number;
  h: number;
  radius: number;
  img: HTMLCanvasElement;
  fh: number;
}

interface SkeletonInstance {
  root: HTMLElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  rows: SkeletonRow[];
  dirty: boolean;
  band: number;
  opacity: number;
  speed: number;
  ro: ResizeObserver | null;
  mw: number;
  mh: number;
}

const activeSkeletons = new Set<SkeletonInstance>();
const skeletonInstanceMap = new WeakMap<HTMLElement, SkeletonInstance>();
let skeletonAnimFrame = 0;
let skeletonLastTick = 0;
let skeletonStartTime = 0;

const VARIANTS: Record<string, { ramp: string; wave: string }> = {
  dither: { ramp: " ░▒▓█", wave: "░▒▓█" },
  braille: { ramp: " ⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏", wave: "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏" },
  scan: { ramp: " ─═━", wave: "─═━" },
  terminal: { ramp: " .:-=+*#", wave: "01<>/\\{}[]" },
};

function pseudoRandom(seed: number): number {
  let n = Math.imul(seed | 0, 668265261) ^ Math.imul(((seed | 0) + 2654435769) | 0, 2246822507);
  n ^= n >>> 15;
  n = Math.imul(n, 739982445);
  n ^= n >>> 12;
  n = Math.imul(n, 695872825);
  n ^= n >>> 15;
  return (n >>> 0) / 4294967296;
}

function measureAndBuildRows(inst: SkeletonInstance): void {
  const rootRect = inst.root.getBoundingClientRect();
  inst.mw = rootRect.width;
  inst.mh = rootRect.height;
  inst.dirty = false;

  if (rootRect.width <= 0 || rootRect.height <= 0) {
    return;
  }

  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const computed = getComputedStyle(inst.root);
  inst.band = (parseFloat(computed.getPropertyValue("--ars-band")) || 55) / 100;
  inst.opacity = parseFloat(computed.getPropertyValue("--ars-wave")) || 0.85;
  inst.speed = (parseFloat(computed.getPropertyValue("--ars-speed")) || 1.8) * 1000;

  const variantName =
    Object.keys(VARIANTS).find((k) => inst.root.classList.contains(`ars-${k}`)) ?? "dither";
  const variant = VARIANTS[variantName] ?? VARIANTS["dither"]!;
  const waveColor = computed.getPropertyValue("--ars-wave-color").trim();
  const seedAttr = Number(inst.root.getAttribute("data-ars-animate")) || 1;

  for (const row of inst.rows) {
    row.img.width = 0;
    row.img.height = 0;
  }

  const candidateRows = Array.from(
    inst.root.querySelectorAll<HTMLElement>(".ars-line, .ars-block"),
  );

  inst.rows = candidateRows.map((rowEl, rowIdx) => {
    const rowRect = rowEl.getBoundingClientRect();
    const baseEl = rowEl.querySelector<HTMLElement>(".ars-base") || rowEl;
    const baseStyle = getComputedStyle(baseEl);
    const rowStyle = getComputedStyle(rowEl);

    const textLines = (baseEl.textContent || "").split("\n").length || 1;
    const lineH = parseFloat(rowStyle.lineHeight) || rowRect.height / textLines;
    const textColor = !waveColor || /currentcolor/i.test(waveColor) ? baseStyle.color : waveColor;

    const C = Math.max(1, Math.ceil((rowRect.width + 160) * dpr));
    const T = Math.max(1, Math.ceil(rowRect.height * dpr));

    const offscreen = document.createElement("canvas");
    offscreen.width = C;
    offscreen.height = T * 2;
    const octx = offscreen.getContext("2d");

    if (octx) {
      octx.font = `${baseStyle.fontStyle} ${baseStyle.fontWeight} ${baseStyle.fontSize} ${baseStyle.fontFamily}`;
      octx.fillStyle = textColor;
      octx.textBaseline = "middle";

      const letterSpacing = parseFloat(baseStyle.letterSpacing) || 0;
      if (letterSpacing && "letterSpacing" in octx) {
        octx.letterSpacing = `${letterSpacing}px`;
      }

      // Measure actual glyph width instead of 'M' to guarantee 100% full edge coverage
      const charW =
        Math.max(1, octx.measureText("█").width || octx.measureText("░").width || 8)
        + letterSpacing;

      // Generous character count ensuring glyphs reach beyond the right edge by at least 16 chars
      const charsNeeded = Math.ceil(rowRect.width / charW) + 20;
      const seed = seedAttr * 97 + rowIdx * 13;

      for (let frame = 0; frame < 2; frame++) {
        octx.setTransform(dpr, 0, 0, dpr, 0, frame * T);
        for (let line = 0; line < textLines; line++) {
          let lineGlyphs = "";
          for (let col = 0; col < charsNeeded; col++) {
            const rnd = pseudoRandom(seed + line * 43 + col * 17 + frame * 300);
            lineGlyphs += variant.wave[Math.floor(rnd * variant.wave.length)];
          }
          const yPos = line * lineH + lineH / 2;
          octx.fillText(lineGlyphs, 0, yPos);
        }
      }
    }

    const radiusRaw = rowStyle.borderTopLeftRadius;
    const radius =
      radiusRaw.endsWith("%") ?
        (parseFloat(radiusRaw) / 100) * Math.min(rowRect.width, rowRect.height)
      : parseFloat(radiusRaw) || 0;

    return {
      i: rowIdx,
      x: rowRect.left - rootRect.left,
      y: rowRect.top - rootRect.top,
      w: rowRect.width,
      h: rowRect.height,
      radius: Math.min(radius, Math.min(rowRect.width, rowRect.height) / 2),
      img: offscreen,
      fh: T,
    };
  });

  inst.canvas.width = Math.max(1, Math.ceil(rootRect.width * dpr));
  inst.canvas.height = Math.max(1, Math.ceil(rootRect.height * dpr));
  inst.canvas.style.width = `${rootRect.width}px`;
  inst.canvas.style.height = `${rootRect.height}px`;
}

function drawSkeletonInstance(inst: SkeletonInstance, timestamp: number): void {
  if (inst.dirty) {
    measureAndBuildRows(inst);
  }

  const { ctx, canvas } = inst;
  if (canvas.width <= 1 || canvas.height <= 1) return;

  const scale = canvas.width / Math.max(1, parseFloat(canvas.style.width) || 1);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);

  const altFrame = Math.floor(timestamp / 120) % 2;

  for (const row of inst.rows) {
    if (row.w <= 0 || row.h <= 0) continue;

    const s = ((((timestamp - row.i * 90) % inst.speed) + inst.speed) % inst.speed) / inst.speed;
    const eased = s < 0.5 ? 4 * s * s * s : 1 - Math.pow(-2 * s + 2, 3) / 2;

    const l = row.w * inst.band;
    // Sweep smoothly from completely before left edge (-l) to completely beyond right edge (row.w + l * 0.5)
    const h = -l + (row.w + l * 1.5) * eased;
    const u = Math.max(0, h);
    const y = Math.min(row.w, h + l);

    if (y <= u) continue;

    ctx.save();
    ctx.beginPath();
    if (row.radius > 0 && typeof ctx.roundRect === "function") {
      ctx.roundRect(row.x, row.y, row.w, row.h, row.radius);
    } else {
      ctx.rect(row.x, row.y, row.w, row.h);
    }
    ctx.clip();

    const SLICES = 16;
    for (let p = 0; p < SLICES; p++) {
      const c = h + (l * p) / SLICES;
      const m = h + (l * (p + 1)) / SLICES;
      const f = Math.max(u, c);
      const b = Math.min(y, m);
      if (b <= f) continue;

      const x = (p + 0.5) / SLICES;
      const alpha =
        (x < 0.45 ? x / 0.45
        : x > 0.55 ? (1 - x) / 0.45
        : 1) * inst.opacity;
      ctx.globalAlpha = alpha;

      ctx.drawImage(
        row.img,
        f * scale,
        altFrame * row.fh,
        (b - f) * scale,
        row.h * scale,
        row.x + f,
        row.y,
        b - f,
        row.h,
      );
    }

    ctx.restore();
  }
}

function skeletonLoop(timestamp: number): void {
  if (activeSkeletons.size === 0) {
    skeletonAnimFrame = 0;
    return;
  }

  skeletonAnimFrame = requestAnimationFrame(skeletonLoop);

  if (document.hidden || timestamp - skeletonLastTick < 33) {
    return;
  }
  skeletonLastTick = timestamp;

  const t = timestamp - skeletonStartTime;

  for (const inst of activeSkeletons) {
    if (!inst.root.isConnected) {
      continue;
    }
    drawSkeletonInstance(inst, t);
  }
}

function destroySkeletonInstance(inst: SkeletonInstance): void {
  if (activeSkeletons.has(inst)) {
    activeSkeletons.delete(inst);
    skeletonInstanceMap.delete(inst.root);
    inst.ro?.disconnect();
    inst.canvas.remove();
    for (const row of inst.rows) {
      row.img.width = 0;
      row.img.height = 0;
    }
    inst.rows = [];
  }
}

function animateSkeletonCustom(el: HTMLElement): () => void {
  const existing = skeletonInstanceMap.get(el);
  if (existing) {
    return () => destroySkeletonInstance(existing);
  }

  // Remove any stale canvas if present
  el.querySelector("canvas")?.remove();

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.position = "absolute";
  canvas.style.inset = "0";
  canvas.style.pointerEvents = "none";
  canvas.style.borderRadius = "inherit";
  el.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return () => {};
  }

  const inst: SkeletonInstance = {
    root: el,
    canvas,
    ctx,
    rows: [],
    dirty: true,
    band: 0.55,
    opacity: 0.85,
    speed: 1800,
    ro: null,
    mw: -1,
    mh: -1,
  };

  if (typeof ResizeObserver !== "undefined") {
    inst.ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      if (rect.width !== inst.mw || rect.height !== inst.mh) {
        inst.dirty = true;
      }
    });
    inst.ro.observe(el);
  }

  measureAndBuildRows(inst);

  activeSkeletons.add(inst);
  skeletonInstanceMap.set(el, inst);

  if (!skeletonStartTime) {
    skeletonStartTime = performance.now();
  }
  if (!skeletonAnimFrame) {
    skeletonAnimFrame = requestAnimationFrame(skeletonLoop);
  }

  return () => destroySkeletonInstance(inst);
}

/**
 * Initializes ASCII skeleton shimmer animations within a given scope. Safe for SSR and respects
 * prefers-reduced-motion.
 *
 * Skeletons inside hidden containers (such as `#skeleton-container` before it's displayed) are
 * skipped during document load so they never get registered with 0x0 canvas bounds.
 *
 * Pass `{ force: true }` when an active skeleton is unhidden to immediately measure and run its
 * ~30fps glyph shimmer canvas.
 */
export function initAsciiSkeletons(
  scope: ParentNode = document,
  options?: { force?: boolean },
): () => void {
  if (
    typeof window === "undefined"
    || typeof document === "undefined"
    || globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return noop;
  }

  // If re-initializing the entire document, clean up previous frame loops
  if (scope === document && stopGlobalShimmer) {
    stopGlobalShimmer();
    stopGlobalShimmer = null;
  }

  // Find candidate skeleton elements: include scope itself if it matches, plus descendants
  const elements: HTMLElement[] = [];
  if (scope instanceof HTMLElement && scope.matches("[data-ars-animate]")) {
    elements.push(scope);
  }
  elements.push(...scope.querySelectorAll<HTMLElement>("[data-ars-animate]"));

  // Filter: Unless forced, skip elements that are inside hidden containers
  const visibleElements =
    options?.force ? elements : (
      elements.filter((el) => {
        return !el.parentElement?.closest(".hidden, [aria-hidden='true']");
      })
    );

  const cleanups: (() => void)[] = [];

  for (const el of visibleElements) {
    const stop = animateSkeletonCustom(el);
    cleanups.push(stop);
  }

  const stopAll = (): void => {
    for (const cleanup of cleanups) {
      cleanup();
    }
  };

  if (scope === document) {
    stopGlobalShimmer = stopAll;
  }

  return stopAll;
}

/** Attaches a dynamic ASCII reveal effect to an element (defaults to "dither" preset). */
export function revealWithAscii(
  element: HTMLElement,
  options?: AsciiRevealOptions,
): AsciiRevealController | undefined {
  if (typeof window === "undefined") return undefined;

  const controller = createAsciiReveal(element, {
    preset: "dither",
    duration: "fast",
    speed: 2,
    origin: "center",
    ...options,
  });

  return controller;
}

/** Cancels and disposes any running ASCII reveal controllers to prevent memory or canvas leaks */
export function cleanupAsciiReveals(): void {
  if (activePageReveal) {
    try {
      activePageReveal.destroy();
    } catch {
      // safe cleanup
    }
    activePageReveal = null;
  }

  if (typeof document !== "undefined") {
    document.querySelectorAll<HTMLElement>(".ar-overlay").forEach((el) => {
      el.remove();
    });
  }
}

/**
 * Triggers full-page or section ASCII reveal using the "dither" preset. Decodes text and images
 * seamlessly through the character grid after skeleton ends.
 */
export function triggerPageReveal(
  scope?: HTMLElement | null,
  options?: Partial<AsciiRevealOptions>,
): AsciiRevealController | undefined {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return undefined;
  }

  const target = scope ?? document.querySelector<HTMLElement>("#page-content") ?? document.body;

  // Graceful reduced motion handling
  if (globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    target.style.opacity = "1";
    return undefined;
  }

  cleanupAsciiReveals();

  const controller = createAsciiReveal(target, {
    preset: SMOOTH_DITHER_PRESET,
    duration: "cinematic",
    speed: 2,
    lazy: false,
    fallback: false,
    origin: "center",
    ...options,
  });

  activePageReveal = controller;

  // Run the dither reveal wave
  void controller.reveal().then(() => {
    if (activePageReveal === controller) {
      activePageReveal = null;
    }
  });

  return controller;
}

/** Scans and initializes any mounted [data-ascii-reveal] or [data-ascii-reveal-preset] containers. */
export function initAsciiReveals(scope: ParentNode = document): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const targets = scope.querySelectorAll<HTMLElement>(
    "[data-ascii-reveal]:not([data-ar-ready]), [data-ascii-reveal-preset]:not([data-ar-ready])",
  );

  targets.forEach((el) => {
    el.dataset["arReady"] = "true";
    const presetAttr = el.dataset["asciiRevealPreset"] ?? el.dataset["asciiReveal"];
    const preset = (presetAttr && presetAttr.length > 0 ? presetAttr : "dither") as PresetName;
    const duration = (el.dataset["asciiRevealDuration"] ?? "fast") as Duration;
    const speedRaw = el.dataset["asciiRevealSpeed"];
    const speed = speedRaw ? Number(speedRaw) : 2;

    const originAttr = el.dataset["asciiRevealOrigin"];
    let origin: Origin = "center";
    if (originAttr) {
      if (originAttr.startsWith("{")) {
        try {
          origin = JSON.parse(originAttr) as { x: number; y: number };
        } catch {
          origin = "center";
        }
      } else if (["top-left", "pointer", "center"].includes(originAttr)) {
        origin = originAttr as Origin;
      }
    }

    const isLazy = el.dataset["asciiRevealLazy"] === "true";
    const ctrl = revealWithAscii(el, { preset, duration, speed, origin, lazy: isLazy });
    void ctrl?.reveal();
  });
}

// Auto-run on document ready & Astro view transition events
if (typeof window !== "undefined") {
  const onReady = (): void => {
    initAsciiSkeletons();
    initAsciiReveals();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady, { once: true });
  } else {
    onReady();
  }

  document.addEventListener("astro:page-load", () => {
    onReady();
  });

  document.addEventListener("astro:before-preparation", () => {
    cleanupAsciiReveals();
  });
}

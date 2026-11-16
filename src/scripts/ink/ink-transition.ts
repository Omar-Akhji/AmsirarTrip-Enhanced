import type { Theme } from "@/scripts/theme";
import { captureViewport, renderScale, resetCaptureCache, viewportKey } from "./capture";
import { type InkFrame, InkRenderer } from "./renderer";
import { INK_DEFAULTS } from "./shaders";

export interface Point {
  readonly x: number;
  readonly y: number;
}

const SPREAD = { cleanupFrom: 0.45, cleanupPow: 2, cleanupReach: 0.4, growth: 0.7 } as const;

const CSS_FADE_MS = 350;
const FADE_OUT_MS = 150;
const ON_DEMAND_TIMEOUT_MS = 900;
const RESIZE_DEBOUNCE_MS = 250;
const SCROLL_DEBOUNCE_MS = 180;
const POST_SWITCH_CAPTURE_MS = 0;

interface InFlightCapture {
  readonly key: string;
  readonly promise: Promise<boolean>;
  readonly scrollY: number;
  readonly theme: Theme;
}

interface ActiveRun {
  readonly centerX: number;
  readonly centerY: number;
  readonly from: Theme;
  readonly maxDist: number;
  readonly seedAngle: number;
  readonly seedX: number;
  readonly seedY: number;
  readonly startMs: number;
  readonly to: Theme;
}

function resolveCurrentTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function isSkeletonHidden(): boolean {
  const skeleton = document.querySelector("#skeleton-container");
  return !skeleton || skeleton.classList.contains("hidden");
}

function defaultOrigin(): Point {
  const toggle = document.querySelector<HTMLButtonElement>("[data-theme-toggle]");
  if (toggle) {
    const rect = toggle.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }
  }
  return { x: globalThis.innerWidth * 0.9, y: 36 };
}

function farthestCorner(x: number, y: number, vw: number, vh: number): number {
  return Math.max(
    Math.hypot(x, y),
    Math.hypot(vw - x, y),
    Math.hypot(x, vh - y),
    Math.hypot(vw - x, vh - y),
  );
}

export class InkTransition {
  private active: ActiveRun | null = null;
  private captureEpoch = 0;
  private captureTimer = 0;
  private committing = false;
  private cssFadeTimer = 0;
  private fadeTimer = 0;
  private idleId = 0;
  private inFlight: InFlightCapture | null = null;
  private lastTheme: Theme = resolveCurrentTheme();
  private rafId = 0;
  private readonly reducedMotion: MediaQueryList;
  private readonly renderer: InkRenderer | null;
  private toggleEpoch = 0;

  public constructor(canvas: HTMLCanvasElement) {
    this.reducedMotion = globalThis.matchMedia("(prefers-reduced-motion: reduce)");
    this.renderer = InkRenderer.create(canvas);
    this.bindLifecycle();

    if (this.renderer) {
      this.renderer.resize(renderScale());
      this.renderer.watchContext(
        () => {
          this.cancelActive();
        },
        () => {
          this.scheduleCapture(0, false);
        },
      );
      if (isSkeletonHidden()) {
        this.scheduleCaptureAfterFonts(50);
      }
    }
  }

  public toggle(
    from: Theme,
    to: Theme,
    commitTheme: (theme: Theme) => void,
    origin?: Point | undefined,
  ): void {
    const myToggle = ++this.toggleEpoch;

    if (this.reducedMotion.matches) {
      this.captureEpoch += 1;
      this.cancelActive();
      this.commit(to, commitTheme);
      return;
    }

    const renderer = this.renderer;
    const scale = renderScale();
    const key = viewportKey(scale);

    if (this.active !== null) {
      if (this.active.to === from && renderer?.hasValid(from, key, globalThis.scrollY)) {
        this.cancelActive();
      } else {
        this.captureEpoch += 1;
        this.interruptWithCrossFade(to, commitTheme);
        return;
      }
    }

    if (this.fadeTimer !== 0) {
      this.cancelActive();
    }

    if (!renderer || renderer.isLost) {
      this.captureEpoch += 1;
      this.crossFade(to, commitTheme);
      return;
    }

    if (renderer.hasValid(from, key, globalThis.scrollY)) {
      this.captureEpoch += 1;
      this.startSpread(renderer, from, to, scale, commitTheme, origin);
      return;
    }

    void this.completeWithOnDemandCapture(myToggle, renderer, from, to, commitTheme, origin);
  }

  public warm(): void {
    if (!this.renderer || this.renderer.isLost || this.reducedMotion.matches) {
      return;
    }
    if (this.active !== null || this.inFlight !== null || !isSkeletonHidden()) {
      return;
    }
    const scale = renderScale();
    const key = viewportKey(scale);
    const theme = resolveCurrentTheme();
    if (!this.renderer.hasValid(theme, key, globalThis.scrollY)) {
      this.scheduleCapture(0, false);
    }
  }

  private bindLifecycle(): void {
    globalThis.addEventListener("amsirar:page-ready", () => {
      this.scheduleCaptureAfterFonts(50);
    });

    document.addEventListener("astro:before-preparation", () => {
      this.captureEpoch += 1;
      this.cancelActive();
      this.renderer?.clearSnapshots();
      resetCaptureCache();
    });

    globalThis.addEventListener(
      "scroll",
      () => {
        this.captureEpoch += 1;
        this.scheduleCapture(SCROLL_DEBOUNCE_MS);
      },
      { passive: true },
    );

    globalThis.addEventListener("resize", () => {
      this.captureEpoch += 1;
      this.renderer?.resize(renderScale());
      this.scheduleCapture(RESIZE_DEBOUNCE_MS);
    });

    globalThis.addEventListener("theme-change", () => {
      const nextTheme = resolveCurrentTheme();
      if (this.committing || nextTheme === this.lastTheme) {
        return;
      }
      this.lastTheme = nextTheme;
      this.captureEpoch += 1;
      this.cancelActive();
      this.scheduleCapture(POST_SWITCH_CAPTURE_MS, false);
    });

    this.reducedMotion.addEventListener("change", () => {
      if (this.reducedMotion.matches) {
        this.captureEpoch += 1;
        this.cancelActive();
        this.renderer?.clearSnapshots();
      } else if (isSkeletonHidden()) {
        this.scheduleCaptureAfterFonts(50);
      }
    });

    document.addEventListener("pointerenter", this.handleToggleHover, true);
    document.addEventListener("focusin", this.handleToggleHover, true);
  }

  private buildFrame(run: ActiveRun, elapsedMs: number): InkFrame {
    const time = Math.max(0, elapsedMs / 1000);
    const linear = Math.min(1, time / INK_DEFAULTS.duration);
    const eased = 1 - (1 - linear) ** 3;
    const ramp = Math.max(0, (linear - SPREAD.cleanupFrom) / (1 - SPREAD.cleanupFrom));
    const cleanup =
      ramp ** SPREAD.cleanupPow * run.maxDist * SPREAD.cleanupReach
      + Math.max(0, (linear - 0.97) / 0.03) * run.maxDist;

    return {
      centerX: run.centerX,
      centerY: run.centerY,
      cleanup,
      from: run.from,
      radius: eased * run.maxDist * SPREAD.growth,
      seedAngle: run.seedAngle,
      seedX: run.seedX,
      seedY: run.seedY,
      time,
      to: run.to,
    };
  }

  private cancelActive(): void {
    if (this.rafId !== 0) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
    if (this.fadeTimer !== 0) {
      window.clearTimeout(this.fadeTimer);
      this.fadeTimer = 0;
    }
    this.active = null;
    if (this.renderer) {
      delete this.renderer.canvas.dataset["active"];
    }
  }

  private cancelScheduledCapture(): void {
    if (this.captureTimer !== 0) {
      window.clearTimeout(this.captureTimer);
      this.captureTimer = 0;
    }
    if (this.idleId !== 0 && typeof globalThis.cancelIdleCallback === "function") {
      globalThis.cancelIdleCallback(this.idleId);
      this.idleId = 0;
    }
  }

  private captureCurrent(): Promise<boolean> {
    const renderer = this.renderer;
    if (!renderer || renderer.isLost || this.reducedMotion.matches) {
      return Promise.resolve(false);
    }
    if (
      this.active !== null
      || !isSkeletonHidden()
      || document.documentElement.classList.contains("theme-fade")
    ) {
      return Promise.resolve(false);
    }

    const theme = resolveCurrentTheme();
    const scale = renderScale();
    const key = viewportKey(scale);
    const scrollY = globalThis.scrollY;
    if (renderer.hasValid(theme, key, scrollY)) {
      return Promise.resolve(true);
    }

    if (this.inFlight) {
      const sameTarget =
        this.inFlight.theme === theme
        && this.inFlight.key === key
        && Math.abs(this.inFlight.scrollY - scrollY) <= 2;
      return sameTarget ? this.inFlight.promise : Promise.resolve(false);
    }

    const epoch = this.captureEpoch;
    let capturePromise: Promise<boolean> | null = null;
    capturePromise = (async (): Promise<boolean> => {
      try {
        const snap = await captureViewport(theme, scale, renderer.maxTextureSize);
        if (epoch !== this.captureEpoch || this.active !== null || renderer.isLost) {
          return false;
        }
        if (resolveCurrentTheme() !== theme || Math.abs(globalThis.scrollY - snap.scrollY) > 2) {
          return false;
        }
        return renderer.upload(snap.canvas, theme, key, snap.scrollY);
      } catch {
        return false;
      } finally {
        if (capturePromise !== null && this.inFlight?.promise === capturePromise) {
          this.inFlight = null;
        }
      }
    })();

    this.inFlight = { key, promise: capturePromise, scrollY, theme };
    return capturePromise;
  }

  private async completeWithOnDemandCapture(
    myToggle: number,
    renderer: InkRenderer,
    from: Theme,
    to: Theme,
    commitTheme: (theme: Theme) => void,
    origin?: Point | undefined,
  ): Promise<void> {
    const capturePromise = this.captureCurrent();
    const timeoutPromise = new Promise<boolean>((resolve) => {
      window.setTimeout(() => resolve(false), ON_DEMAND_TIMEOUT_MS);
    });
    await Promise.race([capturePromise, timeoutPromise]);

    if (
      myToggle !== this.toggleEpoch
      || this.reducedMotion.matches
      || this.active !== null
      || resolveCurrentTheme() !== from
    ) {
      return;
    }

    this.captureEpoch += 1;
    const scale = renderScale();
    const key = viewportKey(scale);
    if (!renderer.isLost && renderer.hasValid(from, key, globalThis.scrollY)) {
      this.startSpread(renderer, from, to, scale, commitTheme, origin);
      return;
    }

    this.crossFade(to, commitTheme);
  }

  private startSpread(
    renderer: InkRenderer,
    from: Theme,
    to: Theme,
    scale: number,
    commitTheme: (theme: Theme) => void,
    origin?: Point | undefined,
  ): void {
    renderer.resize(scale);
    const pt = origin ?? defaultOrigin();
    const vw = Math.max(1, document.documentElement.clientWidth);
    const vh = Math.max(1, globalThis.innerHeight);

    const run: ActiveRun = {
      centerX: pt.x,
      centerY: pt.y,
      from,
      maxDist: Math.max(1, farthestCorner(pt.x, pt.y, vw, vh)),
      seedAngle: Math.random() * Math.PI * 2,
      seedX: Math.random() * 20,
      seedY: Math.random() * 20,
      startMs: performance.now(),
      to,
    };

    const drawn = renderer.draw(this.buildFrame(run, 0));
    if (!drawn) {
      this.crossFade(to, commitTheme);
      return;
    }

    this.active = run;
    renderer.canvas.dataset["active"] = "true";
    this.commit(to, commitTheme);
    this.rafId = requestAnimationFrame(this.tick);
  }

  private commit(theme: Theme, commitTheme: (theme: Theme) => void): void {
    this.lastTheme = theme;
    this.committing = true;
    try {
      commitTheme(theme);
    } finally {
      this.committing = false;
    }
  }

  private crossFade(to: Theme, commitTheme: (theme: Theme) => void): void {
    const root = document.documentElement;
    root.classList.add("theme-fade");
    this.commit(to, commitTheme);

    window.clearTimeout(this.cssFadeTimer);
    this.cssFadeTimer = window.setTimeout(() => {
      root.classList.remove("theme-fade");
      this.cssFadeTimer = 0;
      this.scheduleCapture(0, false);
    }, CSS_FADE_MS + 40);
  }

  private finishSpread(): void {
    this.rafId = 0;
    this.active = null;
    if (this.renderer) {
      delete this.renderer.canvas.dataset["active"];
    }
    this.scheduleCapture(POST_SWITCH_CAPTURE_MS, false);
    window.clearTimeout(this.fadeTimer);
    this.fadeTimer = window.setTimeout(() => {
      this.fadeTimer = 0;
    }, FADE_OUT_MS + 20);
  }

  private readonly handleToggleHover = (e: Event): void => {
    const target = e.target;
    if (target instanceof Element && target.closest("[data-theme-toggle]")) {
      this.warm();
    }
  };

  private interruptWithCrossFade(to: Theme, commitTheme: (theme: Theme) => void): void {
    if (this.rafId !== 0) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
    window.clearTimeout(this.fadeTimer);
    this.active = null;
    if (this.renderer) {
      delete this.renderer.canvas.dataset["active"];
    }
    this.fadeTimer = 0;
    this.crossFade(to, commitTheme);
  }

  private scheduleCapture(delayMs: number, preferIdle = true): void {
    this.cancelScheduledCapture();
    if (!this.renderer || this.reducedMotion.matches) {
      return;
    }
    const run = (): void => {
      this.captureTimer = 0;
      if (preferIdle && typeof globalThis.requestIdleCallback === "function") {
        this.idleId = globalThis.requestIdleCallback(
          () => {
            this.idleId = 0;
            void this.captureCurrent();
          },
          { timeout: 600 },
        );
        return;
      }
      void this.captureCurrent();
    };
    if (delayMs <= 0) {
      run();
    } else {
      this.captureTimer = window.setTimeout(run, delayMs);
    }
  }

  private scheduleCaptureAfterFonts(delayMs: number): void {
    void document.fonts.ready.then(() => {
      this.scheduleCapture(delayMs, false);
    });
  }

  private readonly tick = (now: number): void => {
    const run = this.active;
    const renderer = this.renderer;
    if (!run || !renderer || renderer.isLost) {
      this.cancelActive();
      return;
    }

    const elapsedMs = now - run.startMs;
    const ok = renderer.draw(this.buildFrame(run, elapsedMs));
    if (!ok) {
      this.cancelActive();
      return;
    }

    if (elapsedMs >= INK_DEFAULTS.duration * 1000) {
      this.finishSpread();
      return;
    }

    this.rafId = requestAnimationFrame(this.tick);
  };
}

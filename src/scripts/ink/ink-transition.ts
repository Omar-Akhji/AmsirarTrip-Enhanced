import type { Theme } from "@/scripts/theme";
import { captureViewport, renderScale, resetCaptureCache, viewportKey } from "./capture";
import { type InkFrame, InkRenderer } from "./renderer";
import { INK_DEFAULTS } from "./shaders";

export interface Point {
  readonly x: number;
  readonly y: number;
}

const SPREAD = { cleanupFrom: 0.45, cleanupPow: 2, cleanupReach: 0.4, growth: 0.7 } as const;

const CSS_FADE_MS = 280;
const FADE_OUT_MS = 150;
const ON_DEMAND_TIMEOUT_MS = 1200;

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
  readonly scrollY: number;
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
  private committing = false;
  private cssFadeTimer: ReturnType<typeof setTimeout> | undefined;
  private fadeTimer: ReturnType<typeof setTimeout> | undefined;
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
          this.captureEpoch += 1;
        },
      );
    }
  }

  public toggle(from: Theme, to: Theme, commitTheme: (theme: Theme) => void, origin?: Point): void {
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

    if (this.fadeTimer !== undefined) {
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
    if (
      !this.renderer
      || this.renderer.isLost
      || this.reducedMotion.matches
      || this.active !== null
      || this.inFlight !== null
      || !isSkeletonHidden()
    ) {
      return;
    }
    const scale = renderScale();
    const key = viewportKey(scale);
    const theme = resolveCurrentTheme();
    if (!this.renderer.hasValid(theme, key, globalThis.scrollY)) {
      void this.captureCurrent();
    }
  }

  private bindLifecycle(): void {
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
        if (this.active !== null && Math.abs(globalThis.scrollY - this.active.scrollY) > 12) {
          this.cancelActive();
        }
      },
      { passive: true },
    );

    globalThis.addEventListener("resize", () => {
      this.captureEpoch += 1;
      this.cancelActive();
      this.renderer?.resize(renderScale());
    });

    globalThis.addEventListener("theme-change", () => {
      const nextTheme = resolveCurrentTheme();
      if (this.committing || nextTheme === this.lastTheme) {
        return;
      }
      this.lastTheme = nextTheme;
      this.captureEpoch += 1;
      this.cancelActive();
    });

    this.reducedMotion.addEventListener("change", () => {
      if (this.reducedMotion.matches) {
        this.captureEpoch += 1;
        this.cancelActive();
        this.renderer?.clearSnapshots();
      }
    });

    document.addEventListener("pointerenter", this.handleToggleHover, { capture: true });
    document.addEventListener("pointerdown", this.handleToggleHover, { capture: true });
    document.addEventListener("focusin", this.handleToggleHover, { capture: true });
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
    if (this.fadeTimer !== undefined) {
      globalThis.clearTimeout(this.fadeTimer);
      this.fadeTimer = undefined;
    }
    this.active = null;
    if (this.renderer) {
      delete this.renderer.canvas.dataset["active"];
    }
  }

  private async captureCurrent(): Promise<boolean> {
    const renderer = this.renderer;
    if (
      !renderer
      || renderer.isLost
      || this.reducedMotion.matches
      || this.active !== null
      || !isSkeletonHidden()
      || document.documentElement.classList.contains("theme-fade")
    ) {
      return false;
    }

    const theme = resolveCurrentTheme();
    const scale = renderScale();
    const key = viewportKey(scale);
    const scrollY = globalThis.scrollY;
    if (renderer.hasValid(theme, key, scrollY)) {
      return true;
    }

    if (this.inFlight) {
      const sameTarget =
        this.inFlight.theme === theme
        && this.inFlight.key === key
        && Math.abs(this.inFlight.scrollY - scrollY) <= 2;
      return sameTarget ? this.inFlight.promise : false;
    }

    const epoch = this.captureEpoch;
    const capturePromise = (async (): Promise<boolean> => {
      try {
        const snap = await captureViewport(theme, scale, renderer.maxTextureSize);
        const isCurrent =
          epoch === this.captureEpoch
          && this.active === null
          && !renderer.isLost
          && resolveCurrentTheme() === theme
          && Math.abs(globalThis.scrollY - snap.scrollY) <= 2;
        return isCurrent && renderer.upload(snap.canvas, theme, key, snap.scrollY);
      } catch {
        return false;
      } finally {
        if (
          this.inFlight?.theme === theme
          && this.inFlight.key === key
          && this.inFlight.scrollY === scrollY
        ) {
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
    origin?: Point,
  ): Promise<void> {
    const capturePromise = this.captureCurrent();
    const timeoutPromise = new Promise<boolean>((resolve) => {
      globalThis.setTimeout(() => resolve(false), ON_DEMAND_TIMEOUT_MS);
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
    origin?: Point,
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
      scrollY: globalThis.scrollY,
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

    globalThis.clearTimeout(this.cssFadeTimer);
    this.cssFadeTimer = globalThis.setTimeout(() => {
      root.classList.remove("theme-fade");
      this.cssFadeTimer = undefined;
    }, CSS_FADE_MS + 40);
  }

  private finishSpread(): void {
    this.rafId = 0;
    this.active = null;
    if (this.renderer) {
      delete this.renderer.canvas.dataset["active"];
    }
    globalThis.clearTimeout(this.fadeTimer);
    this.fadeTimer = globalThis.setTimeout(() => {
      this.fadeTimer = undefined;
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
    globalThis.clearTimeout(this.fadeTimer);
    this.active = null;
    if (this.renderer) {
      delete this.renderer.canvas.dataset["active"];
    }
    this.fadeTimer = undefined;
    this.crossFade(to, commitTheme);
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

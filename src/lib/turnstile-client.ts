export interface TurnstileRenderOptions {
  readonly action?: string | undefined;
  readonly callback?: ((token: string) => void) | undefined;
  readonly "error-callback"?: (() => void) | undefined;
  readonly "expired-callback"?: (() => void) | undefined;
  readonly language?: string | undefined;
  readonly "refresh-expired"?: "auto" | "manual" | "never" | undefined;
  readonly sitekey: string;
  readonly size?: "compact" | "normal" | undefined;
  readonly theme?: "auto" | "dark" | "light" | undefined;
}

export interface TurnstileApi {
  readonly getResponse: (widgetId?: string) => string | undefined;
  readonly remove: (widgetId?: string) => void;
  readonly render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
  readonly reset: (widgetId?: string) => void;
}

export interface TurnstileInstance {
  readonly getValue: () => string;
  readonly reset: () => void;
}

declare global {
  var turnstile: TurnstileApi | undefined;
}

export const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let sharedScriptPromise: Promise<TurnstileApi | null> | null = null;

export function getTurnstileApi(): TurnstileApi | null {
  return typeof globalThis === "undefined" ? null : (globalThis.turnstile ?? null);
}

export async function loadTurnstileApi(): Promise<TurnstileApi | null> {
  if (typeof document === "undefined") return null;
  const loaded = getTurnstileApi();
  if (loaded) return loaded;
  if (sharedScriptPromise) return sharedScriptPromise;

  sharedScriptPromise = new Promise<TurnstileApi | null>((resolve) => {
    const resolveLoaded = (): void => {
      const api = getTurnstileApi();
      if (!api) sharedScriptPromise = null;
      resolve(api);
    };

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${CSS.escape(TURNSTILE_SCRIPT_SRC)}"]`,
    );
    if (existing) {
      if (getTurnstileApi()) {
        resolveLoaded();
        return;
      }
      existing.addEventListener("load", resolveLoaded, { once: true });
      existing.addEventListener(
        "error",
        () => {
          existing.remove();
          sharedScriptPromise = null;
          resolve(null);
        },
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", resolveLoaded, { once: true });
    script.addEventListener(
      "error",
      () => {
        script.remove();
        sharedScriptPromise = null;
        resolve(null);
      },
      { once: true },
    );
    document.head.append(script);
  });

  return sharedScriptPromise;
}

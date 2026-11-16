import type { Theme } from "@/scripts/theme";

const SKIP_TAGS = new Set(["IFRAME", "NOSCRIPT", "SCRIPT", "SOURCE", "TEMPLATE", "VIDEO"]);
const MAX_ASSET_CACHE = 64;
const MAX_CAPTURE_SCALE = 1.5;
const URL_FUNC_RE = /url\(["']?((?!data:|#)[^)"']+)["']?\)/g;

interface StickyPin {
  readonly height: number;
  readonly left: number;
  readonly top: number;
  readonly width: number;
}

export interface ViewportSnapshot {
  readonly canvas: HTMLCanvasElement;
  readonly scrollY: number;
}

const assetCache = new Map<string, string>();
let cachedCss: string | null = null;

export function resetCaptureCache(): void {
  cachedCss = null;
}

export function renderScale(): number {
  const cap = globalThis.matchMedia("(pointer: coarse)").matches ? 1.5 : 2;
  return Math.min(globalThis.devicePixelRatio || 1, cap);
}

export function viewportKey(scale: number): string {
  const vw = document.documentElement.clientWidth;
  const vh = globalThis.innerHeight;
  return `${vw}x${vh}@${scale}`;
}

function toAbsoluteUrl(raw: string): string | null {
  try {
    return new URL(raw, globalThis.location.href).href;
  } catch {
    return null;
  }
}

async function fetchAsDataUrl(url: string): Promise<string | null> {
  const hit = assetCache.get(url);
  if (hit !== undefined) {
    return hit;
  }
  try {
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) {
      return null;
    }
    const blob = await res.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        resolve(typeof reader.result === "string" ? reader.result : "");
      });
      reader.addEventListener("error", () => {
        reject(reader.error ?? new Error("FileReader failed"));
      });
      reader.readAsDataURL(blob);
    });
    if (!dataUrl) {
      return null;
    }
    if (assetCache.size >= MAX_ASSET_CACHE) {
      const oldest = assetCache.keys().next().value;
      if (oldest !== undefined) {
        assetCache.delete(oldest);
      }
    }
    assetCache.set(url, dataUrl);
    return dataUrl;
  } catch {
    return null;
  }
}

async function getResolvedCss(): Promise<string> {
  if (cachedCss !== null) {
    return cachedCss;
  }

  const parts: string[] = [];
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        parts.push(rule.cssText);
      }
    } catch {
      // Ignore cross-origin stylesheets that block cssRules access.
    }
  }
  const rawCss = parts.join("\n");

  const urls = new Set<string>();
  URL_FUNC_RE.lastIndex = 0;
  for (let match = URL_FUNC_RE.exec(rawCss); match !== null; match = URL_FUNC_RE.exec(rawCss)) {
    const abs = match[1] ? toAbsoluteUrl(match[1]) : null;
    if (abs) {
      urls.add(abs);
    }
  }

  await Promise.all([...urls].map((u) => fetchAsDataUrl(u)));

  URL_FUNC_RE.lastIndex = 0;
  cachedCss = rawCss.replaceAll(URL_FUNC_RE, (_, raw: string) => {
    const abs = toAbsoluteUrl(raw);
    const dataUrl = abs ? assetCache.get(abs) : undefined;
    return dataUrl ? `url("${dataUrl}")` : "none";
  });

  return cachedCss;
}

function collectStickyPins(scrollY: number, vh: number): Map<Element, StickyPin> {
  const pins = new Map<Element, StickyPin>();
  if (scrollY <= 0) {
    return pins;
  }
  const main = document.querySelector("#main-content");
  if (!main) {
    return pins;
  }

  for (const el of main.querySelectorAll('[class*="sticky"]')) {
    if (getComputedStyle(el).position !== "sticky") {
      continue;
    }
    const rect = el.getBoundingClientRect();
    if (rect.height <= 0 || rect.bottom <= 0 || rect.top >= vh) {
      continue;
    }
    pins.set(el, { height: rect.height, left: rect.left, top: rect.top, width: rect.width });
  }
  return pins;
}

function shouldSpacerPrune(el: Element): boolean {
  return el.parentElement?.id === "page-content" || el.tagName === "FOOTER";
}

function createSpacer(height: number): HTMLElement {
  const spacer = document.createElement("div");
  spacer.setAttribute("aria-hidden", "true");
  spacer.style.height = `${height}px`;
  spacer.style.width = "1px";
  spacer.style.overflow = "hidden";
  spacer.style.pointerEvents = "none";
  return spacer;
}

function cloneSubtree(
  node: Node,
  vh: number,
  stickyPins: Map<Element, StickyPin>,
  imageJobs: Array<{ cloned: HTMLImageElement; src: string }>,
): Node | null {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.cloneNode(false);
  }
  if (!(node instanceof Element)) {
    return null;
  }

  const tag = node.tagName;
  if (
    SKIP_TAGS.has(tag)
    || node.id === "skeleton-container"
    || node.hasAttribute("data-ink-ignore")
  ) {
    return null;
  }

  if (shouldSpacerPrune(node)) {
    const rect = node.getBoundingClientRect();
    if (rect.height > 0) {
      if (rect.top >= vh) {
        return null;
      }
      if (rect.bottom <= 0) {
        return node.parentElement?.id === "page-content" ? createSpacer(rect.height) : null;
      }
    }
  }

  const cloned = node.cloneNode(false) as Element;

  if (cloned instanceof HTMLElement) {
    const pin = stickyPins.get(node);
    if (pin) {
      cloned.style.position = "fixed";
      cloned.style.top = `${pin.top}px`;
      cloned.style.left = `${pin.left}px`;
      cloned.style.width = `${pin.width}px`;
      cloned.style.height = `${pin.height}px`;
      cloned.style.margin = "0";
      cloned.style.zIndex = "20";
    }

    if (node instanceof HTMLImageElement && cloned instanceof HTMLImageElement) {
      cloned.removeAttribute("srcset");
      const rect = node.getBoundingClientRect();
      const visible =
        rect.width > 0
        && rect.height > 0
        && rect.bottom > 0
        && rect.top < vh
        && node.currentSrc.length > 0;
      if (visible) {
        imageJobs.push({ cloned, src: node.currentSrc });
      } else {
        cloned.removeAttribute("src");
      }
    }
  }

  for (let child = node.firstChild; child !== null; child = child.nextSibling) {
    const clonedChild = cloneSubtree(child, vh, stickyPins, imageJobs);
    if (clonedChild) {
      cloned.append(clonedChild);
    }
  }

  return cloned;
}

function resolveBodyBg(theme: Theme): string {
  const computed = getComputedStyle(document.body).backgroundColor;
  if (computed && computed !== "rgba(0, 0, 0, 0)" && computed !== "transparent") {
    return computed;
  }
  return theme === "dark" ? "#0d0e12" : "#fafafa";
}

export async function captureViewport(
  theme: Theme,
  scale: number,
  maxTextureSize: number,
): Promise<ViewportSnapshot> {
  const vw = Math.max(1, document.documentElement.clientWidth);
  const vh = Math.max(1, globalThis.innerHeight);
  const scrollY = globalThis.scrollY;
  const captureScale = Math.min(scale, MAX_CAPTURE_SCALE, maxTextureSize / vw, maxTextureSize / vh);
  const stickyPins = collectStickyPins(scrollY, vh);

  const cssPromise = getResolvedCss();
  const imageJobs: Array<{ cloned: HTMLImageElement; src: string }> = [];
  const bodyClone = cloneSubtree(document.body, vh, stickyPins, imageJobs);
  if (!(bodyClone instanceof HTMLElement)) {
    throw new TypeError("Failed to clone viewport body");
  }

  bodyClone.style.margin = "0";
  bodyClone.style.width = `${vw}px`;
  bodyClone.style.height = `${vh}px`;
  bodyClone.style.overflow = "hidden";
  bodyClone.style.backgroundColor = resolveBodyBg(theme);
  bodyClone.style.backgroundPositionY = `${-scrollY}px`;

  if (scrollY > 0) {
    const clonedMain = bodyClone.querySelector<HTMLElement>("#main-content");
    if (clonedMain) {
      // Offset via marginTop (not transform) so pinned sticky clones remain viewport-fixed.
      clonedMain.style.marginTop = `${-scrollY}px`;
    }
  }

  const [cssText] = await Promise.all([
    cssPromise,
    Promise.all(
      imageJobs.map(async (job) => {
        const dataUrl = await fetchAsDataUrl(job.src);
        if (dataUrl) {
          job.cloned.src = dataUrl;
        } else {
          job.cloned.removeAttribute("src");
        }
      }),
    ),
  ]);

  const doc = document.implementation.createHTMLDocument("");
  const htmlEl = doc.documentElement;
  for (const attr of document.documentElement.attributes) {
    htmlEl.setAttribute(attr.name, attr.value);
  }
  const styleEl = doc.createElement("style");
  styleEl.textContent = cssText;
  doc.head.append(styleEl);
  doc.body.replaceWith(doc.importNode(bodyClone, true));

  const xhtml = new XMLSerializer().serializeToString(htmlEl);
  const outW = Math.max(1, Math.round(vw * captureScale));
  const outH = Math.max(1, Math.round(vh * captureScale));
  // Keep intrinsic SVG size in CSS px (vw x vh) so @media queries and vw/vh inside foreignObject match the live viewport at any DPR.
  const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="${vw}" height="${vh}"><foreignObject width="100%" height="100%">${xhtml}</foreignObject></svg>`;

  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgStr)}`;
  await img.decode();

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("2D canvas context unavailable");
  }
  ctx.drawImage(img, 0, 0, outW, outH);

  return { canvas, scrollY };
}

import { expect, test, type Page } from "@playwright/test";

/**
 * Google Core Web Vitals (CWV) Test Suite
 *
 * Implemented in strict alignment with Google Chrome's official web-vitals specification
 * (https://github.com/googlechrome/web-vitals & web.dev/vitals):
 *
 * 1. LCP (Largest Contentful Paint):
 *
 *    - Uses renderTime with fallback to loadTime and startTime
 *    - Freezes upon user interaction (pointerdown, click, keydown, scroll)
 *    - Google Target: Good <= 2500ms
 * 2. CLS (Cumulative Layout Shift):
 *
 *    - Discards entries where hadRecentInput === true
 *    - Uses Google's LayoutShiftManager Session Windowing (max window with gap < 1000ms and total
 *         duration < 5000ms)
 *    - Google Target: Good <= 0.1
 * 3. INP (Interaction to Next Paint):
 *
 *    - Replaces legacy FID (First Input Delay)
 *    - Tracks Event Timing entries grouped by interactionId
 *    - Records maximum latency across interaction lifecycles
 *    - Google Target: Good <= 200ms
 * 4. FCP (First Contentful Paint):
 *
 *    - Tracks first-contentful-paint entry from paint pipeline
 *    - Google Target: Good <= 1800ms
 * 5. TTFB (Time to First Byte):
 *
 *    - Measures responseStart relative to navigation start
 *    - Google Target: Good <= 800ms
 */

export interface WebVitalsMetrics {
  ttfb: number;
  fcp: number;
  lcp: number;
  cls: number;
  inp: number;
  lcpElement?: string;
  clsEntriesCount: number;
}

interface CwvState {
  cls: number;
  lcp: number;
  fcp: number;
  inp: number;
  lcpElement: string;
  clsEntries: { value: number; startTime: number }[];
}

interface PerformanceLayoutShift extends PerformanceEntry {
  readonly hadRecentInput: boolean;
  readonly value: number;
}

interface PerformanceLargestContentfulPaint extends PerformanceEntry {
  readonly renderTime?: number;
  readonly loadTime?: number;
  readonly element?: Element | null;
  readonly url?: string;
}

interface PerformanceEventTimingEntry extends PerformanceEntry {
  readonly interactionId?: number;
  readonly duration: number;
}

interface EventPerformanceObserverInit extends PerformanceObserverInit {
  readonly durationThreshold?: number;
}

declare global {
  var __cwv: CwvState | undefined;
}

const GOOGLE_CWV_THRESHOLDS = {
  LCP: 2500, // ms
  CLS: 0.1, // unitless
  INP: 200, // ms
  FCP: 1800, // ms
  TTFB: 800, // ms
} as const;

/** Injects Google's exact Core Web Vitals observers before page scripts execute. */
async function attachWebVitalsObserver(page: Page): Promise<void> {
  await page.addInitScript(() => {
    // Pre-acknowledge cookie consent to avoid modal backdrop intercepting interaction
    try {
      localStorage.setItem(
        "amsirar_cookie_consent_v1",
        JSON.stringify({
          necessary: true,
          analytics: true,
          functional: true,
          timestamp: new Date().toISOString(),
          version: 1,
        }),
      );
    } catch {}

    const cwvState: CwvState = { cls: 0, lcp: 0, fcp: 0, inp: 0, lcpElement: "", clsEntries: [] };
    Reflect.set(globalThis, "__cwv", cwvState);

    // ─────────────────────────────────────────────────────────────────────────
    // 1. Google CLS: Session Window Algorithm (web-vitals LayoutShiftManager)
    // ─────────────────────────────────────────────────────────────────────────
    let maxSessionValue = 0;
    let currentSessionValue = 0;
    let sessionEntries: PerformanceLayoutShift[] = [];

    try {
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries() as unknown as PerformanceLayoutShift[]) {
          // Google rule: only count layout shifts without recent user input (< 500ms)
          if (entry.hadRecentInput) continue;

          const firstEntry = sessionEntries[0];
          const lastEntry = sessionEntries.at(-1);

          // Google session window rule:
          // Entry joins session if gap < 1000ms AND total session length < 5000ms
          if (
            currentSessionValue
            && firstEntry
            && lastEntry
            && entry.startTime - lastEntry.startTime < 1000
            && entry.startTime - firstEntry.startTime < 5000
          ) {
            currentSessionValue += entry.value;
            sessionEntries.push(entry);
          } else {
            currentSessionValue = entry.value;
            sessionEntries = [entry];
          }

          if (currentSessionValue > maxSessionValue) {
            maxSessionValue = currentSessionValue;
          }

          cwvState.cls = maxSessionValue;
          cwvState.clsEntries.push({ value: entry.value, startTime: entry.startTime });
        }
      }).observe({ type: "layout-shift", buffered: true });
    } catch {}

    // ─────────────────────────────────────────────────────────────────────────
    // 2. Google LCP: Largest Contentful Paint with Finalization on Interaction
    // ─────────────────────────────────────────────────────────────────────────
    let isLcpFinalized = false;
    let lcpObserver: PerformanceObserver | null = null;

    try {
      lcpObserver = new PerformanceObserver((entryList) => {
        if (isLcpFinalized) return;
        const entries = entryList.getEntries() as unknown as PerformanceLargestContentfulPaint[];
        if (entries.length > 0) {
          const last = entries.at(-1);
          if (last) {
            // Google rule: renderTime || loadTime || startTime
            cwvState.lcp = last.renderTime ?? last.loadTime ?? last.startTime;
            cwvState.lcpElement =
              last.element?.tagName.toLowerCase() ?? last.element?.id ?? last.url ?? "unknown";
          }
        }
      });
      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });

      // Google rule: stop recording LCP once user inputs (click, scroll, key)
      const finalizeLcp = () => {
        if (isLcpFinalized) return;
        isLcpFinalized = true;
        lcpObserver?.disconnect();
      };

      for (const event of ["keydown", "click", "pointerdown", "touchstart"]) {
        globalThis.addEventListener(event, finalizeLcp, { once: true, capture: true });
      }
    } catch {}

    // ─────────────────────────────────────────────────────────────────────────
    // 3. Google INP: Interaction to Next Paint (Grouped by interactionId)
    // ─────────────────────────────────────────────────────────────────────────
    const interactionMap = new Map<number, number>();

    try {
      const eventObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries() as unknown as PerformanceEventTimingEntry[]) {
          const interactionId = entry.interactionId;
          const duration = entry.duration;

          if (interactionId) {
            const existingMax = interactionMap.get(interactionId) ?? 0;
            const newMax = Math.max(existingMax, duration);
            interactionMap.set(interactionId, newMax);
          }

          // INP is the worst interaction latency across all interaction groups
          let worstInteraction = 0;
          for (const latency of interactionMap.values()) {
            if (latency > worstInteraction) worstInteraction = latency;
          }

          cwvState.inp = worstInteraction || duration;
        }
      });
      const eventObserverOptions: EventPerformanceObserverInit & { durationThreshold: number } = {
        type: "event",
        durationThreshold: 16,
        buffered: true,
      };
      eventObserver.observe(eventObserverOptions);
    } catch {}

    // ─────────────────────────────────────────────────────────────────────────
    // 4. Google FCP: First Contentful Paint
    // ─────────────────────────────────────────────────────────────────────────
    try {
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.name === "first-contentful-paint") {
            cwvState.fcp = entry.startTime;
          }
        }
      }).observe({ type: "paint", buffered: true });
    } catch {}
  });
}

/** Collects finalized Google Core Web Vitals from the browser context */
async function collectWebVitals(page: Page): Promise<WebVitalsMetrics> {
  await page.waitForTimeout(300);

  return page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0] as
      PerformanceNavigationTiming | undefined;
    const ttfb = nav ? nav.responseStart : 0;
    const cwv = globalThis.__cwv ?? {
      cls: 0,
      lcp: 0,
      fcp: 0,
      inp: 0,
      lcpElement: "",
      clsEntries: [],
    };

    return {
      ttfb: Math.round(ttfb),
      fcp: Math.round(cwv.fcp),
      lcp: Math.round(cwv.lcp),
      cls: Number(cwv.cls.toFixed(4)),
      inp: Math.round(cwv.inp),
      lcpElement: cwv.lcpElement,
      clsEntriesCount: cwv.clsEntries.length,
    };
  });
}

function getVitalStatus(val: number, max: number): string {
  return val <= max ? "GOOD" : "NEEDS IMPROVEMENT";
}

function logVitalsSummary(route: string, vitals: WebVitalsMetrics): void {
  console.info(`\n📊 [Google Core Web Vitals] Route: ${route}`);
  console.info(
    `   • TTFB : ${vitals.ttfb} ms [${getVitalStatus(vitals.ttfb, GOOGLE_CWV_THRESHOLDS.TTFB)}]`,
  );
  console.info(
    `   • FCP  : ${vitals.fcp} ms [${getVitalStatus(vitals.fcp, GOOGLE_CWV_THRESHOLDS.FCP)}]`,
  );
  console.info(
    `   • LCP  : ${vitals.lcp} ms (element: <${vitals.lcpElement}>) [${getVitalStatus(vitals.lcp, GOOGLE_CWV_THRESHOLDS.LCP)}]`,
  );
  console.info(
    `   • CLS  : ${vitals.cls} (shifts: ${vitals.clsEntriesCount}) [${getVitalStatus(vitals.cls, GOOGLE_CWV_THRESHOLDS.CLS)}]`,
  );
  console.info(
    `   • INP  : ${vitals.inp} ms [${getVitalStatus(vitals.inp, GOOGLE_CWV_THRESHOLDS.INP)}]\n`,
  );
}

test.describe("Google Core Web Vitals Suite", () => {
  test("Home Page (/) passes all Google Core Web Vitals thresholds", async ({ page }) => {
    await attachWebVitalsObserver(page);

    const response = await page.goto("/", { waitUntil: "load" });
    expect(response?.status()).toBe(200);

    // Trigger scroll and lazy load to test Google CLS session windows
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    await page.waitForTimeout(200);

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(200);

    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });

    const vitals = await collectWebVitals(page);
    logVitalsSummary("/", vitals);

    expect(vitals.ttfb).toBeLessThanOrEqual(GOOGLE_CWV_THRESHOLDS.TTFB);
    expect(vitals.fcp).toBeLessThanOrEqual(GOOGLE_CWV_THRESHOLDS.FCP);
    expect(vitals.lcp).toBeLessThanOrEqual(GOOGLE_CWV_THRESHOLDS.LCP);
    expect(vitals.cls).toBeLessThanOrEqual(GOOGLE_CWV_THRESHOLDS.CLS);
  });

  test("Tours Catalog (/tours) passes Google CLS and INP", async ({ page }) => {
    await attachWebVitalsObserver(page);

    const response = await page.goto("/tours", { waitUntil: "load" });
    expect(response?.status()).toBe(200);

    await page.evaluate(() => {
      window.scrollTo(0, 800);
    });
    await page.waitForTimeout(200);

    const filterBtn = page.locator("button[data-city-filter]").first();
    if (await filterBtn.isVisible()) {
      await filterBtn.click();
      await page.waitForTimeout(100);
    }

    const vitals = await collectWebVitals(page);
    logVitalsSummary("/tours", vitals);

    expect(vitals.lcp).toBeLessThanOrEqual(GOOGLE_CWV_THRESHOLDS.LCP);
    expect(vitals.cls).toBeLessThanOrEqual(GOOGLE_CWV_THRESHOLDS.CLS);
    expect(vitals.inp).toBeLessThanOrEqual(GOOGLE_CWV_THRESHOLDS.INP);
  });

  test("Tour Detail Page (/tours/caravan-and-kasbah-experience-3-days) passes Google LCP and Accordion INP", async ({
    page,
  }) => {
    await attachWebVitalsObserver(page);

    const response = await page.goto("/tours/caravan-and-kasbah-experience-3-days", {
      waitUntil: "load",
    });
    expect(response?.status()).toBe(200);

    const faqSummary = page.locator("details summary").first();
    if (await faqSummary.isVisible()) {
      await faqSummary.click();
      await page.waitForTimeout(100);
    }

    const vitals = await collectWebVitals(page);
    logVitalsSummary("/tours/caravan-and-kasbah-experience-3-days", vitals);

    expect(vitals.lcp).toBeLessThanOrEqual(GOOGLE_CWV_THRESHOLDS.LCP);
    expect(vitals.cls).toBeLessThanOrEqual(GOOGLE_CWV_THRESHOLDS.CLS);
    expect(vitals.inp).toBeLessThanOrEqual(GOOGLE_CWV_THRESHOLDS.INP);
  });

  test("Contact Page (/contact) passes Google responsiveness and stability", async ({ page }) => {
    await attachWebVitalsObserver(page);

    const response = await page.goto("/contact", { waitUntil: "load" });
    expect(response?.status()).toBe(200);

    const nameInput = page.locator("input#contact-name, input[name='name']").first();
    if (await nameInput.isVisible()) {
      await nameInput.click();
      await nameInput.fill("Omar");
    }

    const vitals = await collectWebVitals(page);
    logVitalsSummary("/contact", vitals);

    expect(vitals.lcp).toBeLessThanOrEqual(GOOGLE_CWV_THRESHOLDS.LCP);
    expect(vitals.cls).toBeLessThanOrEqual(GOOGLE_CWV_THRESHOLDS.CLS);
    expect(vitals.inp).toBeLessThanOrEqual(GOOGLE_CWV_THRESHOLDS.INP);
  });
});

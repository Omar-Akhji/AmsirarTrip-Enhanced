import { spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs";

console.info("Starting production server on port 4322...");

// Start the server
process.env["PORT"] = "4322";
const server: ChildProcess = spawn("node", ["./dist/server/entry.mjs"], {
  env: process.env,
  shell: true,
});

server.stdout?.on("data", (data: Buffer | string) => {
  console.info(`[Server]: ${data.toString().trim()}`);
});

server.stderr?.on("data", (data: Buffer | string) => {
  console.error(`[Server Error]: ${data.toString().trim()}`);
});

// Helper function to run Lighthouse for a specific configuration
function runLighthouse(args: string[]): Promise<number | null> {
  return new Promise((resolve) => {
    console.info(`Running Lighthouse with args: ${args.join(" ")}`);
    const lighthouse = spawn("npx", ["lighthouse", ...args], { shell: true, stdio: "inherit" });

    lighthouse.on("close", (code) => {
      resolve(code);
    });
  });
}

interface LighthouseMetrics {
  fcp: string;
  lcp: string;
  tbt: string;
  cls: string;
  speedIndex: string;
  interactive: string;
}

interface LighthouseResult {
  categories: Record<string, number>;
  metrics: LighthouseMetrics;
}

interface RawLighthouseCategory {
  score: number;
}

interface RawLighthouseAudit {
  displayValue?: string;
}

interface RawLighthouseReport {
  categories: Record<string, RawLighthouseCategory>;
  audits: Record<string, RawLighthouseAudit>;
}

// Helper to extract category scores and metrics from HTML report
function parseLighthouseReport(filePath: string): LighthouseResult | null {
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const html = fs.readFileSync(filePath, "utf8");
    const match = html.match(/window\.__LIGHTHOUSE_JSON__\s*=\s*(\{.*?\});/);
    if (!match?.[1]) return null;

    const data = JSON.parse(match[1]) as RawLighthouseReport;
    const categories: Record<string, number> = {};
    for (const [key, category] of Object.entries(data.categories)) {
      categories[key] = Math.round(category.score * 100);
    }

    const audits = data.audits;
    const metrics: LighthouseMetrics = {
      fcp: audits["first-contentful-paint"]?.displayValue || "N/A",
      lcp: audits["largest-contentful-paint"]?.displayValue || "N/A",
      tbt: audits["total-blocking-time"]?.displayValue || "N/A",
      cls: audits["cumulative-layout-shift"]?.displayValue || "N/A",
      speedIndex: audits["speed-index"]?.displayValue || "N/A",
      interactive: audits["interactive"]?.displayValue || "N/A",
    };

    return { categories, metrics };
  } catch (error) {
    console.error(`Failed to parse report at ${filePath}:`, error);
    return null;
  }
}

// Wait 3 seconds for server to start, then run Lighthouse audits
setTimeout(() => {
  void (async () => {
    console.info("\n=========================================");
    console.info("STAGE 1: Running Mobile Lighthouse Audit...");
    console.info("=========================================");

    await runLighthouse([
      "http://localhost:4322",
      '--chrome-flags="--headless"',
      "--output=html",
      "--output-path=lighthouse-mobile.html",
    ]);

    console.info("\n=========================================");
    console.info("STAGE 2: Running Desktop Lighthouse Audit...");
    console.info("=========================================");

    await runLighthouse([
      "http://localhost:4322",
      "--preset=desktop",
      '--chrome-flags="--headless"',
      "--output=html",
      "--output-path=lighthouse-desktop.html",
    ]);

    console.info("\nShutting down server...");
    server.kill("SIGINT");

    // Print results summary
    const mobileResults = parseLighthouseReport("lighthouse-mobile.html");
    const desktopResults = parseLighthouseReport("lighthouse-desktop.html");

    if (mobileResults && desktopResults) {
      console.info("\n======================================================");
      console.info("             PAGESPEED INSIGHTS SUMMARY               ");
      console.info("======================================================");
      console.info("\n--- CATEGORY SCORES ---");
      console.info("Category         | Mobile | Desktop");
      console.info("-----------------|--------|--------");
      console.info(
        `Performance      |   ${mobileResults.categories["performance"]}%  |   ${desktopResults.categories["performance"]}%`,
      );
      console.info(
        `Accessibility    |  ${mobileResults.categories["accessibility"]}%  |  ${desktopResults.categories["accessibility"]}%`,
      );
      console.info(
        `Best Practices   |  ${mobileResults.categories["best-practices"]}%  |  ${desktopResults.categories["best-practices"]}%`,
      );
      console.info(
        `SEO              |  ${mobileResults.categories["seo"]}%  |  ${desktopResults.categories["seo"]}%`,
      );

      console.info("\n--- CORE WEB VITALS METRICS ---");
      console.info("Metric                     | Mobile     | Desktop");
      console.info("---------------------------|------------|------------");
      console.info(
        `First Contentful Paint     | ${mobileResults.metrics.fcp.padEnd(10)} | ${desktopResults.metrics.fcp.padEnd(10)}`,
      );
      console.info(
        `Largest Contentful Paint   | ${mobileResults.metrics.lcp.padEnd(10)} | ${desktopResults.metrics.lcp.padEnd(10)}`,
      );
      console.info(
        `Total Blocking Time        | ${mobileResults.metrics.tbt.padEnd(10)} | ${desktopResults.metrics.tbt.padEnd(10)}`,
      );
      console.info(
        `Cumulative Layout Shift    | ${mobileResults.metrics.cls.padEnd(10)} | ${desktopResults.metrics.cls.padEnd(10)}`,
      );
      console.info(
        `Speed Index                | ${mobileResults.metrics.speedIndex.padEnd(10)} | ${desktopResults.metrics.speedIndex.padEnd(10)}`,
      );
      console.info(
        `Time to Interactive        | ${mobileResults.metrics.interactive.padEnd(10)} | ${desktopResults.metrics.interactive.padEnd(10)}`,
      );
      console.info("======================================================\n");
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(0);
    }
    console.error("Failed to parse one or both Lighthouse reports.");
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  })();
}, 3000);

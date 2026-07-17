import { spawn, type ChildProcess } from "child_process";
import fs from "fs";

console.log("Starting production server on port 4322...");

// Start the server
process.env["PORT"] = "4322";
const server: ChildProcess = spawn("node", ["./dist/server/entry.mjs"], {
  env: process.env,
  shell: true,
});

server.stdout?.on("data", (data: Buffer | string) => {
  console.log(`[Server]: ${data.toString().trim()}`);
});

server.stderr?.on("data", (data: Buffer | string) => {
  console.error(`[Server Error]: ${data.toString().trim()}`);
});

// Helper function to run Lighthouse for a specific configuration
function runLighthouse(args: string[]): Promise<number | null> {
  return new Promise((resolve) => {
    console.log(`Running Lighthouse with args: ${args.join(" ")}`);
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

// Helper to extract category scores and metrics from HTML report
function parseLighthouseReport(filePath: string): LighthouseResult | null {
  try {
    const html = fs.readFileSync(filePath, "utf8");
    const match = html.match(/window\.__LIGHTHOUSE_JSON__\s*=\s*(\{.*?\});/);
    if (!match || !match[1]) return null;

    const data = JSON.parse(match[1]) as any;
    const categories: Record<string, number> = {};
    for (const [key, category] of Object.entries(data.categories) as [string, any][]) {
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
setTimeout(async () => {
  console.log("\n=========================================");
  console.log("STAGE 1: Running Mobile Lighthouse Audit...");
  console.log("=========================================");

  await runLighthouse([
    "http://localhost:4322",
    '--chrome-flags="--headless"',
    "--output=html",
    "--output-path=lighthouse-mobile.html",
  ]);

  console.log("\n=========================================");
  console.log("STAGE 2: Running Desktop Lighthouse Audit...");
  console.log("=========================================");

  await runLighthouse([
    "http://localhost:4322",
    "--preset=desktop",
    '--chrome-flags="--headless"',
    "--output=html",
    "--output-path=lighthouse-desktop.html",
  ]);

  console.log("\nShutting down server...");
  server.kill("SIGINT");

  // Print results summary
  const mobileResults = parseLighthouseReport("lighthouse-mobile.html");
  const desktopResults = parseLighthouseReport("lighthouse-desktop.html");

  if (mobileResults && desktopResults) {
    console.log("\n======================================================");
    console.log("             PAGESPEED INSIGHTS SUMMARY               ");
    console.log("======================================================");
    console.log("\n--- CATEGORY SCORES ---");
    console.log("Category         | Mobile | Desktop");
    console.log("-----------------|--------|--------");
    console.log(
      `Performance      |   ${mobileResults.categories["performance"]}%  |   ${desktopResults.categories["performance"]}%`,
    );
    console.log(
      `Accessibility    |  ${mobileResults.categories["accessibility"]}%  |  ${desktopResults.categories["accessibility"]}%`,
    );
    console.log(
      `Best Practices   |  ${mobileResults.categories["best-practices"]}%  |  ${desktopResults.categories["best-practices"]}%`,
    );
    console.log(
      `SEO              |  ${mobileResults.categories["seo"]}%  |  ${desktopResults.categories["seo"]}%`,
    );

    console.log("\n--- CORE WEB VITALS METRICS ---");
    console.log("Metric                     | Mobile     | Desktop");
    console.log("---------------------------|------------|------------");
    console.log(
      `First Contentful Paint     | ${mobileResults.metrics.fcp.padEnd(10)} | ${desktopResults.metrics.fcp.padEnd(10)}`,
    );
    console.log(
      `Largest Contentful Paint   | ${mobileResults.metrics.lcp.padEnd(10)} | ${desktopResults.metrics.lcp.padEnd(10)}`,
    );
    console.log(
      `Total Blocking Time        | ${mobileResults.metrics.tbt.padEnd(10)} | ${desktopResults.metrics.tbt.padEnd(10)}`,
    );
    console.log(
      `Cumulative Layout Shift    | ${mobileResults.metrics.cls.padEnd(10)} | ${desktopResults.metrics.cls.padEnd(10)}`,
    );
    console.log(
      `Speed Index                | ${mobileResults.metrics.speedIndex.padEnd(10)} | ${desktopResults.metrics.speedIndex.padEnd(10)}`,
    );
    console.log(
      `Time to Interactive        | ${mobileResults.metrics.interactive.padEnd(10)} | ${desktopResults.metrics.interactive.padEnd(10)}`,
    );
    console.log("======================================================\n");
    process.exit(0);
  } else {
    console.error("Failed to parse one or both Lighthouse reports.");
    process.exit(1);
  }
}, 3000);

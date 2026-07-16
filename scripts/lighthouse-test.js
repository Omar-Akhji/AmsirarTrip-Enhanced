import { spawn } from "child_process";
import path from "path";
import fs from "fs";

console.log("Starting production server on port 4322...");

// Start the server
process.env.PORT = "4322";
const server = spawn("node", ["./dist/server/entry.mjs"], { env: process.env, shell: true });

server.stdout.on("data", (data) => {
  console.log(`[Server]: ${data.toString().trim()}`);
});

server.stderr.on("data", (data) => {
  console.error(`[Server Error]: ${data.toString().trim()}`);
});

// Wait 3 seconds for server to start, then run Lighthouse
setTimeout(() => {
  console.log("Running Google Lighthouse audit...");

  const lighthouse = spawn(
    "npx",
    [
      "lighthouse",
      "http://localhost:4322",
      '--chrome-flags="--headless"',
      "--output=html",
      "--output-path=lighthouse-report.html",
    ],
    { shell: true, stdio: "inherit" },
  );

  lighthouse.on("close", (code) => {
    console.log("Shutting down server...");
    server.kill("SIGINT");

    const reportExists = fs.existsSync("lighthouse-report.html");
    if (reportExists) {
      console.log("Lighthouse report was successfully generated at lighthouse-report.html!");
      process.exit(0);
    } else {
      console.error("Lighthouse report generation failed.");
      process.exit(1);
    }
  });
}, 3000);

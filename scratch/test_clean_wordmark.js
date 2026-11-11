const fs = require("fs");
const sharp = require("sharp");

let svg = fs.readFileSync("public/icons/amsirar-wordmark.svg", "utf8");
const lines = svg.split(/\r?\n/);

// Fix lines 1-2
const rootSvgLine =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 200" width="100%" height="100%">';

// Filter out line 74 (orphan </g>) and replace lines 1-2
const fixedLines = [];
let skippedExtraG = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (i === 0) {
    fixedLines.push(rootSvgLine);
  } else if (i === 1 && line.includes("xsi:noNamespaceSchemaLocation")) {
    // skip line 2
    continue;
  } else if (
    i === lines.length - 2
    || (i >= lines.length - 4 && line.trim() === "</g>" && !skippedExtraG)
  ) {
    // Check if this is the extra </g>
    // Count remaining </g> and </svg>
    const rest = lines.slice(i).join("\n");
    if ((rest.match(/<\/g>/g) || []).length > 1) {
      skippedExtraG = true;
      continue;
    }
    fixedLines.push(line);
  } else {
    fixedLines.push(line);
  }
}

const cleanSvg = fixedLines.join("\n");
fs.writeFileSync("scratch/clean_wordmark.svg", cleanSvg);

sharp(Buffer.from(cleanSvg))
  .png()
  .toFile(
    "C:/Users/Omar AJ/.gemini/antigravity/brain/aaabd506-21b4-4fe7-898a-2d24f860cbe5/wordmark_cleaned.png",
  )
  .then((info) => console.log("Successfully rendered wordmark_cleaned.png:", info))
  .catch((err) => console.error("Sharp render err:", err));

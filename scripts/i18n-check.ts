import { readFileSync } from "node:fs";
import { Glob } from "bun";

const root = process.cwd();
const LOCALES = ["en", "fr", "de", "es"] as const;
type Locale = (typeof LOCALES)[number];

const dictionaries: Record<Locale, any> = {} as any;
for (const loc of LOCALES) {
  try {
    const raw = readFileSync(`${root}/src/locales/${loc}/common.json`, "utf8");
    dictionaries[loc] = JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to read/parse locale file for "${loc}":`, err);
    process.exit(1);
  }
}

// Flatten leaf keys
function getLeaves(obj: any, prefix = ""): Map<string, "string" | "array" | "other"> {
  const map = new Map<string, "string" | "array" | "other">();
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const nested = getLeaves(value, fullKey);
      for (const [k, v] of nested) map.set(k, v);
    } else if (Array.isArray(value)) {
      map.set(fullKey, "array");
    } else if (typeof value === "string") {
      map.set(fullKey, "string");
    } else {
      map.set(fullKey, "other");
    }
  }
  return map;
}

const enLeaves = getLeaves(dictionaries.en);
let hasError = false;

console.log(`[i18n-check] Verifying parity against EN (${enLeaves.size} keys)...`);

for (const loc of LOCALES) {
  if (loc === "en") continue;
  const targetLeaves = getLeaves(dictionaries[loc]);

  const missing = [...enLeaves.keys()].filter((k) => !targetLeaves.has(k));
  const extra = [...targetLeaves.keys()].filter((k) => !enLeaves.has(k));

  if (missing.length > 0) {
    hasError = true;
    console.error(`\n❌ [${loc}] Missing ${missing.length} keys present in EN:`);
    for (const m of missing.slice(0, 20)) console.error(`  - ${m}`);
    if (missing.length > 20) console.error(`  ... and ${missing.length - 20} more`);
  }

  if (extra.length > 0) {
    hasError = true;
    console.error(`\n⚠️  [${loc}] Has ${extra.length} extra keys not present in EN:`);
    for (const e of extra) console.error(`  + ${e}`);
  }

  // Type mismatch check
  for (const [k, type] of enLeaves) {
    if (targetLeaves.has(k) && targetLeaves.get(k) !== type) {
      hasError = true;
      console.error(`\n❌ [${loc}] Type mismatch on key "${k}": expected ${type}, got ${targetLeaves.get(k)}`);
    }
  }
}

// 2. Scan code for static t() and t.raw() key usage
console.log(`[i18n-check] Scanning codebase for translation key usage...`);
const usedKeys = new Map<string, string>(); // key -> file

const codeGlob = new Glob("src/**/*.{astro,vue,ts}");
for (const file of codeGlob.scanSync(root)) {
  const normFile = file.replaceAll("\\", "/");
  if (normFile.startsWith("src/i18n/") || normFile.startsWith("src/locales/")) continue;

  const content = readFileSync(`${root}/${file}`, "utf8");

  // Matches t("key") or t('key') or t.raw("key") or t.raw('key')
  const matches = content.matchAll(/\bt(?:\.raw)?\(\s*["']([a-zA-Z0-9_.]+)["']/g);
  for (const m of matches) {
    const key = m[1];
    if (!usedKeys.has(key)) {
      usedKeys.set(key, normFile);
    }
  }
}

console.log(`[i18n-check] Found ${usedKeys.size} distinct static translation keys in code.`);

const missingInEn: { key: string; file: string }[] = [];

for (const [key, file] of usedKeys) {
  // Allow validations.* shorthand if looked up via helper in schemas.ts
  const isPresent = enLeaves.has(key) || (file.includes("schemas.ts") && enLeaves.has(`validations.${key}`));
  if (!isPresent) {
    missingInEn.push({ key, file });
  }
}

if (missingInEn.length > 0) {
  hasError = true;
  console.error(`\n❌ Found ${missingInEn.length} translation keys used in code but missing from EN dictionary:`);
  for (const { key, file } of missingInEn) {
    console.error(`  • ${key} (in ${file})`);
  }
}

if (hasError) {
  console.error("\n❌ [i18n-check] FAILED. Please fix missing or extra keys.");
  process.exit(1);
} else {
  console.log("\n✅ [i18n-check] All keys in sync and verified.");
}

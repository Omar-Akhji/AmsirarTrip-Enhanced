import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const LOCALES = ["en", "fr", "de", "es"] as const;
type Locale = (typeof LOCALES)[number];

type JsonObject = Record<string, unknown>;
type LeafType = "string" | "array" | "other";

const PLURAL_SUFFIX_RE = /^(.*?)_(?:zero|one|two|few|many|other)$/;

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readLocaleFile(loc: Locale): JsonObject | null {
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- locale is a fixed tuple literal
    const raw = readFileSync(path.join(root, "src", "locales", loc, "common.json"), "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (!isJsonObject(parsed)) {
      console.error(`Locale file for "${loc}" must contain a JSON object.`);
      return null;
    }
    return parsed;
  } catch (error) {
    console.error(`Failed to read/parse locale file for "${loc}":`, error);
    return null;
  }
}

function getLeaves(obj: JsonObject, prefix = ""): Map<string, LeafType> {
  const map = new Map<string, LeafType>();
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (isJsonObject(value)) {
      for (const [nestedKey, nestedType] of getLeaves(value, fullKey)) {
        map.set(nestedKey, nestedType);
      }
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

function getPluralBaseKeys(leaves: ReadonlyMap<string, LeafType>): Set<string> {
  const bases = new Set<string>();
  for (const key of leaves.keys()) {
    const match = PLURAL_SUFFIX_RE.exec(key);
    if (match?.[1] && leaves.has(`${match[1]}_other`)) {
      bases.add(match[1]);
    }
  }
  return bases;
}

function scanFiles(dir: string): string[] {
  const results: string[] = [];
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- bounded traversal within src/
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- bounded traversal within src/
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...scanFiles(fullPath));
    } else if (/\.(?:astro|vue|ts)$/.test(entry)) {
      results.push(fullPath);
    }
  }
  return results;
}

function main(): void {
  const loaded = new Map<Locale, JsonObject>();

  for (const loc of LOCALES) {
    const data = readLocaleFile(loc);
    if (!data) {
      process.exitCode = 1;
      return;
    }
    loaded.set(loc, data);
  }

  const enDict = loaded.get("en");
  if (!enDict) {
    process.exitCode = 1;
    return;
  }

  const enLeaves = getLeaves(enDict);
  const enPluralBases = getPluralBaseKeys(enLeaves);
  let hasError = false;

  console.log(
    `[i18n-check] Verifying parity against EN (${enLeaves.size} keys, ${enPluralBases.size} plural families)...`,
  );

  for (const loc of LOCALES) {
    if (loc === "en") continue;
    const dict = loaded.get(loc);
    if (!dict) continue;
    const targetLeaves = getLeaves(dict);
    const requiredPluralCategories = new Intl.PluralRules(loc).resolvedOptions().pluralCategories;

    const missing: string[] = [];
    for (const k of enLeaves.keys()) {
      const pluralMatch = PLURAL_SUFFIX_RE.exec(k);
      if (pluralMatch?.[1] && enPluralBases.has(pluralMatch[1])) {
        continue;
      }
      if (!targetLeaves.has(k)) {
        missing.push(k);
      }
    }

    for (const base of enPluralBases) {
      for (const cat of requiredPluralCategories) {
        const pluralKey = `${base}_${cat}`;
        if (!targetLeaves.has(pluralKey)) {
          missing.push(pluralKey);
        }
      }
    }

    const extra: string[] = [];
    for (const k of targetLeaves.keys()) {
      if (enLeaves.has(k)) continue;
      const pluralMatch = PLURAL_SUFFIX_RE.exec(k);
      if (pluralMatch?.[1] && enPluralBases.has(pluralMatch[1])) continue;
      extra.push(k);
    }

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

    for (const [k, type] of enLeaves) {
      if (!targetLeaves.has(k) || targetLeaves.get(k) === type) continue;
      hasError = true;
      console.error(
        `\n❌ [${loc}] Type mismatch on key "${k}": expected ${type}, got ${targetLeaves.get(k)}`,
      );
    }
  }

  console.log("[i18n-check] Scanning codebase for translation key usage...");
  const usedKeys = new Map<string, string>();
  const codeFiles = scanFiles(path.join(root, "src"));

  for (const fullPath of codeFiles) {
    const normFile = fullPath.replaceAll("\\", "/");
    if (normFile.includes("/src/i18n/") || normFile.includes("/src/locales/")) continue;

    // eslint-disable-next-line security/detect-non-literal-fs-filename -- bounded traversal within src/
    const content = readFileSync(fullPath, "utf8");
    for (const match of content.matchAll(/\bt(?:\.raw)?\(\s*["']([\w.]+)["']/g)) {
      const key = match[1];
      if (key && !usedKeys.has(key)) {
        usedKeys.set(key, normFile);
      }
    }
  }

  console.log(`[i18n-check] Found ${usedKeys.size} distinct static translation keys in code.`);

  const missingInEn: { file: string; key: string }[] = [];
  for (const [key, file] of usedKeys) {
    if (!enLeaves.has(key) && !enPluralBases.has(key)) {
      missingInEn.push({ key, file });
    }
  }

  if (missingInEn.length > 0) {
    hasError = true;
    console.error(
      `\n❌ Found ${missingInEn.length} translation keys used in code but missing from EN dictionary:`,
    );
    for (const { key, file } of missingInEn) {
      console.error(`  • ${key} (in ${file})`);
    }
  }

  if (hasError) {
    process.exitCode = 1;
    console.error("\n[i18n-check] Failed.");
  } else {
    console.log("\n✅ [i18n-check] All locale dictionaries and code key references are in sync.");
  }
}

main();

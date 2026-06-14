import type { PluginConfig } from "@ianvs/prettier-plugin-sort-imports";
import type { Config } from "prettier";
import type { PluginOptions } from "prettier-plugin-tailwindcss";

const config: Config & PluginOptions & PluginConfig = {
  // ─── Core formatting ──────────────────────────────────────────────────────
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: false,
  jsxSingleQuote: false,
  quoteProps: "as-needed",
  trailingComma: "all",
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: "always",
  endOfLine: "lf",

  // ─── HTML / Markup ────────────────────────────────────────────────────────
  // Respect CSS display rules for whitespace (correct for Tailwind projects)
  htmlWhitespaceSensitivity: "css",
  // One attribute per line for readability in JSX/HTML
  singleAttributePerLine: true,
  // Always wrap prose in markdown
  proseWrap: "always",
  // Format embedded code blocks (e.g. ```ts in markdown)
  embeddedLanguageFormatting: "auto",

  // ─── Experimental (Prettier 3.x) ──────────────────────────────────────────
  // Cleaner ternary formatting: condition
  //   ? consequent
  //   : alternate
  experimentalTernaries: true,
  // Collapse object wrapping — keeps short objects on one line
  objectWrap: "collapse",
  // Operators go at the start of new lines (aligns with math conventions)
  experimentalOperatorPosition: "start",

  // ─── Plugins ──────────────────────────────────────────────────────────────
  // ORDER IS CRITICAL:
  // 1. prettier-plugin-packagejson   — sorts package.json keys
  // 2. @ianvs/prettier-plugin-sort-imports — sorts import statements
  // 3. prettier-plugin-astro         — must come before tailwindcss
  // 4. prettier-plugin-tailwindcss   — MUST always be last
  plugins: [
    "prettier-plugin-packagejson",
    "@ianvs/prettier-plugin-sort-imports",
    "prettier-plugin-astro",
    "prettier-plugin-tailwindcss",
  ],

  // ─── Import sorting (@ianvs/prettier-plugin-sort-imports) ─────────────────
  importOrder: [
    // React core first
    "^(react/(.*)$)|^(react$)",
    "<THIRD_PARTY_MODULES>",
    // Astro/framework internals
    "^(astro/(.*)$)|^(astro$)",
    // Path aliases
    "^@/(.*)$",
    "^@components/(.*)$",
    "^@layouts/(.*)$",
    "^@assets/(.*)$",
    "^@utils/(.*)$",
    // Relative imports
    "^[./]",
    // CSS always last
    String.raw`^.+\.css$`,
  ],
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
  // Match your TypeScript version
  importOrderTypeScriptVersion: "6.0.0",
  // Case-insensitive sorting
  importOrderCaseSensitive: false,

  // ─── Tailwind CSS v4 ──────────────────────────────────────────────────────
  // Required for Tailwind v4 — point to your CSS entry point
  tailwindStylesheet: "./src/styles/global.css",
  // Custom functions that accept Tailwind classes (cn, cva, clsx, twMerge)
  tailwindFunctions: ["cn", "cva", "clsx", "twMerge"],

  // ─── File overrides ───────────────────────────────────────────────────────
  overrides: [
    {
      // Astro parser for .astro files
      files: "*.astro",
      options: { parser: "astro" },
    },
    {
      // Tighter width for JSON
      files: ["*.json", "*.jsonc"],
      options: { printWidth: 80 },
    },
    {
      // Markdown — preserve intentional line breaks
      files: ["*.md", "*.mdx"],
      options: { proseWrap: "always" },
    },
  ],
};

export default config;

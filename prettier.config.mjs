// prettier.config.mjs

/**
 * @type {import("prettier").Config
 *   & import("prettier-plugin-tailwindcss").PluginOptions
 *   & import("@ianvs/prettier-plugin-sort-imports").PluginConfig}
 */
const config = {
  // ─── 1. Core Formatting ───────────────────────────────────────────────────
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
  vueIndentScriptAndStyle: false,

  // ─── 2. HTML / Markup (Astro & Vue) ───────────────────────────────────────
  htmlWhitespaceSensitivity: "css",
  singleAttributePerLine: true,
  proseWrap: "always",
  embeddedLanguageFormatting: "auto",

  // ─── 3. Modern Prettier 3.x Features ──────────────────────────────────────
  experimentalTernaries: true,
  objectWrap: "collapse",
  experimentalOperatorPosition: "start",

  // ─── 4. Plugins (Order is strictly enforced) ──────────────────────────────
  // 1. packagejson   — sorts package.json keys
  // 2. sort-imports  — unifies import order across TS, Vue, and Astro
  // 3. jsdoc         — formats JSDoc comments cleanly
  // 4. astro         — parses .astro templates (must precede tailwindcss)
  // 5. tailwindcss   — MUST BE ABSOLUTE LAST to wrap all previous AST parsers
  plugins: [
    "prettier-plugin-packagejson",
    "@ianvs/prettier-plugin-sort-imports",
    "prettier-plugin-jsdoc",
    "prettier-plugin-astro",
    "prettier-plugin-tailwindcss",
  ],

  // ─── 5. Import Sorting (@ianvs/prettier-plugin-sort-imports) ──────────────
  importOrder: [
    // 1. Node.js built-in modules (enforced as node:* by Unicorn in ESLint)
    "<BUILTIN_MODULES>",
    // 2. Astro & Vue framework core
    "^(astro:(.*))$|^(astro/(.*))$|^(astro$)",
    "^(vue/(.*))$|^(vue$)",
    // 3. External npm packages
    "<THIRD_PARTY_MODULES>",
    // 4. Internal path alias (@/* defined in tsconfig.json)
    "^@/(.*)$",
    // 5. Relative imports
    "^[./]",
    // 6. Stylesheets always last
    String.raw`^.+\.(css|scss|postcss)$`,
  ],
  importOrderParserPlugins: ["typescript", "jsx"],
  importOrderTypeScriptVersion: "6.0.0",
  importOrderCaseSensitive: false,

  // ─── 6. Tailwind CSS v4 Integration ───────────────────────────────────────
  tailwindStylesheet: "./src/styles/global.css",
  tailwindFunctions: ["cn", "cva", "clsx", "twMerge"],
  tailwindAttributes: ["class:list"],

  // ─── 7. File-Specific Overrides ───────────────────────────────────────────
  overrides: [
    { files: "*.astro", options: { parser: "astro" } },
    { files: "*.vue", options: { parser: "vue" } },
    { files: ["*.json", "*.jsonc"], options: { printWidth: 80 } },
    { files: ["*.md", "*.mdx"], options: { proseWrap: "always" } },
  ],
};

export default config;

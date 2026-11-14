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

  // ─── 3. Modern Prettier 3.x+ Features ─────────────────────────────────────
  experimentalTernaries: true,
  objectWrap: "collapse",
  experimentalOperatorPosition: "start",

  // ─── 4. Plugins (Strict Execution Order) ──────────────────────────────────
  plugins: [
    "prettier-plugin-packagejson",
    "@ianvs/prettier-plugin-sort-imports",
    "prettier-plugin-jsdoc",
    "prettier-plugin-astro",
    "prettier-plugin-tailwindcss", // MUST ALWAYS BE LAST
  ],

  // ─── 5. Import Sorting (@ianvs/prettier-plugin-sort-imports) ──────────────
  importOrder: [
    "<BUILTIN_MODULES>",
    "^(astro:(.*))$|^(astro/(.*))$|^(astro$)",
    "^(vue/(.*))$|^(vue$)",
    "<THIRD_PARTY_MODULES>",
    "^@/(.*)$",
    "^[./]",
    String.raw`^.+\.(css|scss|postcss)$`,
  ],
  importOrderParserPlugins: ["typescript", "jsx"],
  importOrderTypeScriptVersion: "6.0.0",
  importOrderCaseSensitive: false,

  // ─── 6. Tailwind CSS v4 Integration ───────────────────────────────────────
  tailwindStylesheet: "./src/styles/global.css",
  tailwindFunctions: ["cn", "cva", "clsx", "twMerge"],
  tailwindAttributes: ["class:list", "enter-active-class", "leave-active-class"],

  // ─── 7. File-Specific Overrides ───────────────────────────────────────────
  overrides: [
    { files: "*.astro", options: { parser: "astro" } },
    { files: "*.vue", options: { parser: "vue" } },
    { files: ["*.json", "*.jsonc"], options: { printWidth: 80 } },
    {
      files: [".vscode/*.json", ".vscode/*.code-snippets"],
      options: { parser: "jsonc", printWidth: 80 },
    },
    { files: ["*.md", "*.mdx"], options: { proseWrap: "always" } },
  ],
};

export default config;

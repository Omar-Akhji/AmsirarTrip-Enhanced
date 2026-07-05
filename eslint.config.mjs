import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import eslintPluginAstro from "eslint-plugin-astro";
import nounsanitized from "eslint-plugin-no-unsanitized";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import eslintPluginVue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";
import securityPlugin from "eslint-plugin-security";
import unicorn from "eslint-plugin-unicorn";
import { defineConfig } from "eslint/config";
import globals from "globals";

const eslintConfig = defineConfig(
  // ─── Recommended configs (flat variants required for ESLint 10) ──────────
  ...tsPlugin.configs["flat/recommended"],
  ...eslintPluginAstro.configs["flat/recommended"],
  ...eslintPluginAstro.configs["flat/jsx-a11y-recommended"],

  // ─── Unicorn ──────────────────────────────────────────────────────────────
  unicorn.configs.recommended,

  // ─── Security ─────────────────────────────────────────────────────────────
  securityPlugin.configs.recommended,
  nounsanitized.configs.recommended,

  // ─── Unicorn overrides ────────────────────────────────────────────────────
  {
    rules: {
      "unicorn/filename-case": "off",
      "unicorn/name-replacements": "off",
      "unicorn/no-null": "off",
      "unicorn/no-array-reduce": "off",
      "unicorn/prefer-math-trunc": "off",
      "unicorn/prefer-string-slice": "off",
      "unicorn/prefer-top-level-await": "off",
      "unicorn/no-empty-file": "off",
      "unicorn/prefer-logical-operator-over-ternary": "off",
      "unicorn/text-encoding-identifier-case": "off",
      "unicorn/consistent-boolean-name": "off",
      "unicorn/no-top-level-side-effects": "off",
      "unicorn/no-unnecessary-global-this": "off",
      "unicorn/prefer-ternary": "off",
      "unicorn/no-computed-property-existence-check": "off",
      "unicorn/no-top-level-assignment-in-function": "off",
      "unicorn/prefer-at": "off",
    },
  },

  // ─── TypeScript ───────────────────────────────────────────────────────────
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { project: true, tsconfigRootDir: import.meta.dirname },
    },
    plugins: { "@typescript-eslint": tsPlugin },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/array-type": ["error", { default: "array" }],
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/return-await": ["error", "in-try-catch"],
      "@typescript-eslint/prefer-promise-reject-errors": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "@typescript-eslint/no-unsafe-call": "warn",
      "@typescript-eslint/no-unsafe-member-access": "warn",
      "@typescript-eslint/no-unsafe-return": "warn",
      "@typescript-eslint/no-unsafe-argument": "warn",
    },
  },

  // ─── Vue Flat Config ──────────────────────────────────────────────────────
  ...eslintPluginVue.configs["flat/recommended"],
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: { parser: tsParser, extraFileExtensions: [".vue"] },
    },
    rules: {
      "vue/multi-word-component-names": "off", // Disable multi-word constraints for pages/blocks
      "vue/no-v-html": "warn",
      "vue/require-default-prop": "off",
    },
  },

  // ─── General quality ──────────────────────────────────────────────────────
  {
    languageOptions: { globals: { ...globals.browser, ...globals.es2024 } },
    rules: {
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      "prefer-const": "error",
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-nested-ternary": "off",
      "no-implicit-coercion": "error",
      "no-return-assign": "error",
      "no-throw-literal": "error",
      "no-unused-expressions": ["error", { allowShortCircuit: true, allowTernary: true }],
      "no-void": ["error", { allowAsStatement: true }],
    },
  },

  // ─── Security tuning ──────────────────────────────────────────────────────
  {
    rules: {
      "security/detect-object-injection": "off",
      "security/detect-non-literal-regexp": "warn",
      "no-unsanitized/method": "error",
      "no-unsanitized/property": "error",
    },
  },

  // ─── Astro overrides ──────────────────────────────────────────────────────
  {
    files: ["**/*.astro"],
    rules: {
      // Astro requires the interface to be named "Props" for type inference
      "unicorn/name-replacements": ["error", { allowList: { Props: true } }],
      // All Astro-specific non-recommended rules
      "astro/no-set-html-directive": "error",
      "astro/no-unsafe-inline-scripts": ["error", { allowModuleScripts: true }],
      "astro/no-exports-from-components": "error",
      "astro/no-prerender-export-outside-pages": "error",
      "astro/no-set-text-directive": "warn",
      "astro/no-unused-css-selector": "warn",
      "astro/prefer-class-list-directive": "warn",
      "astro/prefer-object-class-list": "warn",
      "astro/prefer-split-class-list": "warn",
      "astro/sort-attributes": ["warn", { type: "alphabetical", ignoreCase: true }],
    },
  },
  // ─── JsonLd component — safe set:html for pre-sanitized JSON-LD ─────────
  {
    files: ["src/shared/ui/JsonLd.astro"],
    rules: {
      "astro/no-set-html-directive": "off",
      // False positives in Astro frontmatter
      "unicorn/prefer-module": "off",
      "unicorn/no-await-expression-member": "off",
      "unicorn/prefer-top-level-await": "off",
      "no-unsanitized/method": "off",
      "security/detect-object-injection": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  // ─── Server actions / API routes ──────────────────────────────────────────
  {
    files: ["src/actions/**/*.ts", "src/pages/api/**/*.ts"],
    rules: {
      "no-unsanitized/method": "off",
      "unicorn/no-await-expression-member": "off",
      "security/detect-object-injection": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  // ─── Prettier — MUST be last ──────────────────────────────────────────────
  prettierRecommended,

  // ─── Global ignores ───────────────────────────────────────────────────────
  {
    ignores: [
      "dist/**",
      ".astro/**",
      "node_modules/**",
      "public/**",
      ".gemini/**",
      ".kiro/**",
      ".agent/**",
      ".agents/**",
      "*.md",
      "*.json",
      "*.lock",
      "tsconfig.tsbuildinfo",
    ],
  },
);

export default eslintConfig;

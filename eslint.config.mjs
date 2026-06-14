import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import astroParser from "astro-eslint-parser";
import eslintPluginAstro from "eslint-plugin-astro";
import nounsanitized from "eslint-plugin-no-unsanitized";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import reactDoctor from "eslint-plugin-react-doctor";
import reactHooksPlugin from "eslint-plugin-react-hooks";
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
      "unicorn/prevent-abbreviations": "off",
      "unicorn/no-null": "off",
      "unicorn/no-array-reduce": "off",
      "unicorn/prefer-math-trunc": "off",
      "unicorn/prefer-string-slice": "off",
      "unicorn/prefer-top-level-await": "off",
      "unicorn/no-empty-file": "off",
      "unicorn/prefer-logical-operator-over-ternary": "off",
      "unicorn/text-encoding-identifier-case": "off",
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
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
      "@typescript-eslint/array-type": ["error", { default: "array" }],
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/return-await": ["error", "in-try-catch"],
      "@typescript-eslint/prefer-promise-reject-errors": "error",
      // Pragmatic — any is sometimes unavoidable in Astro/React projects
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
    },
  },

  // ─── React Hooks ──────────────────────────────────────────────────────────
  {
    files: ["**/*.tsx", "**/*.jsx"],
    plugins: { "react-hooks": reactHooksPlugin },
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Hooks (recommended-latest includes React Compiler diagnostics)
      ...reactHooksPlugin.configs.flat["recommended-latest"].rules,
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "off",
    },
  },

  // ─── React Doctor — structural React quality rules (React files only) ─────
  { files: ["**/*.tsx", "**/*.jsx"], ...reactDoctor.configs.recommended },

  // ─── React Doctor overrides ───────────────────────────────────────────────
  {
    files: ["**/*.tsx", "**/*.jsx"],
    rules: { "react-doctor/no-noninteractive-element-interactions": "off" },
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
      "security/detect-eval-with-expression": "error",
      "security/detect-unsafe-regex": "error",
      "security/detect-buffer-noassert": "error",
      "security/detect-child-process": "error",
      "security/detect-no-csrf-before-method-override": "error",
      "security/detect-pseudoRandomBytes": "error",
      "security/detect-object-injection": "off",
      "security/detect-non-literal-regexp": "warn",
      "no-unsanitized/method": "error",
      "no-unsanitized/property": "error",
    },
  },

  // ─── Astro overrides ──────────────────────────────────────────────────────
  {
    files: ["**/*.astro"],
    languageOptions: {
      parser: astroParser,
      parserOptions: { parser: tsParser, extraFileExtensions: [".astro"] },
    },
    rules: {
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

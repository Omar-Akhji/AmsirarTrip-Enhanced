import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import eslintPluginAstro from "eslint-plugin-astro";
import nounsanitized from "eslint-plugin-no-unsanitized";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import eslintPluginVue from "eslint-plugin-vue";
import pluginVueA11y from "eslint-plugin-vuejs-accessibility";
import vueParser from "vue-eslint-parser";
import securityPlugin from "eslint-plugin-security";
import unicorn from "eslint-plugin-unicorn";
import { defineConfig } from "eslint/config";
import globals from "globals";

const eslintConfig = defineConfig(
  // ─── Base Presets (Modern Flat Config) ───────────────────────────────────
  ...tsPlugin.configs["flat/strict"],
  ...tsPlugin.configs["flat/stylistic"],
  ...eslintPluginAstro.configs["flat/recommended"],
  ...eslintPluginAstro.configs["flat/jsx-a11y-strict"],
  ...eslintPluginVue.configs["flat/recommended"],
  ...pluginVueA11y.configs["flat/recommended"],
  unicorn.configs.recommended,
  securityPlugin.configs.recommended,
  nounsanitized.configs.recommended,

  // ─── Unicorn Strict Tuning ───────────────────────────────────────────────
  {
    rules: {
      "unicorn/filename-case": [
        "error",
        {
          cases: { kebabCase: true, pascalCase: true },
          ignore: [String.raw`^\\[.*\\]`, String.raw`^\[.*\]`],
        },
      ],
      "unicorn/prefer-at": "error",
      "unicorn/prefer-early-return": "error",
      "unicorn/prefer-string-slice": "error",
      "unicorn/prefer-math-trunc": "error",
      "unicorn/prefer-logical-operator-over-ternary": "error",
      "unicorn/no-empty-file": "error",
      "unicorn/prefer-ternary": "error",
      "unicorn/text-encoding-identifier-case": "error",
      "unicorn/prefer-node-protocol": "error",
      "unicorn/prefer-modern-dom-apis": "error",
      "unicorn/prefer-modern-math-apis": "error",
      "unicorn/prefer-array-find": "error",
      "unicorn/prefer-array-flat-map": "error",
      "unicorn/prefer-includes": "error",
      "unicorn/prefer-date-now": "error",
      "unicorn/no-useless-spread": "error",
      "unicorn/no-useless-undefined": "error",
      "unicorn/prefer-string-starts-ends-with": "error",
      "unicorn/prefer-regexp-test": "error",

      // Framework & ecosystem accommodations for Vue/Astro/DOM
      "unicorn/name-replacements": "off",
      "unicorn/prevent-abbreviations": "off",
      "unicorn/no-null": "off",
      "unicorn/no-array-reduce": "off",
      "unicorn/consistent-boolean-name": "off",
      "unicorn/no-top-level-side-effects": "off",
      "unicorn/no-top-level-assignment-in-function": "off",
      "unicorn/single-line-block-comment-style": "off",
      "unicorn/no-unnecessary-global-this": "off",
      "unicorn/no-computed-property-existence-check": "off",
      "unicorn/no-nested-ternary": "off",
    },
  },

  // ─── TypeScript Strict Type-Checked Standard ─────────────────────────────
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { project: true, tsconfigRootDir: import.meta.dirname },
    },
    plugins: { "@typescript-eslint": tsPlugin },
    rules: {
      ...tsPlugin.configs["flat/strict-type-checked-only"][0].rules,
      ...tsPlugin.configs["flat/stylistic-type-checked-only"][0].rules,

      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/array-type": ["error", { default: "array" }],
      "@typescript-eslint/return-await": ["error", "in-try-catch"],
      "@typescript-eslint/prefer-promise-reject-errors": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/no-unnecessary-condition": "error",
      "@typescript-eslint/prefer-find": "error",
      "@typescript-eslint/prefer-includes": "error",
      "@typescript-eslint/prefer-string-starts-ends-with": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "@typescript-eslint/method-signature-style": ["error", "property"],
      "@typescript-eslint/no-meaningless-void-operator": "error",
      "@typescript-eslint/no-unnecessary-type-arguments": "error",
      "@typescript-eslint/prefer-readonly": "error",
      "@typescript-eslint/no-inferrable-types": "error",
      "@typescript-eslint/prefer-function-type": "error",
      "@typescript-eslint/unified-signatures": "error",
      "@typescript-eslint/consistent-type-definitions": "off",
    },
  },

  // ─── Vue Flat Config & Strict Rules ──────────────────────────────────────
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: { parser: tsParser, extraFileExtensions: [".vue"] },
    },
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/require-default-prop": "off",
      "vue/no-v-html": "error",
      "vue/component-api-style": ["error", ["script-setup"]],
      "vue/block-order": ["error", { order: ["script", "template", "style"] }],
      "vue/custom-event-name-casing": ["error", "camelCase"],
      "vue/define-macros-order": [
        "error",
        { order: ["defineOptions", "defineProps", "defineEmits", "defineSlots"] },
      ],
      "vue/no-empty-component-block": "error",
      "vue/no-multiple-objects-in-class": "error",
      "vue/no-root-v-if": "error",
      "vue/no-useless-mustaches": "error",
      "vue/no-useless-v-bind": "error",
      "vue/prefer-define-options": "error",
      "vue/prefer-true-attribute-shorthand": "error",
      "vue/prefer-separate-static-class": "error",
      "vue/no-ref-as-operand": "error",
      "vue/no-duplicate-attr-inheritance": "error",
      "vue/no-required-prop-with-default": "error",

      // ─── Vue Accessibility Strict Rules ──────────────────────────────────
      "vuejs-accessibility/label-has-for": [
        "error",
        { required: { some: ["nesting", "id"] }, allowChildren: false },
      ],
    },
  },

  // ─── General JavaScript Strict Standards ─────────────────────────────────
  {
    languageOptions: { globals: { ...globals.browser, ...globals.es2024 } },
    rules: {
      "no-console": ["error", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-implicit-coercion": "error",
      "no-return-assign": "error",
      "no-unused-expressions": ["error", { allowShortCircuit: true, allowTernary: true }],
      "no-void": ["error", { allowAsStatement: true }],
      "prefer-template": "error",
      "prefer-arrow-callback": "error",
      "prefer-rest-params": "error",
      "prefer-spread": "error",
      "object-shorthand": ["error", "always"],
      "no-eval": "error",
      "no-lone-blocks": "error",
      "no-lonely-if": "error",
      "no-multi-assign": "error",
      "no-self-compare": "error",
      "no-sequences": "error",
      "no-unneeded-ternary": "error",
      "no-useless-concat": "error",
      "no-useless-return": "error",
      "no-useless-rename": "error",
      radix: "error",
      yoda: "error",
      "default-case-last": "error",
      "no-else-return": ["error", { allowElseIf: false }],
    },
  },

  // ─── Security & Sanitization Strict Standards ────────────────────────────
  {
    rules: {
      "security/detect-object-injection": "off",
      "security/detect-non-literal-regexp": "error",
      "security/detect-unsafe-regex": "error",
      "security/detect-buffer-noassert": "error",
      "security/detect-child-process": "error",
      "security/detect-disable-mustache-escape": "error",
      "security/detect-eval-with-expression": "error",
      "security/detect-no-csrf-before-method-override": "error",
      "security/detect-possible-timing-attacks": "error",
      "security/detect-pseudoRandomBytes": "error",
      "no-unsanitized/method": "error",
      "no-unsanitized/property": "error",
    },
  },

  // ─── Astro Strict Standards ──────────────────────────────────────────────
  {
    files: ["**/*.astro"],
    rules: {
      "unicorn/name-replacements": "off",
      "astro/no-set-html-directive": "error",
      "astro/no-unsafe-inline-scripts": ["error", { allowModuleScripts: true }],
      "astro/no-exports-from-components": "error",
      "astro/no-prerender-export-outside-pages": "error",
      "astro/no-set-text-directive": "error",
      "astro/no-unused-css-selector": "error",
      "astro/prefer-class-list-directive": "error",
      "astro/prefer-object-class-list": "error",
      "astro/prefer-split-class-list": "error",
      "astro/missing-client-only-directive-value": "error",
      "astro/no-conflict-set-directives": "error",
      "astro/no-unused-define-vars-in-style": "error",
      "astro/valid-compile": "error",
      "astro/no-deprecated-astro-canonicalurl": "error",
      "astro/no-deprecated-astro-fetchcontent": "error",
      "astro/no-deprecated-astro-resolve": "error",
      "astro/no-deprecated-getentrybyslug": "error",
    },
  },

  // ─── JsonLd component — safe set:html for pre-sanitized JSON-LD ─────────
  {
    files: ["src/shared/ui/JsonLd.astro"],
    rules: {
      "astro/no-set-html-directive": "off",
      "unicorn/prefer-module": "off",
      "unicorn/no-await-expression-member": "off",
      "unicorn/prefer-top-level-await": "off",
      "no-unsanitized/method": "off",
      "security/detect-object-injection": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  // ─── Logger Service & CLI Scripts — Allows Central Log & Console Dispatches ────
  { files: ["src/services/logger.ts", "scripts/**/*.ts"], rules: { "no-console": "off" } },

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

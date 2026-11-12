// eslint.config.mjs
import { defineConfig } from "eslint/config";
import eslintPluginAstro from "eslint-plugin-astro";
import nounsanitized from "eslint-plugin-no-unsanitized";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import securityPlugin from "eslint-plugin-security";
import unicorn from "eslint-plugin-unicorn";
import eslintPluginVue from "eslint-plugin-vue";
import pluginVueA11y from "eslint-plugin-vuejs-accessibility";
import globals from "globals";
import tseslint from "typescript-eslint";
import vueParser from "vue-eslint-parser";

export default defineConfig(
  // ─── 1. Global Ignores (Must be first) ────────────────────────────────────
  {
    ignores: [
      "dist/**",
      ".astro/**",
      "node_modules/**",
      "public/**",
      "scratch/**",
      "src/i18n/client-data.ts",
      ".gemini/**",
      ".kiro/**",
      ".agent/**",
      ".agents/**",
      ".claude/**",
      ".github/**",
      "*.md",
      "*.json",
      "*.lock",
      "tsconfig.tsbuildinfo",
    ],
  },

  // ─── 2. Ecosystem Flat Presets ────────────────────────────────────────────
  ...eslintPluginAstro.configs["flat/recommended"],
  ...eslintPluginAstro.configs["flat/jsx-a11y-strict"],
  ...eslintPluginVue.configs["flat/recommended"],
  ...pluginVueA11y.configs["flat/recommended"],
  unicorn.configs.recommended,
  securityPlugin.configs.recommended,
  nounsanitized.configs.recommended,

  // ─── 3. Linter Options ────────────────────────────────────────────────────
  { linterOptions: { reportUnusedDisableDirectives: "error" } },

  // ─── 4. TypeScript Strict Type-Checked Standard (TS, TSX & Vue) ───────────
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.vue"],
    ignores: ["**/*.astro/**"],
    extends: [...tseslint.configs.strictTypeChecked, ...tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        extraFileExtensions: [".vue"],
        projectService: {
          allowDefaultProject: ["*.config.ts", "*.config.js"],
          defaultProject: "tsconfig.json",
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/consistent-type-exports": [
        "error",
        { fixMixedExportsWithInlineTypeSpecifier: true },
      ],
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
      "@typescript-eslint/return-await": ["error", "in-try-catch"],
      "@typescript-eslint/promise-function-async": "error",
      "@typescript-eslint/switch-exhaustiveness-check": [
        "error",
        { allowDefaultCaseForExhaustiveSwitch: false, requireDefaultForNonUnion: true },
      ],
      "@typescript-eslint/method-signature-style": ["error", "property"],
      "@typescript-eslint/prefer-readonly": "error",
      "@typescript-eslint/no-useless-empty-export": "error",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        { assertionStyle: "as", objectLiteralTypeAssertions: "never" },
      ],
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        { allowNumber: true, allowBoolean: true },
      ],
      "@typescript-eslint/no-confusing-void-expression": [
        "error",
        { ignoreArrowShorthand: true, ignoreVoidOperator: true },
      ],
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector: "TSEnumDeclaration",
          message:
            "Do not use TypeScript enums. Use `as const` objects or union literal types instead.",
        },
      ],
    },
  },

  // ─── 5. Disable Type-Checked Linting on Astro Templates & MJS Configs ─────
  {
    files: ["**/*.astro", "**/*.astro/*.js", "**/*.astro/*.ts", "*.config.mjs"],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: { parserOptions: { projectService: false } },
  },

  // ─── 6. Vue Flat Config & Strict Rules ────────────────────────────────────
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: { parser: tseslint.parser, extraFileExtensions: [".vue"] },
    },
    rules: {
      "@typescript-eslint/explicit-module-boundary-types": "off",
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
      "vuejs-accessibility/label-has-for": [
        "error",
        { required: { some: ["nesting", "id"] }, allowChildren: false },
      ],
    },
  },

  // ─── 7. General JavaScript Strict Standards ───────────────────────────────
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node, ...globals.es2024 } },
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

  // ─── 8. Unicorn Strict Tuning ─────────────────────────────────────────────
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

      // Framework & ecosystem accommodations for Vue/Astro/DOM/TS
      "unicorn/prefer-spread": "off",
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
      "unicorn/no-asterisk-prefix-in-documentation-comments": "off",
      "unicorn/prefer-early-return": "off",
      "unicorn/prefer-single-call": "off",
      "unicorn/no-declarations-before-early-exit": "off",
      "unicorn/consistent-class-member-order": "off",
    },
  },

  // ─── 9. Security & Sanitization Strict Standards ──────────────────────────
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

  // ─── 10. Astro Strict Standards ───────────────────────────────────────────
  {
    files: ["**/*.astro"],
    rules: {
      "unicorn/prefer-module": "off",
      "unicorn/name-replacements": "off",
      "unicorn/relative-url-style": "off",
      "astro/no-set-html-directive": "error",
      "astro/no-unsafe-inline-scripts": ["error", { allowModuleScripts: true }],
      "astro/no-exports-from-components": "error",
      "astro/no-prerender-export-outside-pages": "error",
      "astro/no-set-text-directive": "error",
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

  // ─── 11. Scoped Overrides (Pages, JsonLd, Logger, Actions, Zod, Tests) ────
  { files: ["src/pages/**/*.astro"], rules: { "astro/no-exports-from-components": "off" } },
  {
    files: ["src/shared/ui/**/JsonLd.astro"],
    rules: {
      "astro/no-set-html-directive": "off",
      "unicorn/prefer-module": "off",
      "unicorn/no-await-expression-member": "off",
      "unicorn/prefer-top-level-await": "off",
      "no-unsanitized/method": "off",
      "security/detect-object-injection": "off",
    },
  },
  { files: ["src/services/logger.ts", "scripts/**/*.ts"], rules: { "no-console": "off" } },
  {
    files: [
      "src/actions/**/*.ts",
      "src/pages/api/**/*.ts",
      "src/content.config.ts",
      "*.config.ts",
      "*.config.mjs",
    ],
    rules: {
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "no-unsanitized/method": "off",
      "unicorn/no-await-expression-member": "off",
      "security/detect-object-injection": "off",
    },
  },
  {
    files: ["src/i18n/schema.ts", "src/content.config.ts"],
    rules: { "unicorn/max-nested-calls": "off" },
  },
  {
    files: ["tests/**/*.ts", "playwright.config.mjs"],
    rules: { "@typescript-eslint/explicit-module-boundary-types": "off", "no-console": "off" },
  },
  {
    files: ["src/**/*.vue", "src/scripts/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/i18n/ui", "@/i18n/utils", "**/locales/**"],
              message:
                "Do not import full locale dictionaries into client components or client scripts. Use @/lib/hooks/use-translation instead.",
            },
          ],
        },
      ],
    },
  },

  // ─── 12. Prettier — MUST be last ──────────────────────────────────────────
  prettierRecommended,
);

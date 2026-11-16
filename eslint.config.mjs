// eslint.config.mjs
import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginAstro from "eslint-plugin-astro";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";
import nounsanitized from "eslint-plugin-no-unsanitized";
import perfectionist from "eslint-plugin-perfectionist";
import regexpPlugin from "eslint-plugin-regexp";
import securityPlugin from "eslint-plugin-security";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import eslintPluginVue from "eslint-plugin-vue";
import pluginVueA11y from "eslint-plugin-vuejs-accessibility";
import { defineConfig } from "eslint/config";
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
      ".eslintcache",
      "public/**",
      "scratch/**",
      "src/i18n/client-data.ts",
      ".vscode/**",
      ".gemini/**",
      ".kiro/**",
      ".agent/**",
      ".agents/**",
      ".claude/**",
      ".github/**",
      ".freebuff/**",
      ".idea/**",
      ".thinkrail/**",
      "playwright-report/**",
      "test-results/**",
      "rem-reports/**",
      "plans/**",
      "docs/**",
      "anti-slop/**",
      "program/**",
      "logs/**",
      "*.md",
      "*.json",
      "*.code-snippets",
      "*.lock",
      "tsconfig.tsbuildinfo",
    ],
  },

  // ─── 2. Base JS & Type-Aware Strict TypeScript ────────────────────────────
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // ─── 3. Astro, Vue, Accessibility, Unicorn, Regex & Security Presets ──────
  ...eslintPluginAstro.configs["flat/recommended"],
  ...eslintPluginAstro.configs["flat/jsx-a11y-strict"],
  ...eslintPluginVue.configs["flat/recommended"],
  ...pluginVueA11y.configs["flat/recommended"],
  eslintPluginUnicorn.configs.recommended,
  regexpPlugin.configs["flat/recommended"],
  securityPlugin.configs.recommended,
  nounsanitized.configs.recommended,

  // ─── 4. Linter Options ────────────────────────────────────────────────────
  { linterOptions: { reportUnusedDisableDirectives: "error" } },

  // ─── 5. Global Language Options & Shared Strict Rules ─────────────────────
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node, ...globals.es2024 },
      parserOptions: {
        projectService: {
          allowDefaultProject: ["*.config.ts", "*.config.js"],
          defaultProject: "tsconfig.json",
        },
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: [".astro", ".vue"],
      },
    },
    plugins: { perfectionist, "better-tailwindcss": betterTailwindcss },
    settings: {
      "better-tailwindcss": {
        entryPoint: "src/styles/global.css",
        callees: ["cn", "cva", "clsx", "twMerge"],
        detectComponentClasses: true,
      },
    },
    rules: {
      // ── TypeScript Strict Refinements ──
      "@typescript-eslint/array-type": ["error", { default: "array" }],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/consistent-type-exports": [
        "error",
        { fixMixedExportsWithInlineTypeSpecifier: true },
      ],
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
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

      // ── Tailwind CSS v4 Semantic Linting (Formatting delegated to Prettier) ──
      ...betterTailwindcss.configs["recommended-warn"].rules,
      "better-tailwindcss/enforce-consistent-class-order": "off",
      "better-tailwindcss/enforce-consistent-line-wrapping": "off",
      "better-tailwindcss/no-unnecessary-whitespace": "off",
      "better-tailwindcss/no-conflicting-classes": "error",
      "astro/jsx-a11y/no-redundant-roles": ["error", { ul: ["list"], ol: ["list"] }],
      "better-tailwindcss/no-unknown-classes": [
        "warn",
        {
          ignore: [
            "scroll-init",
            "is-visible",
            "is-done",
            "is-next",
            "is-prev",
            "is-outgoing",
            "is-incoming",
            "is-expanding",
            "slider",
            "list",
            "item",
            "content",
            "thumbnail",
            "hero-dots-nav",
            "lenis",
            "lenis-smooth",
            "dark",
          ],
        },
      ],

      // ── Perfectionist (Interfaces & Object Types only; Prettier sorts imports) ──
      "perfectionist/sort-imports": "off",
      "perfectionist/sort-interfaces": ["warn", { type: "natural", order: "asc" }],

      // ── General JavaScript Strict Standards ──
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

      // ── Security & Sanitization ──
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

      // ── Unicorn Strict Tuning ──
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
      "unicorn/prevent-abbreviations": "off",
      "unicorn/filename-case": "off",
      "unicorn/no-null": "off",
      "unicorn/prefer-spread": "off",
      "unicorn/name-replacements": "off",
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

  // ─── 6. Astro Component Overrides & Strict Astro Rules ────────────────────
  {
    files: ["**/*.astro"],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        projectService: false,
        extraFileExtensions: [".astro"],
      },
    },
    rules: {
      "no-undef": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "unicorn/no-null": "off",
      "unicorn/prefer-module": "off",
      "unicorn/relative-url-style": "off",

      // Strict Astro rules scoped specifically to .astro files
      "astro/no-set-html-directive": "error",
      "astro/no-unused-css-selector": "warn",
      "astro/prefer-class-list-directive": "warn",
      "astro/prefer-object-class-list": "warn",
      "astro/prefer-split-class-list": "warn",
      "astro/sort-attributes": "warn",
      "astro/no-unsafe-inline-scripts": ["error", { allowModuleScripts: true }],
      "astro/no-exports-from-components": "error",
      "astro/no-prerender-export-outside-pages": "error",
      "astro/no-set-text-directive": "error",
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

  // ─── 7. Virtual Client-Side <script> Blocks Extracted from .astro Files ───
  {
    files: ["**/*.astro/*.js", "**/*.astro/*.ts"],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: { parserOptions: { projectService: false } },
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
    },
  },
  { files: ["**/*.astro/*.ts"], rules: { "no-undef": "off" } },

  // ─── 8. Vue Flat Config & Strict Rules ────────────────────────────────────
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: { parser: tseslint.parser, extraFileExtensions: [".vue"] },
    },
    rules: {
      "no-undef": "off",
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

  // ─── 9. Scoped Project Overrides ──────────────────────────────────────────
  { files: ["src/pages/**/*.astro"], rules: { "astro/no-exports-from-components": "off" } },
  {
    files: ["src/shared/ui/**/JsonLd.astro"],
    rules: {
      "astro/no-set-html-directive": "off",
      "unicorn/no-await-expression-member": "off",
      "unicorn/prefer-top-level-await": "off",
      "no-unsanitized/method": "off",
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
      "no-undef": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "no-unsanitized/method": "off",
      "unicorn/no-await-expression-member": "off",
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

  // ─── 10. Disable Type-Checked Rules on Plain JS Config Files ──────────────
  {
    files: ["**/*.{js,mjs,cjs}"],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: { parserOptions: { projectService: false } },
    rules: { "@typescript-eslint/explicit-module-boundary-types": "off" },
  },

  // ─── 11. Prettier — MUST be last ──────────────────────────────────────────
  eslintConfigPrettier,
);

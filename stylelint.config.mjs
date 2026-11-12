// stylelint.config.mjs

/** @type {import("stylelint").Config} */
export default {
  // ─── 1. Global Ignores ────────────────────────────────────────────────────
  ignoreFiles: [
    "dist/**",
    ".astro/**",
    "node_modules/**",
    "public/**",
    "scratch/**",
    ".vscode/**",
    ".gemini/**",
    ".kiro/**",
    ".agent/**",
    ".agents/**",
    ".claude/**",
    ".github/**",
  ],

  // ─── 2. Base Configs ──────────────────────────────────────────────────────
  extends: ["stylelint-config-standard", "@dreamsicle.io/stylelint-config-tailwindcss"],

  // ─── 3. Strict Rules (2026 CSS Baseline & Tailwind v4) ────────────────────
  rules: {
    "no-duplicate-selectors": true,
    "no-descending-specificity": [true, { ignore: ["selectors-within-list"] }],
    "declaration-block-no-duplicate-custom-properties": true,
    "declaration-block-no-duplicate-properties": [
      true,
      { ignore: ["consecutive-duplicates-with-different-values"] },
    ],
    "declaration-property-value-no-unknown": [
      true,
      {
        ignoreProperties: {
          "/.+/": [
            String.raw`/anchor\(/`,
            String.raw`/anchor-size\(/`,
            String.raw`/calc-size\(/`,
            String.raw`/color-mix\(/`,
            String.raw`/light-dark\(/`,
            String.raw`/--alpha\(/`,
            String.raw`/--spacing\(/`,
            String.raw`/theme\(/`,
            String.raw`/v-bind\(/`,
          ],
        },
      },
    ],
    "property-no-unknown": [
      true,
      {
        ignoreProperties: [
          "position-anchor",
          "anchor-name",
          "anchor-scope",
          "position-area",
          "position-try",
          "position-try-fallbacks",
          "position-try-order",
          "position-visibility",
          "field-sizing",
          "interpolate-size",
          "view-transition-name",
          "view-transition-class",
          "animation-timeline",
          "animation-range",
          "scroll-timeline",
          "scroll-timeline-name",
          "scroll-timeline-axis",
          "view-timeline",
          "view-timeline-name",
          "view-timeline-axis",
          "view-timeline-inset",
          "text-wrap-style",
        ],
      },
    ],
    "function-no-unknown": [
      true,
      {
        ignoreFunctions: [
          "theme",
          "--alpha",
          "--spacing",
          "v-bind",
          "anchor",
          "anchor-size",
          "calc-size",
          "color-mix",
          "light-dark",
          "scroll",
          "view",
        ],
      },
    ],
    "selector-pseudo-class-no-unknown": [
      true,
      {
        ignorePseudoClasses: [
          "global",
          "deep",
          "slotted",
          "popover-open",
          "user-valid",
          "user-invalid",
          "state",
        ],
      },
    ],
    "selector-pseudo-element-no-unknown": [
      true,
      {
        ignorePseudoElements: [
          "v-deep",
          "v-global",
          "v-slotted",
          "view-transition",
          "view-transition-group",
          "view-transition-image-pair",
          "view-transition-old",
          "view-transition-new",
          "details-content",
          "picker",
        ],
      },
    ],
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: [
          "tailwind",
          "apply",
          "theme",
          "source",
          "utility",
          "variant",
          "custom-variant",
          "plugin",
          "reference",
          "config",
          "slot",
          "position-try",
          "view-transition",
          "starting-style",
          "scope",
        ],
      },
    ],
    "no-invalid-position-at-import-rule": [
      true,
      { ignoreAtRules: ["theme", "custom-variant", "utility", "source", "reference"] },
    ],
    "import-notation": "string",
    "font-family-no-missing-generic-family-keyword": true,
    "unit-no-unknown": true,
    "keyframe-declaration-no-important": true,
    "named-grid-areas-no-invalid": true,

    "selector-max-id": 1,
    "selector-max-universal": 1,
    "selector-max-compound-selectors": 5,
    "selector-max-specificity": "1,5,2",
    "max-nesting-depth": [4, { ignore: ["pseudo-classes", "blockless-at-rules"] }],
    "selector-no-qualifying-type": [true, { ignore: ["attribute", "class"] }],
    "selector-not-notation": "complex",

    "color-named": "never",
    "color-no-invalid-hex": true,
    "color-hex-length": "short",
    "color-function-notation": "modern",
    "alpha-value-notation": "number",
    "length-zero-no-unit": [true, { ignore: ["custom-properties"] }],
    "font-weight-notation": "numeric",
    "shorthand-property-no-redundant-values": true,
    "value-keyword-case": [
      "lower",
      {
        camelCaseSvgKeywords: true,
        ignoreKeywords: ["currentColor"],
        ignoreProperties: ["color-mix", "/^--/"],
        ignoreFunctions: ["v-bind", "theme"],
      },
    ],
    "custom-property-pattern": [
      "^([a-z][a-z0-9_]*)(-[a-z0-9_*]+)*$",
      {
        message:
          "Expected custom property (--var) to be kebab-case or Tailwind v4 wildcard (--*-*)",
      },
    ],
    "keyframes-name-pattern": [
      "^([a-z][a-z0-9]*)(-[a-z0-9]+)*$|^[a-z][a-zA-Z0-9]+$",
      { message: "Expected keyframes name to be kebab-case or camelCase" },
    ],
    "selector-class-pattern": [
      String.raw`^[a-zA-Z0-9_\-\/\[\]:.]+$`,
      {
        resolveNestedSelectors: true,
        message:
          "Expected class selector to match valid kebab-case, BEM, or Tailwind utility pattern",
      },
    ],

    "property-no-vendor-prefix": true,
    "value-no-vendor-prefix": true,
    "selector-no-vendor-prefix": true,
    "media-feature-name-no-vendor-prefix": true,
    "at-rule-no-vendor-prefix": true,

    "comment-whitespace-inside": "always",
    "rule-empty-line-before": [
      "always-multi-line",
      { except: ["first-nested"], ignore: ["after-comment"] },
    ],
    "custom-property-empty-line-before": [
      "always",
      {
        except: ["after-custom-property", "first-nested"],
        ignore: ["after-comment", "inside-single-line-block"],
      },
    ],
  },

  // ─── 4. File-Specific Parsers & Overrides (Astro, Vue, HTML) ──────────────
  overrides: [
    {
      files: ["**/*.astro"],
      extends: ["stylelint-config-html/astro"],
      rules: { "no-invalid-position-declaration": null, "no-empty-source": null },
    },
    {
      files: ["**/*.vue"],
      extends: ["stylelint-config-html/vue"],
      rules: { "no-empty-source": null },
    },
    { files: ["**/*.html"], extends: ["stylelint-config-html/html"] },
  ],
};

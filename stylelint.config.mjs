/** @type {import("stylelint").Config} */
export default {
  extends: [
    "stylelint-config-standard",
    "@dreamsicle.io/stylelint-config-tailwindcss",
    "stylelint-config-html/astro",
    "stylelint-config-html/vue",
    "stylelint-config-html/html",
  ],
  rules: {
    // ─── Avoid Errors: Strict Diagnostics ──────────────────────────────────
    "no-duplicate-selectors": true,
    "no-descending-specificity": [true, { ignore: ["selectors-within-list"] }],
    "declaration-block-no-duplicate-custom-properties": true,
    "declaration-block-no-duplicate-properties": [
      true,
      { ignore: ["consecutive-duplicates-with-different-values"] },
    ],
    "declaration-property-value-no-unknown": [
      true,
      { ignoreProperties: { "/.+/": ["/anchor\\(/", "/anchor-size\\(/", "/color-mix\\(/"] } },
    ],
    "property-no-unknown": [true, { ignoreProperties: ["position-anchor", "anchor-name"] }],
    "selector-pseudo-class-no-unknown": [
      true,
      { ignorePseudoClasses: ["global", "deep", "slotted", "popover-open"] },
    ],
    "selector-pseudo-element-no-unknown": [
      true,
      { ignorePseudoElements: ["v-deep", "v-global", "v-slotted"] },
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
        ],
      },
    ],
    "no-invalid-position-at-import-rule": [
      true,
      { ignoreAtRules: ["theme", "custom-variant", "utility", "source"] },
    ],
    "font-family-no-missing-generic-family-keyword": true,
    "unit-no-unknown": true,
    "keyframe-declaration-no-important": true,
    "named-grid-areas-no-invalid": true,

    // ─── Enforce Conventions: Strict Specificity & Complexity Limits ────────
    "selector-max-id": 1,
    "selector-max-universal": 1,
    "selector-max-compound-selectors": 5,
    "selector-max-specificity": "1,5,2",
    "max-nesting-depth": [4, { ignore: ["pseudo-classes"] }],
    "selector-no-qualifying-type": [true, { ignore: ["attribute", "class"] }],
    "selector-not-notation": "complex",

    // ─── Enforce Conventions: Modern Clean CSS ─────────────────────────────
    "color-named": "never",
    "color-no-invalid-hex": true,
    "color-hex-length": "short",
    "color-function-notation": "modern",
    "alpha-value-notation": "number",
    "length-zero-no-unit": true,
    "font-weight-notation": "numeric",
    "shorthand-property-no-redundant-values": true,
    "value-keyword-case": [
      "lower",
      { camelCaseSvgKeywords: true, ignoreProperties: ["color-mix"] },
    ],
    "keyframes-name-pattern": [
      "^([a-z][a-z0-9]*)(-[a-z0-9]+)*$|^[a-z][a-zA-Z0-9]+$",
      { message: "Expected keyframes name to be kebab-case or camelCase" },
    ],
    "selector-class-pattern": [
      "^[a-zA-Z0-9_\\-\\/\\[\\]:.]+$",
      {
        resolveNestedSelectors: true,
        message:
          "Expected class selector to match valid kebab-case, BEM, or Tailwind utility pattern",
      },
    ],

    // ─── Disallow Vendor Prefixes (Target Modern Baseline Standard) ────────
    "property-no-vendor-prefix": true,
    "value-no-vendor-prefix": true,
    "selector-no-vendor-prefix": true,
    "media-feature-name-no-vendor-prefix": true,
    "at-rule-no-vendor-prefix": true,

    // ─── Code Structure & Formatting Consistency ───────────────────────────
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
  overrides: [
    { files: ["**/*.astro"], rules: { "no-invalid-position-declaration": null } },
    { files: ["**/*.vue"], customSyntax: "postcss-html" },
  ],
};

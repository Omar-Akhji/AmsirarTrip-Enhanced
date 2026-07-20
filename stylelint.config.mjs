/** @type {import("stylelint").Config} */
export default {
  extends: [
    "stylelint-config-standard",
    "@dreamsicle.io/stylelint-config-tailwindcss",
    "stylelint-config-html/astro",
  ],
  rules: {
    // Allow standard CSS custom property definitions
    "custom-property-pattern": null,
    // Allow custom keyframes naming conventions
    "keyframes-name-pattern": null,
    // Allow class naming selector patterns (standard camelCase/kebab-case)
    "selector-class-pattern": null,
  },
  overrides: [{ files: ["**/*.astro"], rules: { "no-invalid-position-declaration": null } }],
};

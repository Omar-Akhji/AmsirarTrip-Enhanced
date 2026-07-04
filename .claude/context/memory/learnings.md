# Project Learnings & Patterns

## 1. Import Sorting in `.astro` Files
* **Pattern**: The project uses Prettier with `prettier-plugin-astro-organize-imports` to manage frontmatter imports in `.astro` templates.
* **Ordering**: Imports are sorted alphabetically by their specifier path. Because the `@` symbol (ASCII 64) sorts before `a` (ASCII 97), path aliases like `@/i18n/...` or `@/shared/...` must be declared **before** standard framework modules like `astro:assets`.
* **Example**:
  ```astro
  ---
  import { useTranslations } from "@/i18n/utils";
  import { Image } from "astro:assets";
  ---
  ```
  Putting `astro:assets` first triggers ESLint/Prettier format compilation errors.

## 2. Using Astro `<Image />` for Public Assets
* **Pattern**: Images and icons are stored in the `/public` folder rather than `/src/assets`.
* **Requirement**: When passing `/public` assets as a string path to Astro's `<Image />` component, you must supply explicit `width` and `height` properties to satisfy compilation rules and prevent Cumulative Layout Shift (CLS).
* **Reference Dimensions**:
  * `header-1.webp`/`header-2.webp`/`header-3.webp`: `1920x1280`
  * `services-bg.webp`: `1920x1277`
  * `Marrakech-tourist.webp`: `4512x3000`
  * `Casablanca-tourist.webp`: `600x400`
  * `Fez-tourist.webp`: `600x395`
  * `valley-tourisit.webp`: `600x400`
  * `Chefchaouen-tourist.webp`: `600x400`
  * `Rabat-tourist.webp`: `4032x2688`
  * `about-img.webp`: `720x852`
  * standard tour thumbnails: `640x480` (adapted to aspect-4/3)

## 3. Hydration Best Practices
* **Pattern**: Contact forms and similar interactive modules located below the fold (under large headers or introductory grids) must use `client:visible` rather than `client:load`. This keeps the initial page load free from React/Recaptcha parser weight and improves core web vitals.

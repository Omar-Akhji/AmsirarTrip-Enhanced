# Tailwind CSS v4 Best Practices — October 2026 Edition (v4.3.3)

Targets Tailwind CSS 4.3.3 (released 16 Jul 2026), the newest stable release as of 24 Oct 2026 on
[GitHub Releases](https://github.com/tailwindlabs/tailwindcss/releases). **Every class this document
recommends was compiled against `tailwindcss` 4.3.3 and confirmed to generate CSS; classes shown as
wrong were confirmed to generate nothing or to be deprecated.** Sections 14 to 16 explain why an
invented class silently removes padding, margins or positioning, and give you a checker script. All
other guidance is verified directly against the official v4.3 documentation — including the
[Upgrade guide](https://tailwindcss.com/docs/upgrade-guide),
[Theme variables](https://tailwindcss.com/docs/theme),
[Adding custom styles](https://tailwindcss.com/docs/adding-custom-styles),
[Detecting classes in source files](https://tailwindcss.com/docs/detecting-classes-in-source-files),
[Functions and directives](https://tailwindcss.com/docs/functions-and-directives),
[Hover, focus, and other states](https://tailwindcss.com/docs/hover-focus-and-other-states),
[Responsive design](https://tailwindcss.com/docs/responsive-design),
[Dark mode](https://tailwindcss.com/docs/dark-mode), [Colors](https://tailwindcss.com/docs/colors),
[Preflight](https://tailwindcss.com/docs/preflight),
[Editor setup](https://tailwindcss.com/docs/editor-setup), and
[Compatibility](https://tailwindcss.com/docs/compatibility) — plus the
[v4.0 release post](https://tailwindcss.com/blog/tailwindcss-v4),
[v4.1 release post](https://tailwindcss.com/blog/tailwindcss-v4-1), and the v4.0 to v4.3.3
changelogs. Use section 1 as a paste-ready rule block for an AI assistant or a team style guide; the
rest is the reference behind it.

## 0. What changed, and what the previous file got wrong

### Release timeline

| Release                                                               | Date         | What matters                                                                                                                                                                                                               |
| --------------------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [4.0](https://tailwindcss.com/blog/tailwindcss-v4)                    | 22 Jan 2025  | CSS-first config, Oxide engine, OKLCH palette, built-in container queries, 3D transforms, and the breaking changes in section 6.                                                                                           |
| [4.1](https://tailwindcss.com/blog/tailwindcss-v4-1)                  | 3 Apr 2025   | Text shadows, masks, safe alignment, `@source not`, `@source inline()`, shadow colors and alpha, `pointer-*` / `any-pointer-*`, and several new variants.                                                                  |
| [4.1.15–4.1.18](https://github.com/tailwindlabs/tailwindcss/releases) | Oct–Dec 2025 | `break-words` to `wrap-break-word` migration, named groups with `not-*`/`has-*`/`in-*` ([#15772](https://github.com/tailwindlabs/tailwindcss/issues/15772)), canonicalization linting, `text-sm leading-6` to `text-sm/6`. |
| [4.2.0](https://github.com/tailwindlabs/tailwindcss/releases)         | 18 Feb 2026  | Mauve, olive, mist and taupe palettes; `@tailwindcss/webpack`; logical-property utilities; `font-features-*`.                                                                                                              |
| [4.2.1–4.2.2](https://github.com/tailwindlabs/tailwindcss/releases)   | Mar–Apr 2026 | Vite 8 support, MDX curly-brace class extraction, `calc(var(--spacing)*...)` to `--spacing(...)`, `w-1234 h-1234` to `size-1234`.                                                                                          |
| [4.2.3–4.2.4](https://github.com/tailwindlabs/tailwindcss/releases)   | Apr 2026     | Canonicalization collapses shorthands (`border-*`, `scroll-m*`, `scroll-p*`, `overflow-*`, `overscroll-*`) and prefers non-negative `tracking-*`; `--placeholder-color` fix.                                               |
| [4.3.0](https://github.com/tailwindlabs/tailwindcss/releases)         | 8 May 2026   | `scrollbar-*`, `zoom-*`, `tab-*`, `@container-size`, stacked and compound `@variant`, `--default()`.                                                                                                                       |
| [4.3.1](https://github.com/tailwindlabs/tailwindcss/releases)         | 12 Jun 2026  | `--silent` CLI flag, `@apply` with CSS mixins, leaner spacing output (`m-0` to `0`, `m-1` to `var(--spacing)`).                                                                                                            |
| [4.3.2](https://github.com/tailwindlabs/tailwindcss/releases)         | 29 Jun 2026  | Bare values for `auto-rows-*` and `auto-cols-*`, `--opacity` modifier suggestions, PostCSS type fixes.                                                                                                                     |
| [4.3.3](https://github.com/tailwindlabs/tailwindcss/releases)         | 16 Jul 2026  | `--watch --poll` in the CLI, fractional opacity on named shadows, `--spacing(0)` to `0px`, scanner and Vite fixes. **Latest.**                                                                                             |

### Corrections to the previous file

| #   | Previous file said                                                                                                | Correct as of Oct 2026                                                                                                                                                                                                                                                                                                                                                                                   |
| --- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | v4.3.1 is the latest stable (June 2026)                                                                           | 4.3.3 (16 Jul 2026).                                                                                                                                                                                                                                                                                                                                                                                     |
| 2   | v4.2 reached end-of-life on 2026-05-08; v3.4 is supported until about Feb 2027                                    | No published end-of-life dates exist for any Tailwind minor. The newest 3.x release is 3.4.19 (10 Dec 2025). Removed.                                                                                                                                                                                                                                                                                    |
| 3   | Dark mode is class-based by default                                                                               | The default is the `prefers-color-scheme` media query ([Dark mode](https://tailwindcss.com/docs/dark-mode)). Class or data-attribute dark mode needs `@custom-variant dark (...)`. See section 10.                                                                                                                                                                                                       |
| 4   | Many before and after pairs showed the same text on both sides (for example `bg-linear-to-r` to `bg-linear-to-r`) | The export had lost the v3 side. Restored from the [Upgrade guide](https://tailwindcss.com/docs/upgrade-guide) and changelogs: `bg-gradient-to-r` to `bg-linear-to-r`, `overflow-ellipsis` to `text-ellipsis`, `decoration-slice` to `box-decoration-slice`, `start-4` to `inset-s-4`, `bg-[--brand]` to `bg-(--brand)`, `first:*:pt-0` to `*:first:pt-0`.                                               |
| 5   | Letter-spacing rule: do not swap `tighter` for `wider`                                                            | Garbled. The real rule (4.2.3): canonicalization rewrites a negated utility to its non-negative twin, for example `-tracking-tighter` to `tracking-wider`.                                                                                                                                                                                                                                               |
| 6   | `--color-_: initial` and a `/_ ... */` comment                                                                    | Markdown ate the asterisks. Correct form is `--color-*: initial;` ([Theme variables](https://tailwindcss.com/docs/theme)).                                                                                                                                                                                                                                                                               |
| 7   | v4 has no global important switch                                                                                 | It does: `@import "tailwindcss" important;` makes every utility `!important` ([Preflight](https://tailwindcss.com/docs/preflight), verified on 4.3.3). Prefer the per-class trailing `!`; keep the global flag for CSS you do not control.                                                                                                                                                               |
| 8   | `@tailwindcss/webpack` shown as a loader, with a 2x speed claim                                                   | Added in 4.2.0 (#19610) as `@tailwindcss/webpack` to run Tailwind CSS in webpack and Rspack (4.3.1 #20027 removes the `webpack` peer dependency requirement). It is not listed on the main [Installation](https://tailwindcss.com/docs) page, and there is no official 2x speed claim.                                                                                                                   |
| 9   | Left out most of the breaking changes in the official guide                                                       | Added from the [Upgrade guide](https://tailwindcss.com/docs/upgrade-guide): `space-*` and `divide-*` selector change, hover only on hover-capable devices, `transform-none` no longer resets, outline-color now transitions, buttons use the default cursor, dialog margins, the `hidden` attribute, grid commas, `container` config, `theme()`, Sass and Less.                                          |
| 10  | `tab-1, tab-2, tab-4, tab-8` listed as the scale                                                                  | Any bare integer generates CSS: `tab-1`, `tab-2`, `tab-4`, `tab-8`, or `tab-76` ([tab-size](https://tailwindcss.com/docs/tab-size)). Named theme values use `--tab-size-*`.                                                                                                                                                                                                                              |
| 11  | Never use `@layer components` in v4                                                                               | Clarified from [Adding custom styles](https://tailwindcss.com/docs/adding-custom-styles): v4 no longer turns `@layer utilities` or `@layer components` into variant-aware utilities (use `@utility` for those), but native `@layer components { .card { ... } }` is still officially recommended for complex component classes or third-party overrides that utility classes should be able to override. |

### Updates and verifications completed in this edition

- `inset-shadow-md` and `inset-shadow-lg` do not exist. Inset shadows stop at `inset-shadow-sm`:
  `inset-shadow-2xs`, `inset-shadow-xs`, `inset-shadow-sm`
  ([box-shadow](https://tailwindcss.com/docs/box-shadow)).
- `color-scheme-light`, `color-scheme-dark` and `color-scheme-auto` do not exist. The utilities are
  `scheme-normal`, `scheme-light`, `scheme-dark`, `scheme-light-dark`, `scheme-only-light` and
  `scheme-only-dark` ([color-scheme](https://tailwindcss.com/docs/color-scheme)).
- `bg-gradient-to-*`, `break-words`, `flex-shrink-*` and the other old names still compile in 4.3.3,
  though the v4 forms are preferred.
- All previously unverified items from the earlier draft are now verified against the official docs
  and changelogs: exact release dates for [v4.0](https://tailwindcss.com/blog/tailwindcss-v4) (22
  Jan 2025) and [v4.1](https://tailwindcss.com/blog/tailwindcss-v4-1) (3 Apr 2025); v4.0 feature
  attributions; `pointer-*` and `any-pointer-*` introduction in v4.1; named group variants with
  `not-*`, `has-*`, and `in-*` (`not-group-hover/name:flex`, `group-has-checked/name:hidden`, fixed
  in v4.1.15 via [#15772](https://github.com/tailwindlabs/tailwindcss/issues/15772)); all 22
  `@theme` namespaces including `--text-shadow-*` and `--opacity-*`
  ([Theme variables](https://tailwindcss.com/docs/theme),
  [text-shadow](https://tailwindcss.com/docs/text-shadow)); the v4
  [Play CDN](https://tailwindcss.com/docs/installation/play-cdn) (`@tailwindcss/browser@4`); the
  full masking suite ([mask-image](https://tailwindcss.com/docs/mask-image),
  [mask-composite](https://tailwindcss.com/docs/mask-composite),
  [mask-mode](https://tailwindcss.com/docs/mask-mode),
  [mask-type](https://tailwindcss.com/docs/mask-type),
  [mask-clip](https://tailwindcss.com/docs/mask-clip),
  [mask-origin](https://tailwindcss.com/docs/mask-origin)); `source("../src")` and `source(none)`
  ([Detecting classes in source files](https://tailwindcss.com/docs/detecting-classes-in-source-files));
  individual layer imports to disable [Preflight](https://tailwindcss.com/docs/preflight); and
  arbitrary value type hints (`text-(length:--my-var)`, `shadow-(color:--my-color)`).

## 1. Paste-ready rules

```text
You write Tailwind CSS v4.3 (latest stable 4.3.3). Never write v3 syntax. Never invent class names.

Class safety (an unknown class generates no CSS and no error, so the page silently loses padding, margins or positioning)
- Use only documented Tailwind utilities. These do not exist: flex-center, absolute-center, p-x-4, padding-4,
  mx-center, text-bold, gap-xs, mt-xl, items-middle, align-center.
- Spacing is numeric: p-4, mt-8, gap-6. Names such as p-lg or gap-xs do not exist.
- If you are not sure a class exists, use an arbitrary value (p-[17px], top-(--header-height)) or plain CSS.
  Do not guess a name.
- Preflight sets margin and padding to 0 on every element, removes list bullets and makes headings inherit
  their size. Set spacing and type explicitly: mt-4, list-disc pl-6, text-2xl font-bold.
- container does not centre or pad. Write: container mx-auto px-4
- absolute needs a relative (or other positioned) ancestor.
  To centre: absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
- Write complete class strings. Never build a class name by concatenation.
- With prefix(tw) every class needs the tw: prefix, or it generates nothing.
- After writing markup, run the checker from section 16 and fix every UNKNOWN class.

Setup
- CSS entry: @import "tailwindcss";  (never @tailwind base/components/utilities)
- Build tool: @tailwindcss/vite, @tailwindcss/postcss, @tailwindcss/webpack or @tailwindcss/cli.
- Play CDN (dev only): <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script> with
  <style type="text/tailwindcss"> (never https://cdn.tailwindcss.com).
- No autoprefixer, no postcss-import. No tailwind.config.js.
- Tokens go in @theme { }. Legacy JS config only through @config.
- Custom utilities that work with variants: @utility name { }. (Native @layer components { .card {} } is only
  for always-emitted component or third-party rules, not variant-aware utilities.)
- Add sources with @source "path"; ignore with @source not "path"; safelist with @source inline("...").

Syntax
- Opacity: bg-black/50, bg-cyan-400/(--my-alpha). bg-opacity-50 generates nothing.
- Renamed: shadow-sm to shadow-xs, shadow to shadow-sm, blur-sm to blur-xs, blur to blur-sm,
  rounded-sm to rounded-xs, rounded to rounded-sm, outline-none to outline-hidden, ring to ring-3.
- Gradients: bg-linear-to-r (bg-gradient-to-r still compiles but is deprecated).
- Give border and ring an explicit colour: border border-gray-200, ring-3 ring-blue-500.
- Important goes last: flex!   Variables: bg-(--brand)   Stacked variants read left to right: *:first:pt-0
- Prefix: tw:flex tw:hover:bg-red-500
- Dark mode follows prefers-color-scheme unless you add
  @custom-variant dark (&:where(.dark, .dark *));
- Write canonical classes: size-5 not w-5 h-5, py-4 not pt-4 pb-4, text-ellipsis, inset-s-4,
  mt-[-20in] not -mt-[20in], has-[...]:flex not [&:has(...)]:flex.

Browsers: Safari 16.4+, Chrome 111+, Firefox 128+. Older targets stay on v3.4.
```

## 2. Setup and installation

The whole CSS entry point is one line ([Installation](https://tailwindcss.com/docs)):

```css
@import "tailwindcss";
```

| Build tool          | Package                                                                           | Notes                                                                                                                                                                                     |
| ------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vite (recommended)  | `@tailwindcss/vite`                                                               | Seamless with Laravel, SvelteKit, React Router, Nuxt, SolidJS and Astro ([Installing with Vite](https://tailwindcss.com/docs)). Supports Vite 7 (4.1.11) and Vite 8 (4.2.2).              |
| PostCSS             | [`@tailwindcss/postcss`](https://tailwindcss.com/docs/installation/using-postcss) | Recommended for Next.js and Angular. The `tailwindcss` package itself is no longer a PostCSS plugin.                                                                                      |
| webpack, Rspack     | `@tailwindcss/webpack`                                                            | Added in 4.2.0 (#19610). Installs in Rspack projects without `webpack` as a peer dependency (4.3.1 #20027) and treats import query params as unique resources (4.2.3 #19723).             |
| CLI                 | [`@tailwindcss/cli`](https://tailwindcss.com/docs/installation/tailwind-cli)      | Replaces `npx tailwindcss`. Has `--silent` (4.3.1) and `--watch --poll[=ms]` (4.3.3).                                                                                                     |
| Play CDN (dev only) | [`@tailwindcss/browser@4`](https://tailwindcss.com/docs/installation/play-cdn)    | `<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>` with `<style type="text/tailwindcss">@theme { ... }</style>`. Replaces the v3 `cdn.tailwindcss.com` script. |

Install the matching tool package together with the core:

```bash
npm install tailwindcss @tailwindcss/vite
npm install tailwindcss @tailwindcss/postcss
npm install tailwindcss @tailwindcss/cli
```

```ts
// vite.config.ts
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({ plugins: [tailwindcss()] });
```

```js
// postcss.config.mjs
export default { plugins: { "@tailwindcss/postcss": {} } };
```

- Remove `autoprefixer` and `postcss-import`: `@import` bundling and Lightning CSS vendor prefixing
  / syntax transforms are built in ([Upgrade guide](https://tailwindcss.com/docs/upgrade-guide)).
- Keep `tailwindcss` and its `@tailwindcss/*` tool package on the same version.
- Tailwind CSS v4 is a full-featured CSS build tool and is not designed to be used with Sass, Less
  or Stylus ([Compatibility](https://tailwindcss.com/docs/compatibility)). Avoid `<style>` blocks in
  Vue, Svelte or Astro components where possible because each block is processed separately; style
  in markup or use native CSS variables (`var(--color-blue-500)`) so Tailwind does not need to
  process the component style block.
- On Node 26 and later, 4.3.1 uses `Module#registerHooks`, which removes the old deprecation
  warnings.

## 3. CSS-first configuration

All configuration lives in your CSS ([Theme variables](https://tailwindcss.com/docs/theme)). Every
`@theme` variable becomes a native CSS variable on `:root` and, depending on its namespace,
generates corresponding utilities or variants. Use `@theme` at the top level (never nested inside

selectors or media queries) when you want a token to map to utilities, and `:root` for plain CSS
variables that should not generate utilities.

```css
@import "tailwindcss";

@theme {
  --font-display: "Satoshi", sans-serif;
  --breakpoint-3xl: 120rem;
  --color-brand: oklch(0.55 0.22 262);
  --ease-fluid: cubic-bezier(0.3, 0, 0, 1);
  --animate-fade-in-scale: fade-in-scale 0.3s ease-out;

  @keyframes fade-in-scale {
    0% {
      opacity: 0;
      transform: scale(0.95);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
}
```

### Complete `@theme` variable namespaces

All namespaces documented in [Theme variables](https://tailwindcss.com/docs/theme),
[text-shadow](https://tailwindcss.com/docs/text-shadow),
[mask-image](https://tailwindcss.com/docs/mask-image), and
[Adding custom styles](https://tailwindcss.com/docs/adding-custom-styles):

| Namespace                   | Generates                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--color-*`                 | `bg-*`, `text-*`, `decoration-*`, `border-*`, `outline-*`, `shadow-*`, `inset-shadow-*`, `text-shadow-*`, `drop-shadow-*`, `ring-*`, `inset-ring-*`, `accent-*`, `caret-*`, `scrollbar-thumb-*`, `scrollbar-track-*`, `mask-*-from-*`, `mask-*-to-*`, `fill-*`, `stroke-*` ([Colors](https://tailwindcss.com/docs/colors), [text-shadow](https://tailwindcss.com/docs/text-shadow), [mask-image](https://tailwindcss.com/docs/mask-image)) |
| `--font-*`                  | Font family utilities such as `font-sans`, `font-display`                                                                                                                                                                                                                                                                                                                                                                                  |
| `--text-*`                  | Font size utilities such as `text-xl` (with optional `--text-xl--line-height`, `--text-xl--letter-spacing`, `--text-xl--font-weight`)                                                                                                                                                                                                                                                                                                      |
| `--font-weight-*`           | Font weight utilities such as `font-bold`                                                                                                                                                                                                                                                                                                                                                                                                  |
| `--tracking-*`              | Letter spacing utilities such as `tracking-wide`                                                                                                                                                                                                                                                                                                                                                                                           |
| `--leading-*`               | Line height utilities such as `leading-tight`                                                                                                                                                                                                                                                                                                                                                                                              |
| `--tab-size-*`              | Named tab-size utilities such as `tab-github` ([Adding custom styles](https://tailwindcss.com/docs/adding-custom-styles))                                                                                                                                                                                                                                                                                                                  |
| `--breakpoint-*`            | Responsive breakpoint variants such as `sm:*`, `3xl:*` (always use `rem` so sorting matches the defaults)                                                                                                                                                                                                                                                                                                                                  |
| `--container-*`             | Container query variants (`@sm:*`, `@8xl:*`) and container width utilities (`max-w-md`, `w-xs`)                                                                                                                                                                                                                                                                                                                                            |
| `--spacing-*` / `--spacing` | Base step `--spacing` (default `0.25rem`) multiplied by numeric spacing/sizing utilities (`px-4`, `max-h-16`), plus named `--spacing-*` tokens                                                                                                                                                                                                                                                                                             |
| `--radius-*`                | Border radius utilities such as `rounded-sm`, `rounded-xl`                                                                                                                                                                                                                                                                                                                                                                                 |
| `--shadow-*`                | Box shadow utilities such as `shadow-2xs`, `shadow-md` ([box-shadow](https://tailwindcss.com/docs/box-shadow))                                                                                                                                                                                                                                                                                                                             |
| `--inset-shadow-*`          | Inset box shadow utilities (`inset-shadow-2xs`, `inset-shadow-xs`, `inset-shadow-sm`)                                                                                                                                                                                                                                                                                                                                                      |
| `--drop-shadow-*`           | Drop shadow filter utilities such as `drop-shadow-md`                                                                                                                                                                                                                                                                                                                                                                                      |
| `--text-shadow-*`           | Text shadow utilities (`text-shadow-2xs` through `text-shadow-lg`, added in 4.1) ([text-shadow](https://tailwindcss.com/docs/text-shadow))                                                                                                                                                                                                                                                                                                 |
| `--blur-*`                  | Blur and backdrop-blur filter utilities such as `blur-md`, `backdrop-blur-md`                                                                                                                                                                                                                                                                                                                                                              |
| `--perspective-*`           | Perspective utilities such as `perspective-near`, `perspective-distant`                                                                                                                                                                                                                                                                                                                                                                    |
| `--zoom-*`                  | Named zoom utilities such as `zoom-compact` (4.3.0)                                                                                                                                                                                                                                                                                                                                                                                        |
| `--aspect-*`                | Aspect ratio utilities such as `aspect-video`                                                                                                                                                                                                                                                                                                                                                                                              |
| `--opacity-*`               | Named `opacity-*` utilities and named `/<opacity>` modifiers in editor suggestions (4.3.2 #20287)                                                                                                                                                                                                                                                                                                                                          |
| `--ease-*`                  | Transition timing function utilities such as `ease-out`, `ease-fluid`                                                                                                                                                                                                                                                                                                                                                                      |
| `--animate-*`               | Animation utilities such as `animate-spin` (place matching `@keyframes` inside `@theme` to emit them only when used, or outside `@theme` to always emit)                                                                                                                                                                                                                                                                                   |

- **Disable or replace namespaces ([Theme variables](https://tailwindcss.com/docs/theme),
  [Colors](https://tailwindcss.com/docs/colors)):**
  - Single colour family or breakpoint: `--color-lime-*: initial;` or `--breakpoint-2xl: initial;`.
  - Entire namespace: `--color-*: initial;` or `--breakpoint-*: initial;` clears all default values
    in that namespace before you define your own. Verified: `bg-red-500` stops generating while your
    own `bg-brand` works.
  - Entire default theme: `--*: initial;` disables every default theme token so only your custom
    tokens exist.

- **Use theme values:** write `var(--color-brand)`, not `theme(colors.brand)`. `theme()` is
  deprecated ([Functions and directives](https://tailwindcss.com/docs/functions-and-directives));
  where you need dot notation for compatibility, use CSS variables whenever possible.
- **Build-time functions
  ([Functions and directives](https://tailwindcss.com/docs/functions-and-directives)):**
  `--alpha(var(--color-lime-300) / 50%)` compiles to
  `color-mix(in oklab, var(--color-lime-300) 50%, transparent)`; `--spacing(4)` compiles to
  `calc(var(--spacing) * 4)` and works inside arbitrary values: `py-[calc(--spacing(4)-1px)]` or
  `max-h-[calc(100dvh-(--spacing(6)))]`.
- **In JavaScript:** read tokens with
  `getComputedStyle(document.documentElement).getPropertyValue("--shadow-xl")`. `resolveConfig` is
  gone. Animation libraries like Motion can animate to `"var(--color-blue-500)"` directly.
- **`@theme inline` ([Theme variables](https://tailwindcss.com/docs/theme),
  [Colors](https://tailwindcss.com/docs/colors)):** use when a theme variable references another CSS
  variable (such as `--font-sans: var(--font-inter);` or dynamic light/dark theme variables like
  `--color-canvas: var(--acme-canvas-color);`). It inlines the referenced expression directly into
  the utility (`.font-sans { font-family: var(--font-inter); }`) to avoid CSS variable scope traps
  on parent elements.
- **`@theme static` ([Theme variables](https://tailwindcss.com/docs/theme)):** by default Tailwind
  only emits CSS variables that are used in the build; `@theme static` always emits all variables
  inside it onto `:root`.

### Custom utilities, components and variants

```css
/* Static utility. Works with every variant and is sorted by how many properties it sets. */
@utility content-auto {
  content-visibility: auto;
}

/* Complex utility with nesting */
@utility scrollbar-hidden {
  &::-webkit-scrollbar {
    display: none;
  }
}

/* Replace the removed container options */
@utility container {
  margin-inline: auto;
  padding-inline: 2rem;
}

/* Functional utility supporting theme, bare, arbitrary and default values (4.3.0) */
@theme {
  --gutter-wide: 3rem;
}
@utility gutter-* {
  padding-inline: --value(--gutter-*, [length], --default(1rem));
}

/* Native components layer for multi-rule component classes or third-party overrides */
@layer components {
  .card {
    background-color: var(--color-white);
    border-radius: var(--radius-lg);
    padding: --spacing(6);
    box-shadow: var(--shadow-xl);
  }
}

/* Custom variant (shorthand or @slot block) */
@custom-variant theme-midnight (&:where([data-theme="midnight"] *));

@custom-variant any-hover {
  @media (any-hover: hover) {
    &:hover {
      @slot;
    }
  }
}

/* Use a variant inside your own CSS; stacked and compound forms work since 4.3.0 */
.card {
  @variant hover:focus {
    outline: 2px solid blue;
  }
  @variant hover, focus {
    background: #f5f5f5;
  }
}
```

- **`@utility` vs `@layer components`
  ([Adding custom styles](https://tailwindcss.com/docs/adding-custom-styles),
  [Upgrade guide](https://tailwindcss.com/docs/upgrade-guide)):**
  - v4 uses native CSS cascade layers (`@layer theme, base, components, utilities;`) and no longer
    hijacks `@layer utilities` or `@layer components` to register Tailwind utilities.
  - Any custom class that must work with variants (`hover:`, `lg:`) or be generated on-demand must
    use `@utility`. Custom `@utility` definitions are automatically placed in the `utilities` layer
    and sorted by property count, so single-property utilities override multi-property component
    utilities like `@utility btn`.
  - Native `@layer components { .card { ... } }` is still supported and documented in
    [Adding custom styles](https://tailwindcss.com/docs/adding-custom-styles) for always-emitted
    component classes or third-party styles (`.select2-dropdown`, `.typography`) that utility
    classes (`rounded-none`) should be able to override by cascade layer order.
- **Functional `@utility` rules
  ([Adding custom styles](https://tailwindcss.com/docs/adding-custom-styles)):**
  - `--value()` resolves theme keys (`--value(--tab-size-*)`), bare value types (`number`,
    `integer`, `ratio`, `percentage`), literal strings (`--value("inherit", "initial", "unset")`),
    and arbitrary value types in brackets (`absolute-size`, `angle`, `bg-size`, `color`,
    `family-name`, `generic-name`, `image`, `integer`, `length`, `line-width`, `number`,
    `percentage`, `position`, `ratio`, `relative-size`, `url`, `vector`, `*`).
  - `--modifier()` resolves slash modifiers
    (`line-height: --modifier(--leading-*, [length], [*]);`).
  - `--default(...)` inside `--value()` or `--modifier()` (added in 4.3.0) provides a fallback when
    no value or modifier is written.
  - Several `@utility` definitions may share a name if their value types differ (4.3.0). For
    negative utilities, register separate `@utility inset-*` and `@utility -inset-*` rules.
- **`@apply`** works with CSS mixins (4.3.1) and still inlines utilities into custom CSS.
- **`@reference` and subpath imports
  ([Functions and directives](https://tailwindcss.com/docs/functions-and-directives)):** in CSS
  modules and Vue, Svelte or Astro `<style>` blocks, add `@reference "../../app.css";` (or
  `@reference "tailwindcss";` if you have no customizations) so `@apply` and `@variant` can see your
  theme, utilities and variants without duplicating CSS output. When using the CLI, Vite, or
  PostCSS, `@import`, `@reference`, `@plugin`, and `@config` all support `package.json` `"imports"`
  subpath aliases such as `@reference "#app.css";`.

## 4. Content and source detection

Tailwind treats source files as plain text, scans your project automatically from the current
working directory, and has no `content` array
([Detecting classes in source files](https://tailwindcss.com/docs/detecting-classes-in-source-files)).
By default it skips:

- Files matching rules in `.gitignore`
- `node_modules`
- Binary files (images, videos, `.zip`, standalone `@tailwindcss/cli` binaries)
- CSS files and package manager lock files
- `.env` and `.env.*` files (except `.env.example`, 4.2.3) and `.jj` directories (4.2.0)

```css
/* Set explicit base path (e.g. monorepos) or disable automatic scanning */
@import "tailwindcss" source("../src");
@import "tailwindcss" source(none);

/* Add or exclude paths (relative to the stylesheet) */
@source "../node_modules/@my-company/ui-lib"; /* add an ignored source */
@source not "./src/components/legacy"; /* exclude a path (4.1) */

/* Safelist or block specific classes with brace expansion (4.1) */
@source inline("underline");
@source inline("{hover:,focus:,}underline");
@source inline("{hover:,}bg-red-{50,{100..900..100},950}");
@source not inline("{hover:,focus:,}bg-red-{50,{100..900..100},950}");
```

- A directory named by an explicit `@source` is scanned even if git ignores it (4.3.1).
- A later `@source` can re-include files excluded by an earlier `@source not` (4.3.1).
- Patterns no longer scan unrelated sibling files and folders (4.3.2), and earlier `@source` rules
  that point to nested files are kept when a later one points to a parent folder (4.3.3).
- `corePlugins`, `safelist` and `separator` from a JS config are not supported
  ([Functions and directives](https://tailwindcss.com/docs/functions-and-directives)). Use
  `@source inline()` and `@source not inline()`.
- **Never construct class names dynamically:** `bg-${color}-600` or `"bg-" + color` will never be
  detected. Always map props to complete, unbroken class strings
  (`blue: "bg-blue-600 hover:bg-blue-500"`), or pass dynamic database/API values via inline CSS
  variables (`style={{ "--bg-color": buttonColor }}` with `bg-(--bg-color)`)
  ([Styling with utility classes](https://tailwindcss.com/docs/styling-with-utility-classes)).

## 5. Colours

- The default palette uses `oklch()`, providing a wider P3 gamut than sRGB
  ([Colors](https://tailwindcss.com/docs/colors)). Every default palette includes 11 steps (`50`,
  `100`–`900`, `950`).
- 4.2.0 added four neutral palettes to the default theme: `taupe`, `mauve`, `mist`, and `olive` (for
  example `bg-mauve-950 text-mauve-100`, `border-mist-200`, `shadow-taupe-950/10`).
- Opacity uses a slash modifier: `bg-black/50`, `text-white/75`, `border-blue-500/30`, arbitrary
  percentages `bg-pink-500/[71.37%]`, or CSS variables `bg-cyan-400/(--my-alpha-value)`
  ([Colors](https://tailwindcss.com/docs/colors)). The v3 `*-opacity-*` utilities were removed.
- You can use native `light-dark()` in arbitrary values:
  `bg-[light-dark(var(--color-white),var(--color-gray-950))]`.
- Fractional modifiers work on named shadow sizes since 4.3.3: `shadow-sm/12.5`,
  `text-shadow-sm/12.5`, `drop-shadow-sm/12.5`, `inset-shadow-sm/12.5`.
- 4.3.3 also stops achromatic theme colours from shifting hue when mixed in polar colour spaces such
  as `oklch`.
- Placeholder colour: v4 uses the current text colour at 50% opacity. Utilities read
  `--placeholder-color` (4.2.3). To restore the v3 grey:
  `@layer base { input::placeholder, textarea::placeholder { color: var(--color-gray-400); } }`.

## 6. Migrating from v3

Run the upgrade tool on a new branch, review the diff, then test in a browser
([Upgrade guide](https://tailwindcss.com/docs/upgrade-guide)). It requires Node 20 or higher:

```bash
npx @tailwindcss/upgrade
```

It updates dependencies, migrates your `tailwind.config.js` into CSS, and rewrites template files.
Since 4.2.3 it reads `config.content` and never touches files git ignores; since 4.3.0 it leaves
inline `style` attributes alone (`style="flex-grow: 1"` stays untouched); since 4.3.3 it no longer
rewrites ignored files when run from a subdirectory.

### Removed or deprecated utilities

| v3 class                                                                                                            | In 4.3.3                                                                        | Write instead                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `bg-opacity-*`, `text-opacity-*`, `border-opacity-*`, `divide-opacity-*`, `ring-opacity-*`, `placeholder-opacity-*` | **Generates nothing.** Silent failure.                                          | Opacity modifier: `bg-black/50`, `text-black/50`, `border-black/50`, `divide-black/50`, `ring-black/50`, `placeholder-black/50` |
| `flex-shrink-*`, `flex-grow-*`                                                                                      | Still compiles                                                                  | `shrink-*`, `grow-*`                                                                                                            |
| `overflow-ellipsis`                                                                                                 | Still compiles                                                                  | `text-ellipsis`                                                                                                                 |
| `decoration-slice`, `decoration-clone`                                                                              | Still compiles                                                                  | `box-decoration-slice`, `box-decoration-clone`                                                                                  |
| `break-words`                                                                                                       | Still compiles                                                                  | `wrap-break-word`. The upgrade tool migrates it since 4.1.15.                                                                   |
| `bg-gradient-to-*`                                                                                                  | Still compiles                                                                  | `bg-linear-to-*`                                                                                                                |
| `start-*`, `end-*`                                                                                                  | Still compiles (bare `start`/`end` with no value generates nothing since 4.3.0) | `inset-s-*`, `inset-e-*`                                                                                                        |
| `!flex`                                                                                                             | Still compiles                                                                  | `flex!`                                                                                                                         |

### Renamed utilities

The shadow, blur and radius scales shifted one step so every utility has a named value
([Upgrade guide](https://tailwindcss.com/docs/upgrade-guide)). The bare names still work, but `-sm`
looks different until you update it to `-xs`.

| v3                                  | v4                                     |
| ----------------------------------- | -------------------------------------- |
| `shadow-sm`, `shadow`               | `shadow-xs`, `shadow-sm`               |
| `drop-shadow-sm`, `drop-shadow`     | `drop-shadow-xs`, `drop-shadow-sm`     |
| `blur-sm`, `blur`                   | `blur-xs`, `blur-sm`                   |
| `backdrop-blur-sm`, `backdrop-blur` | `backdrop-blur-xs`, `backdrop-blur-sm` |
| `rounded-sm`, `rounded`             | `rounded-xs`, `rounded-sm`             |
| `outline-none`                      | `outline-hidden`                       |
| `ring`                              | `ring-3`                               |

### Changed defaults and behaviour

| Change                               | v3                                 | v4 and the fix                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------ | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Border and divide colour             | `gray-200`                         | `currentColor`. Always write the colour (`border border-gray-200`), or restore globally in `@layer base { *, ::after, ::before, ::backdrop, ::file-selector-button { border-color: var(--color-gray-200, currentColor); } }`.                                                                                                    |
| Ring                                 | 3px, `blue-500`                    | 1px, `currentColor`. Use `ring-3 ring-blue-500`. Compatibility only: `--default-ring-width: 3px; --default-ring-color: var(--color-blue-500);` in `@theme`.                                                                                                                                                                      |
| Outline                              | `outline` plus `outline-2`         | `outline` sets `1px`. Every `outline-<number>` defaults `outline-style` to `solid` (no bare `outline` needed). `outline-none` sets `outline-style: none`; the old accessible invisible outline is `outline-hidden`.                                                                                                              |
| Placeholder colour                   | `gray-400`                         | Current text colour at 50% opacity.                                                                                                                                                                                                                                                                                              |
| Button cursor                        | `pointer`                          | `default`. Restore with `@layer base { button:not(:disabled), [role="button"]:not(:disabled) { cursor: pointer; } }`.                                                                                                                                                                                                            |
| Dialog margins                       | Browser default                    | Reset to `0`. Restore centring with `@layer base { dialog { margin: auto; } }`.                                                                                                                                                                                                                                                  |
| `hidden` attribute                   | Lost to `block` and `flex`         | `[hidden]:where(:not([hidden="until-found"])) { display: none !important; }` wins over display utilities. Remove the `hidden` attribute to reveal the element.                                                                                                                                                                   |
| `space-*` and `divide-*`             | `:not([hidden]) ~ :not([hidden])`  | `:not(:last-child)` with `margin-bottom`/`margin-right` or `border-bottom-width`/`border-right-width` for large-page performance. Prefer `flex` or `grid` with `gap`.                                                                                                                                                            |
| `hover:`                             | Applies on tap                     | Wrapped in `@media (hover: hover)`. Restore with `@custom-variant hover (&:hover);`, but treat hover as an enhancement.                                                                                                                                                                                                          |
| `transition`, `transition-colors`    | No outline colour                  | Include `outline-color`. Set the outline colour unconditionally (`outline-cyan-500 transition hover:outline-2`) to avoid transitioning from `currentColor`.                                                                                                                                                                      |
| Transforms                           | Composed `transform`               | `rotate-*`, `scale-*`, `translate-*` set separate CSS `rotate`, `scale`, and `translate` properties. No bare `transform` class needed.                                                                                                                                                                                           |
| Resetting transforms                 | `transform-none`                   | Reset each property individually: `scale-none`, `rotate-none`, `translate-none`.                                                                                                                                                                                                                                                 |
| Transition lists                     | `transition-[opacity,transform]`   | `transition-[opacity,scale]`. List the individual properties. `transition-transform` already covers `transform`, `translate`, `scale` and `rotate` (verified).                                                                                                                                                                   |
| Gradient variants                    | A variant reset the whole gradient | Stops persist across variants. Use `dark:via-none` to drop a middle stop back to a two-stop gradient.                                                                                                                                                                                                                            |
| `container` options                  | `center`, `padding` in config      | Gone. Extend with `@utility container { margin-inline: auto; padding-inline: 2rem; }` (section 3).                                                                                                                                                                                                                               |
| Grid and `object-*` arbitrary values | `grid-cols-[max-content,auto]`     | Commas are no longer converted to spaces in `grid-cols-*`, `grid-rows-*`, and `object-*`: write `grid-cols-[max-content_auto]`.                                                                                                                                                                                                  |
| CSS variables in arbitrary values    | `bg-[--brand]`                     | `bg-(--brand)`. If ambiguous between length/shadow and color, add a type hint: `text-(length:--my-var)` vs `text-(color:--my-var)`, or `shadow-(--my-shadow)` vs `shadow-(color:--my-color)` ([Adding custom styles](https://tailwindcss.com/docs/adding-custom-styles), [box-shadow](https://tailwindcss.com/docs/box-shadow)). |
| Stacked variants                     | Right to left: `first:*:pt-0`      | Left to right: `*:first:pt-0`.                                                                                                                                                                                                                                                                                                   |
| Important                            | `!flex`                            | `flex!` at the very end (`hover:bg-red-600/50!`). The old `!flex` still compiles. Global flag: `@import "tailwindcss" important;`.                                                                                                                                                                                               |
| Prefix                               | `tw-flex`, `hover:tw-bg-red-500`   | `tw:flex`, `tw:hover:bg-red-500`, declared with `@import "tailwindcss" prefix(tw);`. Write `@theme` tokens without the prefix; emitted `:root` variables receive it (`--tw-color-brand`).                                                                                                                                        |
| Custom utilities                     | `@layer utilities { .x {} }`       | `@utility x {}` for variant-aware utilities; `@layer components` is a native cascade layer.                                                                                                                                                                                                                                      |
| `theme()`, JS config                 | Automatic                          | `theme()` deprecated. A legacy JS config loads only via `@config "../../tailwind.config.js";`; `@plugin "@tailwindcss/typography";` loads a JS plugin. `corePlugins`, `safelist`, `separator` and `resolveConfig` are gone.                                                                                                      |
| Sass, Less, Stylus                   | Worked                             | Not supported ([Compatibility](https://tailwindcss.com/docs/compatibility)).                                                                                                                                                                                                                                                     |

## 7. What each version added

| Version                                                                   | Added                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [4.0](https://tailwindcss.com/blog/tailwindcss-v4) (22 Jan 2025)          | CSS-first `@theme`, `@utility`, `@custom-variant`, `@variant`, `@reference`; Oxide engine and `@tailwindcss/vite`; built-in `@container` queries (`@sm:`, `@max-*`, `@min-*:@max-*`); dynamic spacing, `grid-cols-*`, and `data-*` values; OKLCH palette; `bg-linear-*` (including angles like `bg-linear-45` and interpolation modifiers `/srgb`, `/oklch`, `/oklab`, `/hsl`), `bg-radial-*`, `bg-conic-*`; `inset-shadow-*`, `inset-ring-*`; 3D transforms (`rotate-x-*`, `rotate-y-*`, `rotate-z-*`, `scale-z-*`, `translate-z-*`, `perspective-*`, `perspective-origin-*`, `transform-3d`, `backface-*`); `not-*`, `in-*`, `nth-*`, `starting` (`@starting-style`), `inert`, `open` (including `:popover-open`), and `**` (all-descendants) variants; `transition-discrete` / `transition-normal` ([transition-behavior](https://tailwindcss.com/docs/transition-behavior)); `field-sizing-content` / `field-sizing-fixed`, `scheme-*`, `font-stretch-*`.                                                                                                                 |
| [4.1](https://tailwindcss.com/blog/tailwindcss-v4-1) (3 Apr 2025)         | `text-shadow-*` (`2xs` to `lg`, colours, and alpha); composable `mask-*` utilities (`mask-image`, `mask-composite`, `mask-mode`, `mask-type`, `mask-clip`, `mask-origin`, `mask-position`, `mask-repeat`, `mask-size`); `shadow-*/<alpha>`, `inset-shadow-*/<alpha>`, `drop-shadow-*/<alpha>`, `text-shadow-*/<alpha>`; `drop-shadow-<color>`; safe alignment (`justify-center-safe`, `items-center-safe`); `items-baseline-last`, `self-baseline-last`; `wrap-anywhere`, `wrap-break-word`, `wrap-normal`; variants `pointer-fine`, `pointer-coarse`, `pointer-none`, `any-pointer-fine`, `any-pointer-coarse`, `any-pointer-none`, `details-content`, `inverted-colors`, `noscript`, `user-valid`, `user-invalid`; `@source not` and `@source inline()`; older Safari/Firefox fallbacks; `bg-position-*` and `bg-size-*` for arbitrary values. 4.1.4 added `shadow-inherit` and its siblings; 4.1.5 added `h-lh`, `min-h-lh`, `max-h-lh`; 4.1.15 fixed named groups with `not-*`, `has-*`, and `in-*` ([#15772](https://github.com/tailwindlabs/tailwindcss/issues/15772)). |
| [4.2](https://github.com/tailwindlabs/tailwindcss/releases) (18 Feb 2026) | `mauve`, `olive`, `mist`, `taupe` palettes; `@tailwindcss/webpack`; logical block utilities `pbs-*`, `pbe-*`, `mbs-*`, `mbe-*`, `scroll-pbs-*`, `scroll-pbe-*`, `scroll-mbs-*`, `scroll-mbe-*`, `border-bs-*`, `border-be-*`; logical size utilities `inline-*`, `min-inline-*`, `max-inline-*`, `block-*`, `min-block-*`, `max-block-*`; `inset-s-*`, `inset-e-*`, `inset-bs-*`, `inset-be-*`; `font-features-*`; `aspect-*` fractions in multiples of `.25`. Deprecated: `start-*`, `end-*`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| [4.3](https://github.com/tailwindlabs/tailwindcss/releases) (8 May 2026)  | `@container-size`; `scrollbar-auto`, `scrollbar-thin`, `scrollbar-none`, `scrollbar-thumb-*`, `scrollbar-track-*`, `scrollbar-gutter-auto`, `scrollbar-gutter-stable`, `scrollbar-gutter-both`; `zoom-*`; `tab-*`; `@variant hover:focus` and `@variant hover, focus`; `--default()` in `--value()` and `--modifier()`. Patches: `--silent` CLI flag, `@apply` with CSS mixins, `m-0` to `0` and `m-1` to `var(--spacing)` (4.3.1); bare `auto-rows-12` and `auto-cols-16`, `--opacity` modifier suggestions (4.3.2); `--watch --poll`, fractional shadow opacity (`shadow-sm/12.5`), case-insensitive hex canonicalization, `--spacing(0)` to `0px` (4.3.3).                                                                                                                                                                                                                                                                                                                                                                                                                 |

## 8. Utility reference

### Gradients

```html
<div class="bg-linear-to-r from-indigo-500 to-pink-500"></div>
<div class="bg-linear-45 from-indigo-500 to-pink-500"></div>
<div class="bg-linear-[135deg] from-blue-500 to-green-500"></div>
<div class="bg-linear-to-r/oklch from-indigo-500 to-teal-400"></div>
<!-- interpolation: srgb, hsl, oklch, oklab (default) -->
<div class="bg-radial from-white to-zinc-900 to-75%"></div>
<div class="bg-radial-[at_25%_25%] from-white to-zinc-900"></div>
<div class="bg-conic from-red-500 to-blue-500"></div>
<div class="bg-conic/[in_hsl_longer_hue] from-red-600 to-red-600"></div>
```

### Shadows, rings and masks ([box-shadow](https://tailwindcss.com/docs/box-shadow), [text-shadow](https://tailwindcss.com/docs/text-shadow), [mask-image](https://tailwindcss.com/docs/mask-image))

```html
<!-- Box shadows, inset shadows, rings and drop shadows -->
<div class="shadow-md ring-1 inset-shadow-sm inset-ring-1 ring-black/5"></div>
<!-- 4 composable shadow layers -->
<div class="inset-shadow-xs inset-ring-2 inset-ring-blue-500"></div>
<!-- inset-shadow sizes: 2xs, xs, sm only -->
<div class="shadow-(--my-shadow) shadow-(color:--my-shadow-color)"></div>
<!-- CSS variable value vs color -->
<div class="drop-shadow-xl drop-shadow-cyan-500/50"></div>
<p class="text-shadow-lg/50 text-shadow-md text-shadow-sky-300"></p>
<!-- text-shadow sizes: 2xs, xs, sm, md, lg -->

<!-- Composable masks (4.1): edge, angled linear, radial and conic -->
<div class="mask-t-from-50% mask-b-to-80%"></div>
<!-- sides: t, r, b, l, x, y -->
<div class="mask-x-from-70% mask-x-to-90%"></div>
<div class="mask-linear-50 mask-linear-from-60% mask-linear-to-80%"></div>
<!-- angled linear (also -mask-linear-50) -->
<div
  class="mask-radial-from-transparent mask-radial-from-15% mask-radial-to-black mask-radial-to-55% mask-radial-at-right"
></div>
<div
  class="mask-radial-from-100% mask-circle mask-radial-closest-side mask-radial-at-[30%_30%]"
></div>
<div class="mask-conic-from-75% mask-conic-to-75%"></div>
<!-- conic mask (also mask-conic-45) -->
<div class="mask-b-from-50% mask-radial-from-70% mask-radial-to-85%"></div>
<!-- composes via mask-composite: intersect -->
<div class="mask-none mask-add mask-alpha mask-type-luminance"></div>
<!-- mask-add, -subtract, -intersect, -exclude -->
```

### 3D transforms

```html
<div class="perspective-distant">
  <!-- perspective-near, perspective-normal, perspective-distant -->
  <div class="rotate-x-51 rotate-z-43 transform-3d"></div>
</div>
<div class="translate-z-4 scale-z-50 rotate-x-12 rotate-y-45 rotate-z-6 backface-hidden"></div>
<!-- backface-visible also exists -->
<div class="perspective-origin-top"></div>
<!-- also perspective-origin-left, -right, -bottom, -top-left, etc. -->
<div class="scale-110 rotate-45"></div>
<!-- v4: no bare transform class needed -->
```

### Spacing, sizing and ambiguity hints

- Every multiple of `--spacing` works dynamically: `mt-21`, `w-17`, `px-13`, `gap-7`, `h-23`,
  `size-1234`, `grid-cols-15`, `auto-rows-12`, `auto-cols-16`.
- `aspect-8.5/11` works: fractions accept multiples of `.25` (4.2.0).
- `h-lh`, `min-h-lh`, `max-h-lh` size an element to its line-height (4.1.5).
- When a CSS variable in an arbitrary value is ambiguous between utilities sharing a prefix, add a
  CSS data-type hint ([Adding custom styles](https://tailwindcss.com/docs/adding-custom-styles)):
  `text-(length:--my-var)` (generates `font-size`) vs `text-(color:--my-var)` (generates `color`),
  or `shadow-(--my-var)` vs `shadow-(color:--my-var)`.
- To preserve a literal underscore where spaces are also valid, escape it with a backslash
  (`before:content-['hello\_world']`), or in JSX use
  `className={String.raw`before:content-['hello\_world']`}`
  ([Adding custom styles](https://tailwindcss.com/docs/adding-custom-styles)).

### Typography, scrolling and layout

| Utilities                                                                                                                                                                               | Notes                                                                                                                                                                                                                                                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `font-features-['smcp']`, `font-features-['smcp','onum']`, `font-features-(--my-features)`                                                                                              | Escape hatch for OpenType `font-feature-settings` ([font-feature-settings](https://tailwindcss.com/docs/font-feature-settings), 4.2.0). Prefer `tabular-nums` and dedicated utilities first.                                                                                                               |
| `font-stretch-extra-condensed`, `font-stretch-condensed`, `font-stretch-normal`, `font-stretch-expanded`, `font-stretch-extra-expanded`, `font-stretch-50%`                             | Width axis of variable fonts ([font-stretch](https://tailwindcss.com/docs/font-stretch), 4.0).                                                                                                                                                                                                             |
| `wrap-break-word`, `wrap-anywhere`, `wrap-normal`                                                                                                                                       | `overflow-wrap` ([overflow-wrap](https://tailwindcss.com/docs/overflow-wrap), 4.1). `wrap-anywhere` allows mid-word breaks when calculating intrinsic size, replacing `min-w-0` in flex children.                                                                                                          |
| `field-sizing-content`, `field-sizing-fixed`                                                                                                                                            | Auto-resize `<textarea>` or `<input>` to fit its content without JS, or lock it to a fixed size ([field-sizing](https://tailwindcss.com/docs/field-sizing), 4.0).                                                                                                                                          |
| `scheme-normal`, `scheme-light`, `scheme-dark`, `scheme-light-dark`, `scheme-only-light`, `scheme-only-dark`                                                                            | Sets `color-scheme` so native controls and scrollbars match ([color-scheme](https://tailwindcss.com/docs/color-scheme), 4.0). There is no `color-scheme-*` utility.                                                                                                                                        |
| `tab-2`, `tab-4`, `tab-8`, `tab-[12px]`, `tab-(--my-tab-size)`                                                                                                                          | Tab-character width ([tab-size](https://tailwindcss.com/docs/tab-size), 4.3.0). Any bare number compiles (`tab-size: <number>`), plus `--tab-size-*` theme keys.                                                                                                                                           |
| `scrollbar-auto`, `scrollbar-thin`, `scrollbar-none`, `scrollbar-thumb-sky-700`, `scrollbar-track-sky-100`, `scrollbar-gutter-auto`, `scrollbar-gutter-stable`, `scrollbar-gutter-both` | Native scrollbar width ([scrollbar-width](https://tailwindcss.com/docs/scrollbar-width)), colour ([scrollbar-color](https://tailwindcss.com/docs/scrollbar-color)), and gutter space ([scrollbar-gutter](https://tailwindcss.com/docs/scrollbar-gutter)) added in 4.3.0. Colours accept opacity modifiers. |
| `zoom-75`, `zoom-100`, `zoom-125`, `zoom-[1.1]`, `zoom-(--my-zoom)`                                                                                                                     | Scales elements via CSS `zoom: <number>%` ([zoom](https://tailwindcss.com/docs/zoom), 4.3.0).                                                                                                                                                                                                              |
| `items-baseline-last`, `self-baseline-last`                                                                                                                                             | Align flex or grid items to the last text baseline (4.1).                                                                                                                                                                                                                                                  |
| `justify-center-safe`, `items-center-safe`                                                                                                                                              | Centre content in flex/grid layouts and switch to `start` alignment on overflow so content stays reachable (4.1).                                                                                                                                                                                          |
| `transition-discrete`, `transition-normal`                                                                                                                                              | Controls `transition-behavior` so discrete properties like `display` can animate alongside `starting:` ([transition-behavior](https://tailwindcss.com/docs/transition-behavior), 4.0).                                                                                                                     |

### Logical properties (4.2.0)

| Physical idea                         | Utilities                                                                                        |
| ------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Padding and margin, block axis        | `pbs-4`, `pbe-8`, `mbs-6`, `mbe-2`                                                               |
| Border, block axis                    | `border-bs`, `border-be`, `border-bs-2`, `border-be-4`                                           |
| Scroll padding and margin, block axis | `scroll-pbs-4`, `scroll-pbe-4`, `scroll-mbs-4`, `scroll-mbe-4`                                   |
| Inset (inline and block)              | `inset-s-4`, `inset-e-4`, `inset-bs-0`, `inset-be-0`                                             |
| Size (inline and block)               | `inline-64`, `min-inline-0`, `max-inline-full`, `block-32`, `min-block-screen`, `max-block-none` |

`start-*` and `end-*` are deprecated in favour of `inset-s-*` and `inset-e-*`. They still compile
when given a value, but a legacy `start` or `end` with no value generates no CSS (4.3.0).

## 9. Variants

Stack variants left to right, like CSS
([Hover, focus, and other states](https://tailwindcss.com/docs/hover-focus-and-other-states)):
`*:first:pt-0`, `dark:lg:data-current:hover:bg-indigo-600`.

| Variant                                                      | Example                                                                                                                                                              | Notes                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `not-*`                                                      | `not-hover:opacity-75`, `hover:not-focus:bg-indigo-700`, `not-supports-[display:grid]:flex`, `not-dark:text-gray-900`                                                | Wraps `:not()`, or negates `@media`, `@supports`, and (since 4.3.1) `@container` and `style()` queries (4.0).                                                                                                                                                                                       |
| `in-*`                                                       | `in-focus:opacity-100`, `in-[.sidebar]:text-sm`, `in-data-active:font-bold`                                                                                          | Implicit group: responds to state changes in any ancestor without needing a `group` class (4.0).                                                                                                                                                                                                    |
| `has-*`, `group-has-*`, `peer-has-*`                         | `has-checked:bg-indigo-50`, `has-[:focus]:ring-2`, `group-has-[a]:block`, `peer-has-checked:hidden`                                                                  | Style based on descendants of the element, a `.group` ancestor, or a preceding `.peer` sibling. Use instead of `[&:has(...)]:`.                                                                                                                                                                     |
| Named groups and peers                                       | `group-hover/item:visible`, `peer-checked/draft:text-sky-500`, `not-group-hover/card:underline`, `group-has-checked/card:block`, `not-group-has-checked/card:hidden` | Mark the parent with `group/item` or preceding sibling with `peer/draft`. Since 4.1.15 ([#15772](https://github.com/tailwindlabs/tailwindcss/issues/15772)), `/name` modifiers on `not-group-*`, `group-has-*`, `not-group-has-*`, and `in-group-*` forward cleanly to the group selector.          |
| `nth-*`, `nth-last-*`, `nth-of-type-*`, `nth-last-of-type-*` | `nth-3:underline`, `nth-last-5:underline`, `nth-of-type-4:underline`, `nth-[2n+1_of_li]:font-bold`                                                                   | Accepts any integer out of the box or arbitrary expressions (4.0).                                                                                                                                                                                                                                  |
| `starting`                                                   | `starting:opacity-0 starting:translate-y-2 transition-all`                                                                                                           | `@starting-style`: animate when first displayed or from `display: none` (4.0). For popovers: `transition-discrete starting:open:opacity-0`.                                                                                                                                                         |
| `open`                                                       | `open:opacity-100`                                                                                                                                                   | Matches open `<details>`, `<dialog>` and `:popover-open` popovers (4.0).                                                                                                                                                                                                                            |
| `inert`                                                      | `inert:opacity-50 inert:pointer-events-none`                                                                                                                         | Matches elements with the `inert` attribute (4.0).                                                                                                                                                                                                                                                  |
| `**`                                                         | `**:text-sm`, `**:data-avatar:size-12`                                                                                                                               | Styles every descendant (`& *`), whereas `*` styles direct children (`& > *`) (4.0).                                                                                                                                                                                                                |
| `data-*`                                                     | `data-current:font-bold`, `data-[state=active]:bg-blue-500`                                                                                                          | Any boolean or valued `data-*` attribute works dynamically with no config (4.0).                                                                                                                                                                                                                    |
| `pointer-*`, `any-pointer-*`                                 | `pointer-fine:p-2`, `pointer-coarse:p-4`, `pointer-none:...`, `any-pointer-fine:...`, `any-pointer-coarse:...`, `any-pointer-none:...`                               | Added in 4.1 ([v4.1 blog](https://tailwindcss.com/blog/tailwindcss-v4-1), [Hover, focus, and other states](https://tailwindcss.com/docs/hover-focus-and-other-states)). `pointer-*` checks the primary input device (mouse vs touchscreen); `any-pointer-*` checks if any connected device matches. |
| `user-valid`, `user-invalid`                                 | `border user-valid:border-green-500 user-invalid:border-red-500`                                                                                                     | `:user-valid` and `:user-invalid` — applies validation styling only after the user interacts with the field (4.1).                                                                                                                                                                                  |
| `details-content`                                            | `details-content:mt-3 details-content:-ml-0.5`                                                                                                                       | Styles the content wrapper of a `<details>` element (4.1).                                                                                                                                                                                                                                          |
| `inverted-colors`                                            | `shadow-xl inverted-colors:shadow-none`                                                                                                                              | Matches OS inverted-color mode (4.1).                                                                                                                                                                                                                                                               |
| `noscript`                                                   | `hidden noscript:block`                                                                                                                                              | Matches when JavaScript is disabled in the browser (4.1).                                                                                                                                                                                                                                           |

## 10. Dark mode

The `dark:` variant follows the `prefers-color-scheme` CSS media feature by default
([Dark mode](https://tailwindcss.com/docs/dark-mode)). It is **not** class-based until you override
it.

```html
<div class="bg-white dark:bg-gray-800">...</div>
```

To drive dark mode from a `.dark` class on an ancestor (such as `<html class="dark">`), override the
variant once in your CSS:

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```

Or from a `data-theme="dark"` attribute:

```css
@import "tailwindcss";
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
```

For a three-way light, dark and system toggle, place this script inline in `<head>` to avoid a flash
of unstyled content ([Dark mode](https://tailwindcss.com/docs/dark-mode)):

```js
document.documentElement.classList.toggle(
  "dark",
  localStorage.theme === "dark"
    || (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches),
);

localStorage.theme = "light"; // explicit light
localStorage.theme = "dark"; // explicit dark
localStorage.removeItem("theme"); // follow OS preference
```

You can also define semantic design tokens in CSS variables that switch on `[data-theme="dark"]` or
`@media (prefers-color-scheme: dark)` and expose them with `@theme inline`
([Colors](https://tailwindcss.com/docs/colors)). Pair dark mode with `scheme-dark` or
`scheme-light-dark` so native form controls and scrollbars match.

## 11. Responsive design and container queries

### Viewport breakpoints ([Responsive design](https://tailwindcss.com/docs/responsive-design))

Tailwind is mobile-first: unprefixed utilities (`text-center`) target all screens including mobile;
prefixed utilities (`sm:text-left`) apply at that breakpoint and wider.

| Prefix | Minimum width    | Range / max variant                                                    |
| ------ | ---------------- | ---------------------------------------------------------------------- |
| `sm:`  | `40rem` (640px)  | `max-sm:` (`width < 40rem`)                                            |
| `md:`  | `48rem` (768px)  | `max-md:` (`width < 48rem`), e.g. `md:max-xl:flex`                     |
| `lg:`  | `64rem` (1024px) | `max-lg:` (`width < 64rem`), e.g. `md:max-lg:flex` (single breakpoint) |
| `xl:`  | `80rem` (1280px) | `max-xl:` (`width < 80rem`)                                            |
| `2xl:` | `96rem` (1536px) | `max-2xl:` (`width < 96rem`)                                           |

- Always define custom `--breakpoint-*` tokens in `rem` so generated media queries sort in the
  expected order ([Responsive design](https://tailwindcss.com/docs/responsive-design)).
- For one-off breakpoints, use `min-[320px]:text-center` and `max-[600px]:bg-sky-300`.

### Container queries ([Responsive design](https://tailwindcss.com/docs/responsive-design))

Built into core, no plugin needed. Default container sizes run from `@3xs` (`16rem` / 256px), `@2xs`
(`18rem`), `@xs` (`20rem`), `@sm` (`24rem`), `@md` (`28rem`), `@lg` (`32rem`), `@xl` (`36rem`),
`@2xl` (`42rem`), `@3xl` (`48rem`), `@4xl` (`56rem`), `@5xl` (`64rem`), `@6xl` (`72rem`) up to
`@7xl` (`80rem` / 1280px).

```html
<div class="@container">
  <div class="grid grid-cols-1 @sm:grid-cols-3 @lg:grid-cols-4"></div>
</div>

<div class="grid grid-cols-3 @max-md:grid-cols-1"></div>
<!-- max-width query -->
<div class="flex @sm:@max-md:flex-col"></div>
<!-- range -->
<div class="flex @min-[475px]:flex-row"></div>
<!-- arbitrary min/max width -->

<div class="@container/main">
  <div class="@sm/main:text-lg"></div>
  <!-- named container -->
</div>

<div class="@container-size">
  <div class="h-[50cqb]"></div>
  <!-- size container for cqb/cqh units (4.3.0) -->
</div>
```

- `@container` creates an `inline-size` container. `@container-size` (or `@container-size/{name}`,
  added in 4.3.0) and `@container-[size]` emit `container-type: size`, which is required when
  children use block-axis container query length units like `cqb` or `cqh`.
- Built-in `@*` variants query container width. For a container height query, use an arbitrary
  variant such as `[@container_(height>384px)]:flex-col` (verified on 4.3.3).

## 12. Canonical class names

Tailwind's canonicalizer, used by `@tailwindcss/upgrade` and editor linting, rewrites class lists to
their preferred v4 form. Write the canonical form directly.

| Write                                                     | Not                                                                      | Since                                   |
| --------------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------- |
| `p-[1.2rem]`                                              | `px-[1.2rem] py-[1.2rem]`                                                | 4.2.3                                   |
| `py-4`, `px-4`, `p-4`                                     | `pt-4 pb-4`, `pl-4 pr-4`, all four sides                                 | Shorthand                               |
| `border-y-2`, `border-x-2`, `border-2`                    | `border-t-2 border-b-2`, `border-l-2 border-r-2`, all four               | 4.2.3                                   |
| `scroll-my-4`, `scroll-mx-4`, `scroll-m-4`                | `scroll-mt-4 scroll-mb-4`, `scroll-ml-4 scroll-mr-4`, all four           | 4.2.3                                   |
| `scroll-py-4`, `scroll-px-4`, `scroll-p-4`                | `scroll-pt-4 scroll-pb-4`, `scroll-pl-4 scroll-pr-4`, all four           | 4.2.3                                   |
| `overflow-hidden`, `overflow-auto`                        | `overflow-x-hidden overflow-y-hidden`, `overflow-x-auto overflow-y-auto` | 4.2.3                                   |
| `overscroll-none`                                         | `overscroll-x-none overscroll-y-none`                                    | 4.2.3                                   |
| `size-5`, `size-1234`                                     | `w-5 h-5`, `w-1234 h-1234`                                               | 4.2.2                                   |
| `text-sm/6`                                               | `text-sm leading-6`                                                      | 4.1.18                                  |
| `tracking-wider`                                          | `-tracking-tighter`                                                      | 4.2.3                                   |
| `text-ellipsis`                                           | `overflow-ellipsis`                                                      | 4.2.3                                   |
| `inset-s-4`, `inset-s-px`, `inset-s-auto`, `inset-s-full` | `start-4`, `start-px`, `start-auto`, `start-full`                        | 4.2.3                                   |
| `inset-e-4`, `inset-e-px`, `inset-e-auto`, `inset-e-full` | `end-4`, `end-px`, `end-auto`, `end-full`                                | 4.2.3                                   |
| `left-[-9rem]`                                            | `-left-[9rem]`                                                           | 4.2.3                                   |
| `-ml-(--width)`                                           | `ml-[calc(-1*var(--width))]`                                             | 4.2.3                                   |
| `mt-[-20in]`                                              | `-mt-[20in]`                                                             | 4.3.0 keeps the unit (no px conversion) |
| `w-[calc(100%-(--spacing(60)))]`                          | `w-[calc(100%---spacing(60))]`                                           | 4.3.0 adds parens for readability       |
| `has-[...]:flex`                                          | `[&:has(...)]:flex`                                                      | 4.3.0                                   |
| `bg-white`                                                | `bg-[#fff]`, `bg-[#FFF]`                                                 | 4.3.3 matches hex case-insensitively    |
| `--spacing(4)`                                            | `calc(var(--spacing)*4)`                                                 | 4.2.2                                   |
| `wrap-break-word`                                         | `break-words`                                                            | 4.1.15                                  |

The canonicalizer is conservative on purpose. It keeps `left-[99999px]` instead of inventing
`left-24999.75`, does not fold `calc(100%/3.5)` into a long decimal, and never suggests an invalid
`calc(...)` (4.3.1). Do not hand-convert plain HTML `style="..."` attributes either; the tool leaves
them alone.

## 13. Browser targets, Preflight control and editor tooling

- **Browsers ([Compatibility](https://tailwindcss.com/docs/compatibility)):** Chrome 111+ (Mar
  2023), Safari 16.4+ (Mar 2023), Firefox 128+ (Jul 2024). Core features depend on `@property` and
  `color-mix()`. For older browser requirements, stay on v3.4. Since 4.1
  ([v4.1 blog](https://tailwindcss.com/blog/tailwindcss-v4-1)), Tailwind emits fallbacks for `oklab`
  colors, opacity modifiers, explicit gradient interpolation, and `@property`-backed
  shadows/transforms so pages degrade gracefully on older Safari and Firefox. Bleeding-edge
  utilities like `field-sizing-content`, `starting:`, and `text-balance` depend on host browser
  support.
- **Disabling Preflight ([Preflight](https://tailwindcss.com/docs/preflight)):**
  `@import "tailwindcss";` expands to `@layer theme, base, components, utilities;` followed by
  `tailwindcss/theme.css`, `tailwindcss/preflight.css`, and `tailwindcss/utilities.css`. To disable
  Preflight when adding Tailwind to an existing site, omit `preflight.css` and attach import
  modifiers to their respective files:

  ```css
  @layer theme, base, components, utilities;
  @import "tailwindcss/theme.css" layer(theme);
  @import "tailwindcss/utilities.css" layer(utilities);
  ```

  When importing files individually, `theme(static)` and `theme(inline)` go on `theme.css`;
  `source(...)` and `important` go on `utilities.css`; `prefix(tw)` goes on **both** `theme.css` and
  `utilities.css`.

- **Spacing output (4.3.1 & 4.3.3):** `m-0` compiles to `0` and `m-1` to `var(--spacing)`. Update
  any snapshot tests of compiled CSS. In 4.3.3, `--spacing(0)` compiles to `0px` so it stays a
  `<length>` inside `calc()`.
- **Fonts and iframe focus (4.3.3):** Preflight uses explicit platform fonts
  (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", ...`)
  instead of `system-ui` and `ui-sans-serif`, so CJK text follows the page `lang` on Windows. It
  also stops overriding Firefox's native `iframe:focus-visible` outline.
- **Editor setup and Prettier ([Editor setup](https://tailwindcss.com/docs/editor-setup)):** use the
  official `Tailwind CSS IntelliSense` extension in VS Code or Cursor (which provides a dedicated
  `Tailwind CSS` language mode for `@theme`, `@utility`, `@variant`, `@custom-variant`, and
  `@source`), or Zed's built-in Tailwind support. Class suggestions include named opacity modifiers
  from `--opacity-*` theme values (4.3.2). Pair with `prettier-plugin-tailwindcss` to automatically
  sort classes into the recommended order and strip duplicate classes and extra whitespace
  ([Tailwind Blog](https://tailwindcss.com/blog)).
- **Watching files (4.3.3):** if filesystem events are unreliable (containers, network mounts), pass
  `--watch --poll[=ms]` to `@tailwindcss/cli`. Never run the CLI from `/` in a Docker container
  ([#17781](https://github.com/tailwindlabs/tailwindcss/issues/17781)).

## 14. Class safety: stop invented classes

Tailwind generates CSS only for class names it recognises. An unrecognised name produces no CSS and
no error, so an invented or misspelled class silently removes padding, margin, sizing or
positioning. Everything in the tables below was verified with the compiler of `tailwindcss` 4.3.3.

### Invented classes that generate nothing

| Invented or v3-only                                             | Use instead                                                                                             |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `flex-center`                                                   | `flex items-center justify-center`                                                                      |
| `absolute-center`, `top-center`, `inset-center`                 | `absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`                                           |
| `p-x-4`, `padding-4`, `margin-4`                                | `px-4`, `p-4`, `m-4`                                                                                    |
| `mx-center`, `container-center`, `px-container`                 | `mx-auto`; `container mx-auto px-4`                                                                     |
| `text-bold`                                                     | `font-bold`                                                                                             |
| `items-middle`, `justify-middle`, `text-middle`, `align-center` | `items-center`, `justify-center`, `text-center`, `align-middle` (inline/table vertical alignment)       |
| `gap-xs`, `mt-xl`, `p-lg`                                       | Numeric steps: `gap-1`, `mt-8`, `p-6`                                                                   |
| `text-xxl`, `text-3xs`                                          | `text-2xl`, `text-xs`                                                                                   |
| `bg-gray-250`                                                   | Shades are `50`, then `100` to `900` in steps of 100, then `950`: `bg-gray-300`                         |
| `grid-cols-auto`, `col-span-all`                                | `grid-cols-[repeat(auto-fit,minmax(16rem,1fr))]`, `col-span-full`                                       |
| `max-w-container`                                               | `max-w-7xl mx-auto px-4`, or define `--container-*` / `--spacing-*` in `@theme` first                   |
| `bg-opacity-50`, `hover:bg-opacity-75`                          | `bg-black/50`, `hover:bg-black/75`                                                                      |
| `inset-shadow-md`, `inset-shadow-lg`                            | `inset-shadow-2xs`, `inset-shadow-xs`, or `inset-shadow-sm`                                             |
| `color-scheme-dark`, `color-scheme-light`                       | `scheme-dark`, `scheme-light`, `scheme-light-dark`                                                      |
| `3xl:grid-cols-4`                                               | Generates nothing until `--breakpoint-3xl` is defined in `@theme` (section 3). `2xl:` works by default. |
| Any class without `tw:` in a project that sets `prefix(tw)`     | `tw:flex`                                                                                               |

### Real classes that only look invented

These all compile on 4.3.3, so do not "correct" them: `h-100`, `w-100`, `z-100`, `px-13`, `mt-21`,
`size-1234`, `grid-cols-15`, `auto-rows-12`, `tab-4`, `scrollbar-thin`, `scrollbar-gutter-stable`,
`inset-s-4`, `pbs-4`, `scheme-dark`, `text-shadow-md`, `mask-t-from-50%`. Any whole-number multiple
of `--spacing` is valid.

The old names in section 6 (`flex-shrink-*`, `overflow-ellipsis`, `break-words`, `bg-gradient-to-*`,
`start-*`, `!flex` and the rest) still compile, so they will not break a page, but write the v4
form.

### Rules for AI assistants

1. Use only utilities you can name from the Tailwind docs. If you cannot recall an exact class, use
   an arbitrary value (`p-[17px]`, `top-(--header-height)`) or plain CSS. Never guess a name.
2. Do not mix v3 and v4 spellings and do not invent shorthands for combinations of utilities.
3. Write complete class strings. A class built as `"bg-" + color` is never generated.
4. Set spacing, type and positioning explicitly (section 15). Preflight gives you nothing by
   default.
5. Run the checker in section 16 on every file you generate and fix each `UNKNOWN` class before you
   call the work done.
6. A class that compiles can still look wrong. Check the rendered page, not just the build.

## 15. Why pages lose padding, margins and positioning

| Symptom                                                                                  | Cause (verified on 4.3.3 & [Preflight docs](https://tailwindcss.com/docs/preflight))                                             | Fix                                                                                                                                                                          |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No space around headings or paragraphs                                                   | Preflight sets `margin: 0` and `padding: 0` on every element, with `box-sizing: border-box`                                      | Add spacing yourself: `mt-4`, `mb-2`, `space-y-4`, or `flex flex-col gap-4`                                                                                                  |
| Lists show no bullets, numbers or indent (and VoiceOver does not announce them as lists) | Preflight sets `list-style: none` on `ol`, `ul` and `menu`                                                                       | Add `list-disc pl-6` or `list-decimal pl-6`; if keeping a list unstyled, add `role="list"` for VoiceOver accessibility ([Preflight](https://tailwindcss.com/docs/preflight)) |
| Headings look like body text                                                             | Preflight sets `font-size: inherit; font-weight: inherit;` on `h1`–`h6`                                                          | Style explicitly (`text-2xl font-bold`) or set defaults in `@layer base`                                                                                                     |
| Third-party widgets (e.g. Google Maps) show unexpected borders or broken images          | Preflight sets `border: 0 solid` on `*` and `display: block; max-width: 100%; height: auto` on `img, svg, video, canvas, iframe` | Override in `@layer base { .google-map * { border-style: none; } }` or add `inline max-w-none` on specific images ([Preflight](https://tailwindcss.com/docs/preflight))      |
| Content touches the screen edge                                                          | `container` only sets `width: 100%` and a `max-width` at each breakpoint. It does not centre or pad.                             | `container mx-auto px-4`, or extend with `@utility container` (section 3)                                                                                                    |
| A spacing class has no effect                                                            | The class is misspelled, invented, or a removed v3 class such as `bg-opacity-50`                                                 | Run the checker (section 16)                                                                                                                                                 |
| A class works in development and vanishes in production                                  | The name is built from strings, or the file is not scanned                                                                       | Write complete class names; add `@source` or `@source inline()` (section 4)                                                                                                  |
| Absolutely positioned element sits at the page corner                                    | No positioned ancestor                                                                                                           | Put `relative` on the parent                                                                                                                                                 |
| `space-x-*` or `space-y-*` gives uneven gaps                                             | The selector is `:where(.space-x-4 > :not(:last-child))`; it uses margins, which interact with wrapping and hidden children      | Use `flex gap-4` or `grid gap-4`                                                                                                                                             |
| Nothing is styled in a prefixed project                                                  | Classes are missing the `tw:` prefix                                                                                             | `tw:flex tw:p-4`                                                                                                                                                             |
| An arbitrary value breaks the class                                                      | A space ends the class name                                                                                                      | Use underscores: `grid-cols-[200px_1fr]`                                                                                                                                     |
| Inset positions flip or vanish                                                           | `start-*` and `end-*` are deprecated (and bare `start`/`end` generates nothing)                                                  | `inset-s-4`, `inset-e-4`                                                                                                                                                     |
| Hover styles do nothing on a phone                                                       | `hover:` only applies inside `@media (hover: hover)`                                                                             | Treat hover as an enhancement, or use `pointer-coarse:` for touch targets                                                                                                    |

### Layout recipes

```html
<!-- Page wrapper with padding -->
<main class="container mx-auto px-4 py-8"></main>

<!-- Badge in a corner: the parent must be positioned -->
<div class="relative">
  <span class="absolute top-0 right-0">New</span>
</div>

<!-- Centre an element inside a positioned parent -->
<div class="relative h-screen">
  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
</div>

<!-- Fill the parent -->
<div class="absolute inset-0"></div>

<!-- Sticky header -->
<header class="sticky top-0 z-10"></header>

<!-- Centre with flexbox (no positioning needed) -->
<div class="flex items-center justify-center gap-4 p-6"></div>

<!-- Readable text list (or add role="list" when unstyled) -->
<ul class="list-disc space-y-2 pl-6"></ul>
```

## 16. Class checker script

This script compiles your CSS entry file with the same engine as your build, then asks it whether
each class name in your files generates CSS. It is the fastest way to catch an invented class before
it ships.

```bash
npm i -D tailwindcss @tailwindcss/node
node tw-check.mjs --css src/styles.css src/index.html src/App.tsx
node tw-check.mjs --css src/styles.css --classes "flex-center p-x-4 px-4"
```

```js
// tw-check.mjs: report class names that Tailwind does not generate CSS for.
// Options: --css <entry.css>  --classes "a b c"  --ignore <regex> (skip your own class names)
import { compile } from "@tailwindcss/node";
import fs from "node:fs";
import path from "node:path";

const BS = String.fromCharCode(92); // backslash
const args = process.argv.slice(2);
const take = (flag) => {
  const i = args.indexOf(flag);
  if (i < 0) return null;
  const value = args[i + 1];
  args.splice(i, 2);
  return value;
};
const cssFile = take("--css");
const ignore = take("--ignore");
const inline = take("--classes");

const css = cssFile ? fs.readFileSync(cssFile, "utf8") : '@import "tailwindcss";';
const base = cssFile ? path.dirname(path.resolve(cssFile)) : process.cwd();
const compiler = await compile(css, { base, onDependency() {} });

// CSS selector form of a class name, as it appears in compiled output
const selector = (cls) =>
  "."
  + cls
    .replace(/[^a-zA-Z0-9_-]/g, (ch) => BS + ch)
    .replace(/^(-?)([0-9])/, (_m, dash, digit) => dash + BS + "3" + digit + " ");

const isKnown = (cls) => {
  const out = compiler.build([cls]);
  const sel = selector(cls);
  for (let at = out.indexOf(sel); at >= 0; at = out.indexOf(sel, at + 1)) {
    if (" {,:[>+~.".includes(out.charAt(at + sel.length))) return true;
  }
  return false;
};

const found = new Map(); // class name -> first "file:line"
const add = (cls, where) => {
  if (!found.has(cls)) found.set(cls, where);
};
if (inline)
  inline
    .split(" ")
    .filter(Boolean)
    .forEach((c) => add(c, "(argument)"));
for (const file of args) {
  fs.readFileSync(file, "utf8")
    .split(String.fromCharCode(10))
    .forEach((line, i) => {
      for (const m of line.matchAll(/(?:class|className)[ ]*=[ ]*(?:"([^"]*)"|'([^']*)')/g)) {
        (m[1] ?? m[2] ?? "")
          .split(" ")
          .filter(Boolean)
          .forEach((c) => add(c, file + ":" + (i + 1)));
      }
    });
}

const ignoreRe = ignore ? new RegExp(ignore) : null;
let bad = 0;
for (const [cls, where] of found) {
  if (ignoreRe?.test(cls)) continue;
  if (!isKnown(cls)) {
    bad++;
    console.log("UNKNOWN  " + cls + "   " + where);
  }
}
console.log(
  bad ?
    bad + " class name(s) generate no CSS."
  : "All " + found.size + " class names generate CSS.",
);
process.exit(bad ? 1 : 0);
```

- It exits with code 1 when any class is unknown, so you can run it in CI or a pre-commit hook.
- It reads `class="..."` and `className="..."` string literals on a single line. Class names
  assembled in code are invisible to it, exactly as they are to Tailwind.
- Your own class names (`btn`, `card`) report `UNKNOWN` unless you define them with `@utility` or
  skip them with `--ignore "^(btn|card)$"`.
- Point `--css` at your real entry file so custom `@theme` breakpoints, colours and `@utility` rules
  count as known, and so a configured `prefix(tw)` is respected.
- It uses the `compile` function of `@tailwindcss/node`, an internal package. Pin its version to
  your `tailwindcss` version, and expect to adjust the script if that API changes.
- Tested on 4.3.3: it flags `flex-center`, `p-x-4`, `mt-xl`, `bg-opacity-50`, `text-bold` and
  `hover:bg-opacity-75`, and accepts `2xl:flex`, `-mt-4`, `*:pt-0`, `@sm:flex`,
  `data-[state=active]:bg-blue-500` and `top-(--header-height)`.

## 17. Verification notes

**Method:** every class this document recommends, every old class it warns about, and every CSS
snippet were compiled with `tailwindcss` and `@tailwindcss/node` 4.3.3, and the generated CSS was
cross-checked against the official Tailwind CSS v4.3 documentation and release notes:

- **Release dates and version attributions:** verified against the
  [Tailwind CSS v4.0 release post](https://tailwindcss.com/blog/tailwindcss-v4) (22 Jan 2025), the
  [Tailwind CSS v4.1 release post](https://tailwindcss.com/blog/tailwindcss-v4-1) (3 Apr 2025,
  including `pointer-*` and `any-pointer-*`), and the
  [GitHub Releases changelog](https://github.com/tailwindlabs/tailwindcss/releases) through v4.3.3
  (16 Jul 2026).
- **Core concepts, utilities and configuration:** verified against
  [Installation](https://tailwindcss.com/docs),
  [Play CDN](https://tailwindcss.com/docs/installation/play-cdn),
  [Editor setup](https://tailwindcss.com/docs/editor-setup),
  [Upgrade guide](https://tailwindcss.com/docs/upgrade-guide),
  [Theme variables](https://tailwindcss.com/docs/theme),
  [Adding custom styles](https://tailwindcss.com/docs/adding-custom-styles),
  [Detecting classes in source files](https://tailwindcss.com/docs/detecting-classes-in-source-files),
  [Functions and directives](https://tailwindcss.com/docs/functions-and-directives),
  [Hover, focus, and other states](https://tailwindcss.com/docs/hover-focus-and-other-states) (plus
  issue [#15772](https://github.com/tailwindlabs/tailwindcss/issues/15772) for v4.1.15 named-group
  variants with `not-*`, `has-*`, and `in-*`),
  [Responsive design](https://tailwindcss.com/docs/responsive-design),
  [Dark mode](https://tailwindcss.com/docs/dark-mode),
  [Colors](https://tailwindcss.com/docs/colors),
  [Preflight](https://tailwindcss.com/docs/preflight),
  [Compatibility](https://tailwindcss.com/docs/compatibility),
  [box-shadow](https://tailwindcss.com/docs/box-shadow),
  [text-shadow](https://tailwindcss.com/docs/text-shadow),
  [mask-image](https://tailwindcss.com/docs/mask-image),
  [mask-composite](https://tailwindcss.com/docs/mask-composite),
  [scrollbar-width](https://tailwindcss.com/docs/scrollbar-width),
  [scrollbar-color](https://tailwindcss.com/docs/scrollbar-color),
  [scrollbar-gutter](https://tailwindcss.com/docs/scrollbar-gutter),
  [tab-size](https://tailwindcss.com/docs/tab-size), [zoom](https://tailwindcss.com/docs/zoom),
  [color-scheme](https://tailwindcss.com/docs/color-scheme),
  [field-sizing](https://tailwindcss.com/docs/field-sizing),
  [font-stretch](https://tailwindcss.com/docs/font-stretch),
  [font-feature-settings](https://tailwindcss.com/docs/font-feature-settings),
  [overflow-wrap](https://tailwindcss.com/docs/overflow-wrap), and
  [transition-behavior](https://tailwindcss.com/docs/transition-behavior).
- **Note on visual verification:** compiling proves a class exists, not that the layout looks right,
  so always inspect the rendered result in a browser.

**Sources:** [Installation](https://tailwindcss.com/docs) ·
[Play CDN](https://tailwindcss.com/docs/installation/play-cdn) ·
[Editor setup](https://tailwindcss.com/docs/editor-setup) ·
[Upgrade guide](https://tailwindcss.com/docs/upgrade-guide) ·
[Theme variables](https://tailwindcss.com/docs/theme) ·
[Adding custom styles](https://tailwindcss.com/docs/adding-custom-styles) ·
[Detecting classes in source files](https://tailwindcss.com/docs/detecting-classes-in-source-files)
· [Functions and directives](https://tailwindcss.com/docs/functions-and-directives) ·
[Hover, focus, and other states](https://tailwindcss.com/docs/hover-focus-and-other-states) ·
[Responsive design](https://tailwindcss.com/docs/responsive-design) ·
[Dark mode](https://tailwindcss.com/docs/dark-mode) · [Colors](https://tailwindcss.com/docs/colors)
· [Preflight](https://tailwindcss.com/docs/preflight) ·
[Compatibility](https://tailwindcss.com/docs/compatibility) ·
[v4.0 release post](https://tailwindcss.com/blog/tailwindcss-v4) ·
[v4.1 release post](https://tailwindcss.com/blog/tailwindcss-v4-1) ·
[GitHub Releases](https://github.com/tailwindlabs/tailwindcss/releases)

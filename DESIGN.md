# AmsirarTrip Design System (DESIGN.md)

> **Visual Authority**: AmsirarTrip — Bespoke Moroccan Desert Expeditions, High Atlas Treks &
> Cultural Journeys. **Brand Archetype**: Warm Humanist / Earthy Moroccan Hospitality & Adventure.
> **Inspired By**: `place-carries-it` art direction (Taste Skill v2), Earthy Architectural
> Minimalism, and Swiss-calibrated spacing.

---

## 1. Visual Theme & Atmosphere

- **Atmosphere**: Grounded, warm, cinematic, and authentic. The interface evokes the terracotta clay
  of Ouarzazate kasbahs, golden dunes of Erg Chebbi, and the deep blue-black sky of Saharan nights.
- **Visual Weight**: Deliberate and spacious. Uncluttered layout where photography of the landscape
  is the primary argument.
- **Avoidance**: No generic neon AI gradients, no purple/indigo SaaS tropes, no floating rounded
  icon boxes with faint pastel fills, and no generic stock travel widgets.

---

## 2. Color Palette & Semantic Roles

Colors are expressed in perceptual **OKLCH** matching `src/styles/global.css`:

| Role                        | Token Name           | OKLCH / Hex Value                        | CSS Variable / Utility    | Visual Intent                                                   |
| --------------------------- | -------------------- | ---------------------------------------- | ------------------------- | --------------------------------------------------------------- |
| **Accent (Pacific Orange)** | `orange` / `accent`  | `#f15d30` / `oklch(66.5% 0.191 36.9deg)` | `--color-orange`          | Unified brand primary orange across all UI, badges, icons & CTA |
| **Accent Dark**             | `orange-dark`        | `#d94a1f`                                | `--color-orange-dark`     | Hover & pressed states on accent                                |
| **Golden Amber Highlight**  | `amber-orange`       | `#f78848`                                | `--color-amber-orange`    | Gradient top-left highlight partner for buttons & navlinks      |
| **Yellow Highlight**        | `yellow`             | `#FFB70F`                                | `--color-yellow`          | Golden yellow highlight & accent text                           |
| **Ink Running Copy**        | `ink`                | `oklch(15% 0.01 65deg)`                  | `--color-ink`             | Deep charcoal running body copy                                 |
| **Primary Surfaces**        | `stone-50` / `white` | Native Tailwind neutrals                 | `bg-stone-50`, `bg-white` | Light mode clean ground surfaces                                |
| **Sahara Night Surface**    | `slate-950`          | Native Tailwind slate                    | `bg-slate-950`            | Dark card surfaces, sidebar modules & footer                    |

---

## 3. Typography Rules

- **Display & Headings (`--font-sans`)**: `Montserrat`, Variable weight (600, 700). Tracking
  `-0.02em` to `-0.035em`. Line height `1.1` to `1.2`.
- **Body & Paragraphs (`--font-sans`)**: `Montserrat`, 400 regular & 500 medium. Tracking `normal`.
  Line height `1.5` to `1.6`. Running body font size `16px` minimum.
- **Brand Signature Accent (`--font-brand`)**: `Yellowtail`, cursive. Used selectively for
  single-phrase accents or hero signatures. Never used for multi-line copy or UI buttons.
- **Code & Tour IDs (`--font-mono`)**: `DM Mono`. Used for tour itinerary day markers, GPS
  coordinates, license accreditation numbers (`Agrément N° 24/TT/RAK`), and editorial section
  subtitles.

---

## 4. Component Stylings

### Buttons

- **Primary Action**: Solid Moroccan Terracotta
  (`bg-orange text-white hover:bg-orange-dark active:scale-[0.98]`). High contrast, font-medium,
  padding `px-6 py-3.5`, radius `rounded-xl` or `rounded-full`.
- **Secondary Action**: Bordered or sunken sand
  (`border border-line bg-surface text-ink hover:bg-sunken`).
- **Touch Target**: Strict `44px × 44px` minimum bounding box on all touch surfaces.

### Cards & Panels

- **No heavy blurry drop-shadows**: Surface differentiation is achieved through tone steps
  (`bg-surface` sitting on `bg-canvas`) or a crisp 1px hairline border (`border-line`).
- **Corner Radii**: Uniform `rounded-2xl` for tour cards; `rounded-xl` for inner media frames.
- **Media Containers**: 16:10 or 4:3 fixed aspect ratios with `object-cover` and progressive WebP
  formats.

### Navigation Chrome

- **Desktop Navbar**: Clean top bar with solid brand contrast.
- **Mobile Bottom Dock**: Floating pill dock (`rounded-full`) anchored above
  `env(safe-area-inset-bottom)`. Active states illuminated with terracotta indicator; smooth 200ms
  cubic transition.

---

## 5. Layout & Spacing Rhythm (4-Point Spacing System)

The design system strictly adheres to a **4-point spacing system** (base unit = `4px` / `0.25rem`).
All spacing, paddings, margins, element dimensions, and layout gaps are exact multiples of this 4px
base unit.

### 4-Point Spacing Scale & Token Reference

| Scale Token | Pixels  | Rem       | Tailwind Utility      | Semantic Usage & Scope                                                              |
| :---------- | :------ | :-------- | :-------------------- | :---------------------------------------------------------------------------------- |
| `space-1`   | `4px`   | `0.25rem` | `p-1`, `gap-1`, `m-1` | Micro-spacing: icon badge offsets, inline dot indicators, tag padding               |
| `space-2`   | `8px`   | `0.5rem`  | `p-2`, `gap-2`, `m-2` | Tight proximity: icon + text gap, related inline controls, form label to input      |
| `space-3`   | `12px`  | `0.75rem` | `p-3`, `gap-3`, `m-3` | Compact elements: secondary button padding, list item gaps, small card elements     |
| `space-4`   | `16px`  | `1.0rem`  | `p-4`, `gap-4`, `m-4` | Base spacing: standard form field gap, card content separation, mobile card padding |
| `space-5`   | `20px`  | `1.25rem` | `p-5`, `gap-5`, `m-5` | Medium group spacing: card header margins, compact section gaps                     |
| `space-6`   | `24px`  | `1.5rem`  | `p-6`, `gap-6`, `m-6` | Component containers: standard card padding, intra-section subgroup separation      |
| `space-7`   | `28px`  | `1.75rem` | `p-7`, `gap-7`, `m-7` | Large card inner padding (`p-7` on editorial stat cards)                            |
| `space-8`   | `32px`  | `2.0rem`  | `p-8`, `gap-8`, `m-8` | Major card padding (desktop form cards, itinerary day modules)                      |
| `space-10`  | `40px`  | `2.5rem`  | `py-10`, `gap-10`     | Section sub-groupings, editorial heading-to-content separation                      |
| `space-12`  | `48px`  | `3.0rem`  | `py-12`, `gap-12`     | Mobile section rhythm: standard section vertical breathing room                     |
| `space-16`  | `64px`  | `4.0rem`  | `py-16`, `h-16`       | Mobile-expanded & tablet section vertical rhythm; sticky navbar height (`h-16`)     |
| `space-20`  | `80px`  | `5.0rem`  | `py-20`               | Desktop section rhythm: default vertical rhythm between distinct content blocks     |
| `space-24`  | `96px`  | `6.0rem`  | `py-24`               | Desktop spacious rhythm: hero section and flagship tour showcase padding            |
| `space-32`  | `128px` | `8.0rem`  | `py-32`               | Macro section breaks: dramatic full-bleed Sahara transitions                        |

### 4-Point System Implementation Rules

1. **Step 1: Base Unit Multiples**
   - Spacing values must strictly be multiples of 4px.
   - **Banned**: Arbitrary off-grid fractional spacing such as `p-1.5` (6px), `py-2.5` (10px),
     `py-3.5` (14px), `px-4.5` (18px), `gap-2.5` (10px), or `gap-3.5` (14px). Use `py-2` (8px),
     `py-3` (12px), `py-4` (16px), or `gap-4` (16px) instead.

2. **Step 2: Consistent Margins and Padding**
   - **Padding (Inside)**: Give content room to breathe without touching boundaries (e.g., cards
     `p-6` or `p-8`, buttons `px-6 py-3` or `px-8 py-3`).
   - **Margin (Outside)**: Separate elements without crowd (e.g., heading bottom margins `mbe-4` or
     `mbe-6`).
   - **Minimum Touch Targets**: Interactive elements must retain a strict `44px × 44px` minimum
     bounding box (`min-h-11` = 44px, which is `4px × 11`).

3. **Step 3: Visual Hierarchy & Proximity Rule**
   - **Proximity ratio (2x rule)**: Spacing between closely related items (e.g., label + input, or
     icon + text at 8px) must be at least half the space between distinct groups (e.g., between form
     rows at 16px, or between card sections at 24px).
   - **Card & Component Layout**: Section-to-section divisions inside cards use `24px` (`gap-6` or
     `p-6`); internal list items use `8px` (`gap-2`) or `12px` (`gap-3`).
   - **Outer Margins**: Equal margins on both edges (`px-4 sm:px-6 lg:px-8`).
   - **Max Container**: `max-w-7xl` (1280px = `4px × 320`).
   - **Section-to-Section Rhythm**: Desktop `py-20 lg:py-24` (80px–96px); mobile `py-12 sm:py-16`
     (48px–64px).
   - **Asymmetry inside Grid**: Avoid centered columns of text floating in empty space. An
     off-center headline is anchored by tour cards, route maps, or testimonials on opposing grid
     columns.

---

## 6. Depth, Elevation & Surface Hierarchy

- **Level 0 (Canvas)**: Background desert canvas (`oklch(98.5% 0.006 65deg)`).
- **Level 1 (Card/Surface)**: Raised card (`oklch(99.5% 0.003 65deg)`), with
  `border border-line/60`.
- **Level 2 (Floating/Dock)**: Mobile bottom dock and dropdowns with calibrated backdrop blur and
  ambient shadow `shadow-[0_12px_32px_rgba(0,0,0,0.08)]`.
- **Level 3 (Modal/Drawer)**: Fullscreen focus overlays with solid backdrop dimming.

---

## 7. Motion & Interaction Principles (`design-motion-principles`)

- **Jakub Krehel Lens (Production Polish)**: Default component transitions set to `200ms - 300ms`
  with `cubic-bezier(0.16, 1, 0.3, 1)` easing.
- **Emil Kowalski Frequency Gate**: Instant feedback for repetitive controls (menu tabs, filters,
  booking inputs). Avoid artificial delays or typing effects on crucial copy.
- **Accessibility Invariant**: Every transition respects `@media (prefers-reduced-motion: reduce)`:

  ```css
  @media (prefers-reduced-motion: reduce) {
    *,
    ::before,
    ::after {
      animation-duration: 0.01ms;
      transition-duration: 0.01ms;
    }
  }
  ```

---

## 8. Anti-Slop Rules & Tells (`antislop` + `taste-skill`)

- **Banned**: Centered 3-line headline with decorative line eyebrows (`--- EXPLORE MOROCCO ---`).
  Replaced by a strong contextual title and purposeful location badge.
- **Banned**: Multi-layer dark scrim gradients
  (`bg-linear-to-b from-black/60 via-black/30 to-black/70`) that muddy vibrant desert photography.
  Replaced by targeted bottom gradient scrims only where text legibility requires it.
- **Banned**: Generic placeholder ratings or anonymous quotes. All testimonials must reflect
  verified routes, real traveler origins, and guide names.
- **Banned**: Emoji used as feature icons. Use SVG icons exclusively (`@lucide/astro`).

---

## 9. Responsive Breakpoints & Mobile Optimization

- **Mobile Viewport (`390px - 767px`)**: Single column layout, swipeable horizontal tour scroller,
  sticky bottom booking navigation.
- **Tablet (`768px - 1089px`)**: 2-column card grid, expanded navigation.
- **Desktop (`1090px+`)**: Full 3-column tour showcases, interactive route previews, sticky filters.

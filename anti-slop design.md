---
name: anti-slop-web-design
description:
  Design and build distinctive, human-crafted web interfaces that avoid generic AI-template
  aesthetics, using a complete system for layout, spacing, typography, color, components, copy,
  accessibility, and performance. Use this skill whenever the user asks to design, build, style,
  restyle, polish, audit, or refactor any website, landing page, marketing site, dashboard, admin
  panel, web app, e-commerce page, portfolio, blog, article page, long-form text layout, headings
  and titles, or UI component (React, Next.js, Astro, Hono JSX, shadcn/ui, Tailwind CSS, or plain
  HTML/CSS). Also use it when the user says a UI looks "generic", "AI-made", "template-like",
  "ugly", or "unpolished", or wants it to look "professional", "premium", "modern", or
  "human-designed", even if they never mention design principles.
---

# Anti-Slop Web Design

Build interfaces that look like a skilled human designer made deliberate choices for one specific
product and audience. Agency-caliber means: clear hierarchy, rigorous alignment, a small number of
well-chosen tokens, honest content, and complete interaction states. The quality bar is the rigor of
products like Vercel, Linear, Stripe, and Raycast: study their discipline in spacing, type, and
states, not their look. Copying a look is how generic clones happen.

## Core principle

**Slop is an unmotivated default.** AI output looks generic because every choice is the statistical
average: the same gradient, the same three cards, the same centered hero, the same adjectives.
Humans make choices for reasons tied to the product.

For every visual or copy decision, be able to answer: _"What about this product, audience, or
content led to this choice?"_ If the honest answer is "it's what I usually do", replace it.

This rule cuts both ways. Even the "good" archetypes below become slop when applied without thought
(the dark hairline-grid SaaS look is now a cliché too). Use them as starting points and adapt them
to the domain.

## Priority order when rules conflict

1. **The user's explicit requirements, brand, and existing design system.** Follow them. This skill
   governs choices the user did not specify. Never override an established brand with your own
   taste.
2. **Function and accessibility.** It works, it is readable, it is usable by keyboard and screen
   reader.
3. **Hierarchy and layout.** It is obvious what matters most, and everything is aligned and spaced
   on purpose.
4. **Typography and color.**
5. **Surface detail, motion, and delight.**

**Scale the process to the task.** For a single component or small tweak, skip the brief and the
page blueprint, but still apply tokens, states, accessibility, and the copy rules. For a full page,
site, or app, run the whole workflow.

---

## 1. Workflow

Follow these steps in order. Do the thinking before writing markup, because retrofitting taste onto
finished code rarely works.

1. **Read the constraints.** Check the existing codebase, `package.json` versions, design tokens,
   brand assets, and any copy the user supplied. Match the installed framework and Tailwind versions
   (see section 14).
2. **Write a design brief** (template below). Keep it under 12 lines.
3. **Choose an archetype** (section 4), or a justified hybrid, plus **one signature move**.
4. **Define tokens first**: color, type scale, spacing, radius, elevation, motion. Put them in CSS
   variables or `@theme` before any component uses them.
5. **Plan the information hierarchy.** For pages: list sections, give each a single job, and choose
   a layout that fits that job (section 16). For apps: define the primary task, then navigation,
   then density. For articles and text-heavy pages: define the title, standfirst, metadata, and
   reading column using section 7.
6. **Build server-first and mobile-first**, with every state (hover, focus, active, disabled,
   loading, empty, error).
7. **Run the verification pass** (section 18). Fix what fails. Then deliver (section 19).

### Design brief template

Write this out (in your reasoning, or briefly to the user for large builds):

```
Product & audience: who uses it, in what situation, on what device
Primary goal:       the one action or understanding the page must produce
Tone (3 words):     e.g. warm, exact, unhurried
Archetype:          which one, and what you are changing about it
Signature move:     the one ownable element (see below)
Color:              neutral hue + one accent, and why that hue fits the domain
Type:               display / body / mono families, and why
Content available:  what is real vs. what is missing (see section 11)
```

### Signature move

Choose **one** distinctive device and use it consistently, so the design has an identity instead of
a pile of effects. Examples: an exposed index-number system (`01 / 06`), a coordinate or metadata
strip, an unusual image crop ratio, oversized numerals, a recurring line-art SVG motif, a
color-blocked inverse section, a strong typographic treatment of one word per headline. One is
memorable; five is noise.

---

## 2. What makes a design read as human-made

Apply these deliberately. They are what separate designed work from generated work.

- **Unequal emphasis.** One focal point per viewport. Not every element gets the same size, weight,
  and decoration. If everything shouts, nothing does.
- **Varied rhythm.** Sections differ in density, layout, and height. Alternate wide and narrow,
  text-heavy and image-heavy, tight and spacious. Identical stacked sections are a template tell.
- **Asymmetry with structure.** Unequal columns (7/5, 8/4), left-aligned text, elements that hang
  off the grid on purpose, always snapped to a defined grid.
- **Specificity.** Real place names, real units, real file names, real dates in the user's locale
  format. Specific beats polished.
- **Restraint.** Maximum: 2 type families plus mono, 1 accent hue, 3 radii, 3 elevation levels, 1
  icon set, 1 signature move.
- **Craft at the edges.** Custom `::selection` color, `accent-color`, `color-scheme`, a designed
  404, visible and styled focus rings, a real favicon and OG image, `scrollbar-gutter: stable`,
  print-safe pages where relevant. Nobody asks for these; everyone feels them.
- **Left-align by default.** Center only short, standalone statements (a hero line, an empty state,
  a quote). Centered paragraphs and centered everything is a top AI tell.

---

## 3. Slop tells and what to do instead

Audit your plan against this table before writing code. The right-hand column matters more than the
left: never delete a cliché without replacing it with a motivated choice.

| Tell                                                                                              | Why it reads as AI                               | Do instead                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Purple/indigo-to-cyan gradients, glowing neon blobs, `from-purple-500 via-indigo-500 to-cyan-500` | The statistical default palette of generated UIs | Pick a hue from the domain (terracotta for travel, deep green for finance, signal amber for infra). Use flat color or a subtle same-hue luminance shift.      |
| Gradient text on the H1                                                                           | Easiest way to fake emphasis                     | Emphasize with weight, a serif/sans contrast, or an italic word in solid color.                                                                               |
| Pill badge with sparkle emoji above the hero (`✨ Introducing X`)                                 | Formulaic hero stack                             | Delete it, or use a plain mono overline with real metadata (`v3.2 · changelog`).                                                                              |
| Centered hero: badge → gradient H1 → vague subtitle → two pill buttons                            | The single most recognizable template            | Left-aligned thesis plus a concrete artifact (real UI preview, map, photo, data table) in a 7/5 or 6/6 split.                                                 |
| Three identical rounded cards, each with an icon-in-a-circle, 3-word title, 2 lines of filler     | Padding disguised as content                     | Asymmetric layout where each block earns its shape. Show proof (UI preview, diagram, number) instead of an icon. Or use a simple list with strong typography. |
| Emoji as icons (🚀 ⚡ 🎯)                                                                         | Cheap placeholder for design                     | One consistent icon set, used only where it aids scanning.                                                                                                    |
| `rounded-2xl` and `shadow-xl` on everything                                                       | No elevation or radius model                     | A defined radius scale and 3 elevation levels (section 8).                                                                                                    |
| Glassmorphism on every surface                                                                    | Effect without a lighting model                  | Use blur only on surfaces that float above content (sticky header, popover), and only where content actually passes beneath.                                  |
| Glows, orbs, mesh blobs, heavy noise                                                              | Decoration standing in for composition           | If used at all: radial spotlight under 8% opacity, noise 1.5%–3%.                                                                                             |
| Default uncustomized shadcn/ui or Tailwind UI                                                     | Everyone's site looks identical                  | Adapt radius, neutrals, ring, density, and type to your tokens (section 14).                                                                                  |
| Stock photos of handshakes, offices, laptops                                                      | Visual filler                                    | Real, domain-specific photography, bespoke SVG, CSS patterns, or UI artifacts (section 10).                                                                   |
| Fake logo cloud, "Trusted by 10,000+ teams", fake testimonials                                    | Fabricated proof, and a trust hazard             | Omit, or leave an honest placeholder (section 11).                                                                                                            |
| Buzzword copy (see section 11)                                                                    | Fluent but empty                                 | Concrete nouns, verbs, numbers.                                                                                                                               |
| Formula titles ("The Ultimate Guide to X", "Unlocking X", every H2 a question)                    | Template headings carry no information           | Specific subject-or-claim titles (section 7.1).                                                                                                               |
| Walls of bullets, bold lead-in on every bullet, bold everywhere                                   | Structure faked with formatting                  | Short paragraphs, real headings, sparing emphasis (section 7.2).                                                                                              |
| Every section is `py-24`, centered, same max-width                                                | No rhythm                                        | Vary section padding and layout on purpose; keep one consistent container.                                                                                    |
| Overuse of badges, chips, and "pills"                                                             | Decorating hierarchy that is not there           | Use typography and spacing for hierarchy; keep chips for real status and filters.                                                                             |
| `Lorem ipsum`, "John Doe", "Acme Inc.", round numbers (10,000, 99%)                               | Obviously unfilled                               | Realistic, domain-specific sample data, labeled as sample.                                                                                                    |

---

## 4. Archetypes

Choose one direction that fits the product domain and commit to its rules. Hybrids are fine when
justified in the brief, but never mix more than two. If the project has its own brand, treat the
archetype as a source of structure, not of colors.

### A. Precision Dark Craft

_Best for: dev tools, AI products, infrastructure, security, B2B SaaS, terminals, dashboards used
for long sessions._

- **Surfaces:** deep tinted canvas (`oklch(0.14 0.01 265)` range), panels one or two luminance steps
  higher. Express elevation with lightness, not shadows.
- **Borders:** 1px hairlines at about `white/[0.07]`, with a top-edge highlight
  (`inset 0 1px 0 rgb(255 255 255 / 0.06)`).
- **Accent:** one high-signal functional accent (emerald, amber, or cobalt), used only for state and
  primary action.
- **Type:** neutral sans body, mono for data and metadata.
- **Watch out:** low-contrast gray-on-black. Keep primary text near white and secondary text at 7:1
  or at least 4.5:1.

### B. Swiss Editorial Grid

_Best for: agencies, publishers, fintech, luxury, portfolios, institutions._

- **Surfaces:** warm paper canvas (`#FBFBF9` / `#F4F3EF` range), ink text (`#111110`), occasional
  full-bleed inverse sections.
- **Structure:** visible 1px grid lines (`border-neutral-900/10`), asymmetric multi-column layouts,
  exposed index numbers (`01 / 04`), generous margins.
- **Type:** high-contrast serif or expressive display for headlines, neo-grotesque body, mono for
  captions and metadata.
- **Watch out:** grid lines must align across sections; a misaligned hairline looks worse than none.

### C. Atmospheric Light Minimalism

_Best for: consumer apps, docs, health, productivity, calm tools._

- **Surfaces:** daylight canvas (`#FAFAFA` range, tinted), white elevated cards, soft stone borders.
- **Elevation:** layered ultra-low-opacity shadows
  (`0 1px 2px rgb(0 0 0 / 0.04), 0 4px 12px rgb(0 0 0 / 0.03)`).
- **Accent:** obsidian primary buttons plus semantic status colors.
- **Watch out:** this archetype can collapse into blandness. Give it a signature move and real
  typographic personality.

### D. Neo-Brutalist Utility

_Best for: creative tools, design systems, indie products, some e-commerce and culture brands._

- **Surfaces:** stark backgrounds, solid unblurred offset shadows (`4px 4px 0 #000`), `0`–`2px`
  radii, thick borders.
- **Accent:** industrial tones (international orange, acid lime, cobalt) reserved for interaction
  and focal points.
- **Watch out:** keep the grid strict. Brutalist means rigorous and raw, not messy.

### E. Warm Humanist (hospitality, travel, food, wellness)

_Best for: tourism, restaurants, hotels, local business, nonprofits, education, community products._

- **Surfaces:** warm off-whites and earthy mid-tones from the place or product (clay, sand, olive,
  sea), photography-led layouts.
- **Type:** humanist or soft serif display, friendly but precise sans body.
- **Structure:** editorial layouts with large images, captions, maps, and practical details (hours,
  prices, distances) treated as first-class content.
- **Shape:** moderate radii (8–16px), organic but disciplined. Hand-drawn or textured accents
  sparingly, one motif only.
- **Watch out:** warmth is not mush. Keep contrast, hierarchy, and alignment as rigorous as in any
  other archetype.

### F. Dense Operational (admin, internal tools, data apps)

_Best for: dashboards, CRMs, back offices, analytics, tables._

- **Density:** 13–14px UI text, 32–36px row height, compact but breathable (never below 8px between
  unrelated groups).
- **Structure:** persistent navigation, sticky table headers, keyboard shortcuts, inline editing,
  saved views.
- **Color:** neutral surfaces; color only for status and selection.
- **Watch out:** decoration. Every pixel should serve scanning or action.

---

## 5. Color system

**Define semantic tokens, not raw colors.** Components reference `--color-surface`, never `#fff`.
This makes dark mode, theming, and restyling a token change.

- **Use OKLCH** for tokens so lightness and chroma scale predictably between themes.
- **Tinted neutrals.** No dead `#808080` grays. Give every neutral a small chroma (`0.005`–`0.015`)
  at the brand's hue so the whole page feels cohesive.
- **One accent hue.** Add a second hue only for semantic status (success, warning, danger, info).
  Derive hover/active states by shifting lightness, not by switching colors.
- **60-30-10.** About 60% canvas, 30% surfaces and structure, 10% accent and semantic color.
- **Contrast is a hard requirement:** body text 4.5:1 minimum (aim for 7:1 for long reading), large
  text 3:1, UI boundaries and focus indicators 3:1 against adjacent colors. Compute contrast; do not
  eyeball it.
- **Never use color alone** to convey state. Pair it with an icon, label, or pattern.
- **Gradients:** only when motivated. Interpolate in OKLCH (`bg-linear-to-r/oklch` in Tailwind v4,
  or `in oklch` in CSS) between analogous hues or small luminance shifts to avoid the gray dead
  zone.
- **Derive the accent from the domain,** not from "tech blue/purple". Ask what physical object or
  place the product evokes.

Illustrative token set (Tailwind v4 `@theme`). The values are examples; always recompute contrast
for your own palette:

```css
@import "tailwindcss";

@theme {
  /* Neutrals tinted to a warm hue (95) */
  --color-canvas: oklch(0.985 0.005 95);
  --color-surface: oklch(0.995 0.003 95);
  --color-sunken: oklch(0.96 0.007 95);
  --color-line: oklch(0.88 0.008 95);
  --color-ink: oklch(0.2 0.01 95);
  --color-ink-muted: oklch(0.45 0.01 95);

  /* One accent (terracotta) + readable text on it */
  --color-accent: oklch(0.52 0.15 35);
  --color-accent-ink: oklch(0.99 0.005 95);

  /* Semantic status (functional only) */
  --color-success: oklch(0.55 0.13 150);
  --color-warning: oklch(0.72 0.15 75);
  --color-danger: oklch(0.55 0.19 25);
}

/* Dark theme: redefine tokens, do not invert. Raise surfaces by lightness. */
.dark {
  --color-canvas: oklch(0.16 0.008 95);
  --color-surface: oklch(0.2 0.008 95);
  --color-sunken: oklch(0.13 0.008 95);
  --color-line: oklch(0.3 0.008 95);
  --color-ink: oklch(0.96 0.005 95);
  --color-ink-muted: oklch(0.72 0.008 95);
  --color-accent: oklch(0.72 0.14 35);
}
```

---

## 6. Typography

Typography carries most of a page's perceived quality. Treat it as engineering.

**Three roles, chosen on purpose:**

- `--font-display`: personality for H1/H2 (editorial serif or expressive grotesque).
- `--font-sans`: high-legibility UI and body face.
- `--font-mono`: metrics, labels, timestamps, code, coordinates.

**Choose fonts by mood, not by habit.** `Inter`, `Space Grotesk`, `Plus Jakarta Sans`,
`Playfair Display`, and `Poppins` are default picks in generated UIs. They are fine tools, but if
they are your first instinct, look further. Starting points:

- Editorial serif: Instrument Serif, Fraunces, Newsreader, Source Serif 4.
- Grotesque/humanist sans: Geist, Instrument Sans, Hanken Grotesk, Schibsted Grotesk, Bricolage
  Grotesque, General Sans.
- Mono: Geist Mono, JetBrains Mono, IBM Plex Mono.
- **Non-Latin scripts** (Arabic, Hebrew, Devanagari, CJK, and others): choose a family designed for
  that script and test it with real text. Never rely on a fallback font for a whole language.

**Scale and rhythm:**

- Define 7–8 steps on a modular scale (ratio 1.2–1.333). Do not invent sizes ad hoc.
- Display sizes are fluid: `clamp(2.25rem, 1.2rem + 4.5vw, 4.5rem)`.
- **Display (above ~36px):** tracking `-0.03em` to `-0.04em`, line-height `1.05`–`1.12`,
  `text-wrap: balance`.
- **Body:** 16–18px, line-height `1.5`–`1.7`, measure `45–75ch` (aim for `62ch`),
  `text-wrap: pretty`, muted but compliant color (for example `neutral-600` on light, `zinc-400` on
  dark; verify contrast for your actual palette).
- **Micro-labels:** 11–12px uppercase mono with `tracking-[0.1em]`–`[0.12em]`. Never set long text
  in all caps.
- **Weights:** use at most 3 (e.g., 400, 500, 600). Build hierarchy with size, color, and spacing,
  not only boldness. Avoid `font-bold` on everything.
- **Numbers:** apply `font-variant-numeric: tabular-nums` to prices, tables, counters, timers, and
  any stacked figures.
- **Rendering and OpenType:** set `antialiased`
  (`-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale`) on the body, which
  mainly helps light text on dark backgrounds. Enable the optical features your font actually
  supports (for example `font-feature-settings: "cv02", "cv11", "ss01"` on Inter or Geist). Features
  differ per font and version, so check the font's specimen before enabling them.
- **Hierarchy test:** you should be able to identify H1, H2, body, and caption at a glance in a
  blurred screenshot.

**Loading:**

- Self-host fonts (Fontsource or the framework's font optimization). Use `font-display: swap`,
  preload the primary display and body files, subset to the needed scripts, and set size-adjusted
  fallbacks to avoid layout shift.
- Prefer variable fonts to cut file count.

---

## 7. Text, titles, and long-form reading

Most of the web is text, and text slop is as recognizable as visual slop: formula titles, headings
that carry no information, walls of bullets, bold on everything, and decoration standing in for
structure. Apply this section to articles, blog posts, docs, marketing copy blocks, and UI text.

### 7.1 Titles and headings

**A title states the specific subject or claim.** A reader should be able to predict the content.
_Generic test:_ could this title sit on 1,000 other pages? If yes, rewrite it.

- Use **sentence case** by default. Use Title Case only for an editorial brand that does it
  consistently. One style across the whole site.
- H1 stays within two lines on desktop (about 70 characters). The `<title>` tag stays near 60
  characters. Headings never exceed two lines.
- Put the keyword or subject first. Cut warm-up words.

| Title slop                                                        | Why it fails                      | Do instead                                                                     |
| ----------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------ |
| "The Ultimate Guide to X", "Everything you need to know about X"  | Promises everything, says nothing | Name the outcome: "Set up X in 20 minutes"                                     |
| "Unlocking / Mastering / Demystifying X"                          | Verb stand-ins for a real claim   | Name the thing and the result                                                  |
| "X: A Comprehensive Guide" (colon-subtitle formula on every page) | Template rhythm                   | One clear title; add a subtitle only when it adds new information              |
| "X is dead. Long live Y." and other hot-take formulas             | Manufactured drama                | State the claim plainly                                                        |
| "7 tips for…" with thin items                                     | Count is filler                   | Use a number only when the count is real and each item has substance           |
| Every H2 is a question ("What is X? Why does it matter?")         | Reads as generated FAQ            | Mix statements and questions; use a question only when the reader would ask it |
| Emoji, long ALL CAPS, trailing `!`, "Ready to…?" headings         | Decoration and hype               | Plain declarative headings                                                     |
| Gerund piles ("Building, Scaling, and Optimizing…")               | Triplet rhythm                    | Choose the one thing the section covers                                        |

**Headings are navigation.**

- _Outline test:_ reading only the headings should tell the story of the page.
- One `<h1>`; `<h2>` for major sections; `<h3>` within them; never skip levels; never choose a level
  for its size (style with classes).
- Do not over-fragment. A heading every two paragraphs is slop; a section should carry real
  substance (reference docs excepted).
- Use number or index prefixes (`01`, `Step 2`) only when the order or count carries meaning.
- An **eyebrow/overline** above a title is allowed only with real information (category, date,
  version), set in small mono. No decorative "FEATURES" labels.
- A **standfirst/deck** under the title adds information the title lacks (scope, stakes, who it's
  for). It never restates the title.

### 7.2 Article and long-form layout

Build articles in this order, top to bottom:

1. Optional breadcrumb or category.
2. `<h1>` title.
3. Standfirst: one or two sentences, slightly larger than body (`1.125–1.25rem`), muted color.
4. Metadata line in small text or mono: linked author name, `<time datetime>` publish date, an
   "Updated" date only when content materially changed, reading time only above ~3 minutes. Real
   names and dates only.
5. Optional lead image in a `<figure>` with caption and credit.
6. Body column.
7. Footer: author note (real), related reading (real), previous/next. Tags only if they navigate
   somewhere useful.

**Body column**

- Measure `60–70ch` (`max-w-[65ch]`). The page can be wider than the text; the reading column is the
  narrowest element.
- Body size `1.0625–1.25rem` (17–20px), line-height `1.6–1.75`, color from the ink token (not
  decorative gray).
- Align left. Do not justify web text (it creates uneven gaps). Hyphenate only with a correct `lang`
  and `hyphens: auto` in narrow columns.
- Paragraph spacing of `1–1.25em` using margins. Do not combine indents and spacing.
- **Heading spacing follows proximity:** space above a heading is at least twice the space below
  (e.g., H2 `mt-[2.5em] mb-[0.6em]`, H3 `mt-[2em] mb-[0.5em]`). A heading belongs to the text
  beneath it.
- Article headings are smaller than page display type: H2 `1.5–1.875rem`, H3 `1.25–1.5rem`, weight
  600, tight tracking only above ~28px.
- Paragraphs run 2–5 sentences and vary in length. No walls (more than about 7 lines on mobile), and
  no one-sentence-paragraph-every-time rhythm.
- **Long articles (1,500+ words):** sticky table of contents on wide screens
  (`<nav aria-label="Table of contents">`), collapsed `<details>` on mobile, active-section
  highlight, heading anchors with accessible names, and `scroll-margin-top` so sticky headers don't
  cover targets.

**Inline elements**

- **Links:** underlined (`underline-offset-[0.2em]`, 1px thickness, thicker on hover), or
  distinguishable from surrounding text at 3:1 contrast. Link text describes the target ("read the
  2025 audit"), never "click here" or a bare URL.
- **Bold:** sparingly, about one short phrase per 300 words, for terms or warnings the reader needs
  to find on a scan. Never bold whole sentences or the first words of every bullet or paragraph. Use
  italics for titles and terms. Never underline for emphasis (underline means link).
- **Inline code:** subtle `sunken` background, same size as body or `0.9em`, radius from the scale.

**Block elements**

- **Lists:** real `<ul>`/`<ol>`, only for genuinely parallel items (three or more, usually under
  seven). Ordered lists for sequences only. Maximum two nesting levels. Markers outside the text
  block, with `0.4em` between items. Do not convert paragraphs to bullets to look organized; fix a
  wall of text with headings and shorter paragraphs. Do not use `**Bold label:** sentence` bullets
  as a default pattern.
- **Blockquotes:** `<figure><blockquote>…</blockquote><figcaption>` with real attribution. Style
  with a left rule or a restrained typographic treatment, not a giant clip-art quote glyph.
- **Pull quotes:** editorial long-form only, at most one per ~800 words, set larger in the display
  face, `aria-hidden="true"` because the text duplicates the body.
- **Callouts** (note, warning, tip): at most one or two per article, each with distinct meaning,
  built from a border, a surface step, and a label. Not a colored box with an emoji on every few
  paragraphs.
- **TL;DR / Key takeaways:** only for long pieces, and only when the summary adds something a
  skimmer can act on. Never restate the intro.
- **Dividers:** `<hr>` for real topic breaks, not between every section.
- **Drop caps:** editorial archetypes only, one per article, via `initial-letter` with a float
  fallback. Never in docs or UI.
- **Figures:** `<figure>` + `<figcaption>`. Captions say what to notice and credit the source; alt
  text describes the image for non-sighted readers, so the two differ. Use consistent aspect ratios.
  Figures may break wider than the text column.
- **Code blocks:** mono at `0.875–0.9375rem`, `sunken` background, 1px border, radius from the
  scale, horizontal scroll (never wrapped mid-token), language or filename label, copy button,
  syntax theme that meets 4.5:1 contrast. Astro's built-in Shiki highlighting works; configure its
  theme to your tokens.
- **Tables in prose:** `<caption>`, header row, right-aligned numbers with `tabular-nums`, scroll in
  its own container on mobile.
- **Footnotes and sidenotes:** `<sup>` links with back-links, or sidenotes in a wide margin that
  collapse inline on mobile.

**Typographic details** (small things that signal a human edited it)

- Curly quotes and apostrophes (`“ ” ‘ ’`), en dash for ranges (`2024–2026`), a real ellipsis (`…`),
  `×` for dimensions, a true minus (`−`).
- Use em dashes sparingly and consistently (spaced or unspaced, one style).
- Non-breaking space between a number and its unit, and inside short fixed phrases (`10 km`,
  `4 nights`).
- `text-wrap: balance` for headings, `text-wrap: pretty` for paragraphs, `overflow-wrap: anywhere`
  on long URLs inside narrow containers.
- Lining tabular figures in tables and prices; proportional figures are fine in running prose.
- Format dates, numbers, and currency with `Intl` for the page's locale; use `<time>` for dates.

**Markup and tooling**

- Wrap content in `<article>`, with `<header>`, `<aside>`, `<figure>`, `<time>`, and `<nav>` where
  they apply.
- **Never ship the stock Tailwind Typography `prose` look untouched.** Customize its theme to your
  tokens (fonts, link, heading, code, and quote colors, spacing, measure), or write your own scoped
  content styles. In Astro, render Markdown/MDX inside a custom content layout and map elements to
  your components (callouts, figures, code blocks, links).
- Add Article structured data (JSON-LD) when the page is publicly indexed, using real author and
  date values.

### 7.3 Text in marketing sections and UI

- **Section text unit:** optional overline, a heading, and one short paragraph (two or three lines,
  about 40 words at most). The paragraph never repeats the heading. Hero subtitle: one or two lines,
  about 24 words at most, concrete.
- **Centered text** is for one or two lines. Avoid centered paragraphs of three lines or more.
- **Narrow columns:** avoid measures under ~30ch that create ragged three-word lines. Reflow
  instead.
- **Text over images:** use a scrim or solid panel and verify 4.5:1 over the worst area of the
  image. Prefer text beside the image over text on busy photography.
- **Truncation:** use `line-clamp` only for previews whose full text is reachable. Never truncate
  prices, dates, names, or anything needed to decide.
- **Labels and terminology:** sentence case, no trailing periods on buttons and labels, and one term
  per concept ("Sign in" everywhere, not "Log in" in one place and "Login" in another).
- **Key-value facts** (specs, hours, prices): `<dl>` styled as a clean two-column list with
  `tabular-nums`, not bullets and not cards.
- **Testimonials** (real only): the quote, the person's name, role, and organization, and a photo
  only with permission. Restrained typography, no oversized quote glyph.

### 7.4 Writing patterns that mark body text as generated

Remove these from any prose you write or edit. They are tells because readers have seen them
thousands of times.

- **Openers:** "In today's fast-paced world", "Imagine a world where", "Have you ever wondered",
  "Whether you're a X or a Y".
- **Closers:** "In conclusion", "Ultimately", "At the end of the day", a summary paragraph that
  repeats the article.
- **Formulas:** "It's not X, it's Y", "Not only… but also", rhythmic triplets, "Here's the thing:",
  "Let's dive in/unpack", a rhetorical question immediately answered.
- **Filler hedges and intensifiers:** "It's important to note that", "truly", "incredibly",
  "really".
- **Uniform structure:** every section being heading + three bullets + a summary sentence; every
  paragraph opening with a bolded lead-in; every paragraph the same length.

**Instead:** lead with the point; give a specific example, number, or name early; vary paragraph and
sentence length; allow a section to be one strong paragraph; stop when the point is made.

---

## 8. Layout, spacing, and hierarchy

This is where "everything arranged and good" is won or lost.

**Spacing system**

- Use a **4px base** and a fixed scale: `4, 8, 12, 16, 24, 32, 48, 64, 96, 128`. Never use arbitrary
  values like `13px` or `37px`.
- **Proximity rule:** space between _related_ items must be clearly smaller than space between
  _unrelated_ groups (at least 2x). This alone fixes most "messy" layouts.
- **Section rhythm:** vertical padding like `clamp(4rem, 8vw, 8rem)`, varied between sections.
  Tighter within a topic, looser between topics.
- Use `gap` for sibling spacing, not margins on every child.

**Grid and container**

- One site container, e.g. `max-width: 80rem` with `px-4 sm:px-6 lg:px-8`. Prose measure is separate
  (`max-w-[62ch]`).
- Use a 12-column grid at desktop; collapse to a single column on mobile. Everything snaps to the
  grid (or leaves it deliberately, such as a full-bleed image).
- **Exposed hairline grid** (Swiss Editorial, Precision Dark): wrap major sections in a container
  such as `max-w-7xl mx-auto border-x border-line`, divide regions with `divide-y` / `divide-x`
  hairlines, and optionally mark key intersections with small `+` crosshairs (a pseudo-element or
  tiny inline SVG). Every line must align across sections; a misaligned hairline looks worse than
  none.
- Align edges: shared left edges for headings, text, and buttons within a section. Misaligned left
  edges are the fastest way to look amateur.
- Optically align icons with adjacent text; fix icon/text baseline offsets.
- Use container queries (`@container`) for components that live in different widths.

**Hierarchy**

- Max **one primary CTA** per viewport. Secondary actions are visually lighter (outline or text
  link).
- Group related content into clear regions. Separate regions with space, a hairline, or a surface
  change; use only one of the three per boundary.
- Use size, weight, and color contrast for hierarchy in that order; avoid adding boxes and shadows
  to create it.

**Radii and elevation**

- Define a radius scale (e.g., `4 / 8 / 12 / 16`) and map roles to it: controls 8, cards 12,
  modals 16. Do not use `rounded-2xl` on everything.
- **Concentric radii (avoid equal inner/outer rounding):** Avoid the urge to round inner elements
  the same amount as the container card. Giving a nested badge, image, button, or child panel the
  same radius as the outer frame creates awkward, pinched corners where the negative space warps.
  Instead, scale the inner curve up to the size of your outer frame using the concentric formula:
  `outer radius = inner radius + padding` (or `inner radius = max(0, outer radius − padding)`).
  - Outer `16px` (`rounded-2xl`) + `p-2` (8px padding) → Inner `8px` (`rounded-lg`).
  - Outer `24px` (`rounded-3xl`) + `p-4` (16px padding) → Inner `8px` (`rounded-lg`).
  - When `padding >= outer radius` (e.g. `rounded-2xl` with `p-4` [16px]): inner corners should be
    flat (`0px`) or have only a subtle micro-radius (`2–4px`), never the card's 16px.
- Define **three elevation levels** (flat, raised, floating) as tokens. Combine a 1px border, an
  optional top highlight, and a multi-layer ambient shadow. Avoid `shadow-2xl`.
- Use bento grids only when the content is genuinely heterogeneous (varied shapes of information).
  Build them on a 12-column grid with unequal spans (for example `col-span-12 lg:col-span-7` beside
  `lg:col-span-5`), never three equal cards. Each cell must contain a real proof artifact (mini UI,
  diagram, code diff, sparkline), not an icon and a paragraph.

---

## 9. Components and states

Every interactive component defines all of these. Missing states are what make a site feel
unfinished.

| State            | Requirement                                                                                        |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| Default          | Clear affordance; looks interactive without hovering                                               |
| `:hover`         | Subtle change (150ms ease-out); never the only cue                                                 |
| `:focus-visible` | 2px ring, 2px offset, 3:1 contrast against both adjacent colors; never remove without replacement  |
| `:active`        | Slight press (`scale-[0.98]` or a 1px shift)                                                       |
| `disabled`       | Reduced contrast but still legible; `aria-disabled` when it must stay focusable                    |
| Loading          | Skeleton matching the final layout (no layout jump), or an inline spinner with an accessible label |
| Empty            | Explains what belongs here and offers the next action                                              |
| Error            | Says what happened and how to fix it, in plain language; keeps the user's input                    |
| Populated        | The designed state, tested with long strings, many items, and missing optional data                |

**Specifics:**

- **Buttons:** one clear height scale (e.g., 32/40/48), consistent radius, label is verb + object
  ("Book a room", not "Submit"). Tailwind v4 buttons default to `cursor: default`; add
  `cursor-pointer` in your base styles if you want the pointer.
- **Forms:** visible `<label>` for every field (placeholder is not a label), correct
  `type`/`inputmode`/`autocomplete`, inline validation after blur, error text linked via
  `aria-describedby`, input text at 16px or larger to prevent mobile zoom. Group with
  `<fieldset>`/`<legend>`.
- **Navigation:** sticky header at most 56–72px tall, clear current-page state
  (`aria-current="page"`), mobile menu that traps focus and closes on Escape (native `<dialog>` or
  Popover API where possible), skip link as the first focusable element.
- **Tables:** left-align text, right-align numbers with `tabular-nums`, sticky header, row hover,
  horizontal scroll inside its own container on mobile.
- **Cards:** only when the content is a discrete, linkable unit. Make the whole card one link target
  (one accessible name), not several competing links.
- **Modals/popovers:** use `<dialog>` or the Popover API; trap focus, restore it on close, close on
  Escape.
- **Touch targets:** 44×44px minimum hit area on mobile (WCAG 2.2 AA requires at least 24px; 44px is
  the practical standard).
- **Toasts/feedback:** announce with `role="status"`; do not auto-dismiss anything that needs
  action.

---

## 10. Imagery, icons, and illustration

- **Photography:** real and domain-specific. Keep one treatment across the set (consistent aspect
  ratios, color grade, crop logic). Use `<picture>` with AVIF/WebP, `srcset`/`sizes`, explicit
  `width`/`height` or `aspect-ratio`, `loading="lazy"` below the fold, and `fetchpriority="high"`
  for the single LCP image.
- **No assets available?** Do not paste random stock URLs. Use typographic compositions, CSS grid
  patterns, inline SVG schematics, or clearly labeled placeholder frames at the correct aspect ratio
  (e.g., `Image 4:3 — harbour at dusk`).
- **Alt text:** describe content and purpose; use `alt=""` for purely decorative images.
- **Icons:** one family, one stroke width (1.5px typical), sizes on a grid (16/20/24). Do not put
  every icon in a colored circle. Icons support labels; they do not replace them.
- **SVG craft:** for diagrams, data flows, and telemetry, draw clean inline SVG with 1px strokes,
  `currentColor` inheritance, and `stroke-dasharray` for animated paths. Avoid glossy 3D blobs and
  generic abstract shapes.

---

## 11. Copy and content integrity

Copy is part of the design. Generic words destroy a visual system faster than any bad color.

**Voice rules**

- Name the thing in the first line. A visitor should know what this is in 3 seconds.
- Use concrete nouns, strong verbs, and specifics (numbers, places, units, names).
- Vary sentence length. Avoid rhythmic triplets ("fast, simple, and powerful") and the "It's not
  just X, it's Y" construction.
- Write button labels as verb + object. Never repeat "Learn more" five times on one page.
- Write error and empty states like a helpful person, not a system.
- Use a sparing hand with em dashes and exclamation marks.
- For titles, headings, article display, and prose tells, follow section 7.

**Banned vocabulary** (these signal generated copy): _unleash, elevate, supercharge, next-gen,
seamless, empower, revolutionize, game-changing, dive in, delve, craft/crafted (as filler),
streamline, leverage, cutting-edge, robust, holistic, transform, reimagine, unlock, journey,
tapestry, landscape, world-class, all-in-one, effortless, "in today's fast-paced world"._

**Before and after**

| Generic                                                | Specific                                                                                        |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| "Supercharge your workflow with seamless integrations" | "Sync issues from GitHub and Linear. Two-way, with conflict history."                           |
| "Experience the magic of Portugal"                     | "Seven days between Lisbon and the Alentejo coast, with local guides. Small groups of up to 8." |
| "Fast performance"                                     | "Sub-12ms edge routing across 310 locations" _(only if true, or labeled as sample)_             |

**Content integrity (non-negotiable)**

- **Never fabricate real-world claims:** customer logos, customer counts, testimonials, awards,
  press quotes, certifications, reviews, prices, or performance statistics presented as fact about
  the real product. They are a trust and legal hazard.
- **Sample data inside a product mockup is allowed** when it is clearly illustrative: realistic
  domain records, timestamps (`2026-10-13 14:22:09 UTC`), and metrics inside a UI preview. Mark it
  in code (`// sample data`) and mention it in your delivery note. Do not present sample numbers as
  claims in headings or marketing copy.
- **If the user gave no copy,** write honest, specific copy from what you know about the product.
  For unknown facts, use a visible bracketed placeholder (`[Customer quote — add real testimonial]`)
  and list every placeholder in your final message.
- Prefer showing over claiming: a real UI preview, a real itinerary, a real data table.

---

## 12. Motion

Motion explains change and confirms action. It is not decoration.

- **Timing:** `150ms ease-out` for hover and focus; `250–400ms` with
  `cubic-bezier(0.22, 1, 0.36, 1)` for entrances; nothing over 600ms in UI.
- **Properties:** animate `transform` and `opacity`. Do not animate `width`, `height`, `top`, or
  `left` (use transforms, or `grid-template-rows` transitions for expand/collapse).
- **Stagger** at most 5 items, 40–60ms apart; reveal once, not on every scroll.
- **Reduced motion is mandatory:** wrap non-essential motion in
  `@media (prefers-reduced-motion: no-preference)` or use `motion-reduce:` variants. Replace
  movement with fades, not nothing.
- **Page transitions:** use the framework's view-transition support if the project has it (Astro's
  `ClientRouter` in Astro 5+; verify against the installed version).
- Never block interaction behind an animation, and never autoplay looping motion that cannot be
  paused.

---

## 13. Accessibility baseline (WCAG 2.2 AA)

- Semantic landmarks (`<header>`, `<nav>`, `<main>`, `<section>` with a heading, `<footer>`), one
  `<h1>`, and heading levels that do not skip.
- Use native elements first: `<button>` for actions, `<a>` for navigation, `<dialog>`, `<details>`,
  and real form controls. ARIA only when no native element fits.
- Full keyboard operability, logical focus order, visible focus, a skip link, and no keyboard traps.
- Set `lang` on `<html>`; mark language changes inline.
- Support zoom: never set `user-scalable=no`; layouts survive 200% zoom and 320px width without
  horizontal scroll.
- Respect `prefers-reduced-motion`, `prefers-color-scheme`, and (where practical) `prefers-contrast`
  and `forced-colors`.
- Do not use color as the only signal; keep text and UI contrast within the limits in section 5.
- Provide text alternatives for meaningful images, charts, and icon-only buttons (`aria-label`).

---

## 14. Framework and architecture discipline

**Check versions first.** Read `package.json` and match syntax to the installed Tailwind, Astro,
React, and shadcn versions. If unsure about a recent API, check the docs instead of guessing.

**Server-first rendering**

- Keep marketing sections, layout shells, and typography as zero-JS output: `.astro` components or
  React Server Components.
- Hydrate only leaf interactivity. In Astro use the lightest directive that works: `client:visible`
  for below-the-fold widgets, `client:idle` for non-critical, `client:load` only when needed
  immediately. Use CSS, `<details>`, `<dialog>`, and Popover before reaching for a React island.
- Avoid `useEffect` for things CSS can do (scroll effects, hover states, responsive layout).
- With Hono: keep it as the data/API and rendering layer, and return typed, human-readable errors so
  the UI can render designed error states.

**Tailwind v4 (CSS-first)**

- Configure tokens in CSS with `@import "tailwindcss";` and `@theme { ... }`. Do not scatter
  arbitrary hex values or magic numbers through markup.
- Dark mode via class: `@custom-variant dark (&:where(.dark, .dark *));`. Set the theme before first
  paint (tiny inline script in `<head>`) to avoid a flash.
- v4 changes that bite: borders default to `currentColor` (always set a border color token);
  `shadow-sm`→`shadow-xs`, `shadow`→`shadow-sm`; `rounded-sm`→`rounded-xs`;
  `outline-none`→`outline-hidden`; `bg-gradient-*`→`bg-linear-*`; `ring` is 1px (use `ring-3` for
  the old 3px); opacity via `bg-black/50`, not `bg-opacity-*`.

**shadcn/ui**

- Components are copied into the repo, so customize them: map `--radius`, `--primary`, `--ring`, and
  neutrals to your tokens; replace the stock slate palette with tinted neutrals; adjust density and
  typography; remove the default `rounded-md` look unless it matches your radius scale.
- A shadcn project that still looks like the stock docs site is slop.

**Performance (Core Web Vitals)**

- LCP: one prioritized hero image or text block, no render-blocking fonts or scripts. CLS: reserve
  space with `aspect-ratio`, intrinsic image sizes, and font fallbacks. INP: keep interactions
  light, defer heavy JS.
- Use `100dvh`, not `100vh`, for full-height mobile layouts.
- Do not add a library for something a few lines of CSS can do.

---

## 15. Responsive, dark mode, and internationalization

- **Mobile-first.** Design at 375px, then enhance at ~640, 768, 1024, 1280, and 1536. Test at 320px
  for overflow.
- **Layout should reflow, not shrink:** stack columns, reorder if needed, keep tap targets large,
  move secondary content below the fold.
- Use fluid values (`clamp`) for type and section padding rather than many breakpoint jumps.
- **Dark mode** is a redesign of surfaces, not an inversion: raise elevation with lightness, lower
  accent chroma slightly, re-verify contrast, and soften pure white text. Support `color-scheme` so
  native controls match.
- **Internationalization:** use logical properties and utilities (`ms-*`, `ps-*`, `text-start`,
  `inset-inline-*`) so layouts work in RTL languages. Allow 30–40% text expansion in buttons and
  nav. Avoid text baked into images. Format dates, numbers, and currency with `Intl`.

---

## 16. Page-type blueprints

Use these as sequences of _jobs_, not templates. Vary layout between sections, and cut any section
that has no job.

**Marketing / landing page**

1. Hero: thesis, one primary CTA, and a concrete artifact (UI, product, place, data).
2. Proof of how it works: real previews, demo, or diagram.
3. Differentiators: asymmetric, each backed by evidence.
4. Depth for skeptics: specs, integrations, pricing logic, or FAQs answering real objections.
5. Honest social proof (only if real), then a closing CTA that restates the offer plainly.

**Dashboard / application**

1. Persistent navigation and context (workspace, user, environment).
2. A clear primary task area; a summary row only if it informs decisions.
3. Tables and charts with all four data states; filters and saved views; keyboard access.
4. Consistent density, predictable actions, and undo over confirm-dialogs where possible.

**Editorial / content / tourism** (article display rules are in section 7)

1. Strong opening image or statement with practical context (where, when, how long).
2. Narrative sections that alternate image-led and text-led layouts, with captions and metadata.
3. Practical details as first-class UI (maps, hours, prices, distances, booking steps).
4. Related content and a clear next step.

**E-commerce**

1. Product imagery and key facts above the fold; price, availability, and primary action visible.
2. Variants and shipping or returns clarity before the decision point.
3. Reviews only if real; structured specs; related items without clutter.

**Docs / knowledge base**

1. Persistent navigation and search; readable measure; code blocks with copy and syntax color that
   meets contrast.
2. On-page table of contents; clear "next/previous"; versioning visible.

---

## 17. Refactor and audit mode

When improving existing UI instead of building new:

1. **Audit first.** List specific problems against sections 3, 7, 8, 9, and 13. Be concrete
   ("headings use 5 unrelated sizes", "focus ring removed on buttons", "cards all `rounded-2xl`").
2. **Preserve behavior and brand.** Keep routes, data flow, copy meaning, and any established
   identity unless asked to change them.
3. **Fix foundations before surface:** tokens, type scale, spacing, then components, then
   decoration.
4. **Make the smallest coherent set of changes** that resolves the audit, and summarize them by
   category for the user.
5. Flag anything you intentionally left alone.

---

## 18. Pre-delivery verification

Run each check on your output and fix failures before delivering. If tooling is available (a
browser, screenshots, axe, Lighthouse), use it at 375, 768, 1280, and 1536px.

**A. Cliché audit.** No purple/indigo-cyan gradients, gradient text, sparkle badges, emoji icons,
three identical icon cards, fake logos or testimonials, or banned vocabulary. Every removal has a
motivated replacement.

**B. Motivation tests.**

- _Swap test:_ if you replaced the product name and logo with another company's, would the page
  still fit? If yes, it is generic. Add domain-specific content and structure.
- _Squint test:_ blur the page. Is there one clear focal point and a visible hierarchy of at most
  three levels?
- _Grayscale test:_ does hierarchy survive without color?

**C. System integrity.**

- Colors, radii, shadows, fonts, and spacing all come from tokens; no stray arbitrary values.
- Type scale, line-height, measure (45–75ch), and `tabular-nums` are correct.
- Nested radii are concentric; edges and grid hairlines align; related items are closer than
  unrelated ones.

**D. States and robustness.**

- Hover, focus-visible, active, disabled, loading, empty, error, populated all exist.
- Content stress test: very long names, missing images, zero results, 200 items, 400% zoom, 320px
  width, and RTL text do not break the layout.

**E. Accessibility and performance.**

- Keyboard-only walkthrough works; focus is visible; contrast meets AA; landmarks and heading order
  are correct; reduced motion is respected; touch targets are at least 44px.
- Images have dimensions and alt text; the LCP element is prioritized; client JS is limited to leaf
  islands.

**F. Text and reading.**

- Titles pass the generic test (not usable on 1,000 other pages); headings pass the outline test,
  with no skipped levels.
- Article body has a 60–70ch measure, 1.6+ line-height, descriptive links, sparing bold, real lists,
  and captions on figures.
- No banned openers, closers, or formula phrases (section 7.4); typographic details (curly quotes,
  en dashes, non-breaking units) are applied.

---

## 19. Delivery format

- **Deliver complete, working code.** No `// rest of the component here`, no stubbed sections, no
  TODOs for core UI. Include the token file, global styles, and every component the page needs.
- **Order files logically:** tokens/global CSS, layout shell, components, then the page. Match the
  project's existing structure and naming.
- **Close with a short note** (not a self-congratulatory essay): the design direction in 2–4 lines
  (archetype, signature move, type and color choices), the list of placeholders or sample data, any
  assumption you made, and how to run or preview it.
- If something the user asked for conflicts with this skill (for example, an explicit request for a
  purple gradient hero), do what the user asked and execute it with craft; mention a better
  alternative briefly only if it helps.

---

## Gotchas

- **Subtle beats loud.** Keep spotlights under 8% opacity and noise overlays at 1.5%–3%. If you
  notice the effect, it is too strong.
- **Moody does not excuse low contrast.** Primary text stays crisp (`zinc-50`/`zinc-100` range),
  secondary stays readable (`zinc-400` or lighter on dark), and only decorative metadata drops
  lower.
- **Archetypes are not paint.** Applying "Precision Dark Craft" to a bakery site is slop with extra
  steps. Match the domain.
- **Do not over-engineer.** A restrained page with excellent spacing and type beats a busy page with
  ten effects.
- **Stock photos are not a fallback.** Placeholder frames and typographic compositions look more
  intentional than random imagery.
- **Consistency beats cleverness.** One radius scale, one icon set, one spacing scale, one
  container. Break them only with a reason you could explain to a client.
- **Titles are design, not afterthoughts.** A beautiful layout with "The Ultimate Guide to X" at the
  top still reads as generated.
- **Don't fix text with decoration.** Callouts, pull quotes, and bullets cannot rescue weak writing
  or missing structure.
- **Test with real content.** Designs that only work with perfect three-word headings and square
  images are not finished.

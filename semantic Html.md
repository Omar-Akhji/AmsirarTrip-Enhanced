# The Complete HTML Cheat Sheet — June 2026 Edition

> **What is Semantic HTML?** Semantic HTML uses markup to reinforce the _meaning_ of content, not
> just its appearance. Example: `<article>` defines self-contained content. `<div>` has no meaning —
> it's a layout tool. Semantic HTML improves SEO, accessibility, and code maintainability — and in
> 2026, it increasingly **replaces JavaScript** for interactivity that used to require a library
> (dropdowns, tooltips, dialogs, popovers, declarative buttons).

> **What is Baseline?** "Baseline" (defined by the WebDX Community Group, surfaced on MDN and
> web.dev) has two stages:
>
> - 🆕 **Newly available** — works in the current stable release of Chrome, Edge, Firefox, **and**
>   Safari. Safe to ship today for users on up-to-date browsers.
> - ✅ **Widely available** — 30 months have passed since "newly available." Safe to use without a
>   second thought, even for legacy device support.
> - 🟡 **Limited availability** — shipped in at least one major engine but not yet interoperable.
>   Treat as progressive enhancement, behind `@supports`, with a fallback.
> - ⚗️ **Experimental** — behind a flag or only in a preview/nightly channel. Not production-safe.
>
> This edition reflects the state of the web platform as of **June 27, 2026**. Several features that
> were "Newly available" or "🟡 Limited" in the April 2026 edition have since shipped further (or,
> in a couple of cases, the recommended syntax changed — see the callouts marked ⚠️ **Correction**).

---

## Table of Contents

1. [Document Structure & Boilerplate](#1-document-structure--boilerplate)
2. [Document Information — Head Tags](#2-document-information--head-tags)
3. [Meta Tags, SEO & Social Sharing](#3-meta-tags-seo--social-sharing)
4. [Page Structure Tags](#4-page-structure-tags)
5. [Text Formatting](#5-text-formatting)
6. [Links](#6-links)
7. [Images & Responsive Media](#7-images--responsive-media)
8. [Lists](#8-lists)
9. [Forms & Inputs](#9-forms--inputs)
10. [Tables](#10-tables)
11. [Multimedia & Embeds](#11-multimedia--embeds)
12. [HTML5 Semantic & Structural Tags](#12-html5-semantic--structural-tags)
13. [Declarative UI 2026 — Popover, Invoker Commands, Interest & Anchor Positioning](#13-declarative-ui-2026--popover-invoker-commands-interest--anchor-positioning)
14. [Global Attributes](#14-global-attributes)
15. [ARIA Accessibility Attributes](#15-aria-accessibility-attributes)
16. [Event Attributes — Inline Reference](#16-event-attributes--inline-reference)
17. [Performance & Navigation — Speculation Rules, View Transitions, Resource Hints](#17-performance--navigation--speculation-rules-view-transitions-resource-hints)
18. [Character Entities](#18-character-entities)
19. [Deprecated, Removed & Outdated-Technique Reference](#19-deprecated-removed--outdated-technique-reference)

---

## 1. Document Structure & Boilerplate

| Tag                          | Description                                                                                                       |
| :--------------------------- | :---------------------------------------------------------------------------------------------------------------- |
| `<!DOCTYPE html>`            | Declares the document type as HTML5. Must be the very first line — no exceptions.                                 |
| `<html lang="en"> … </html>` | Root element wrapping the entire document. The `lang` attribute is **required** for accessibility and SEO.        |
| `<head> … </head>`           | Container for metadata — never rendered visually on the page.                                                     |
| `<body> … </body>`           | Container for all visible page content.                                                                           |
| `<title> … </title>`         | **Mandatory.** Sets the tab name, browser history label, and search engine headline. Keep it under 60 characters. |

> **Minimal HTML5 Boilerplate (June 2026)**
>
> ```html
> <!DOCTYPE html>
> <html lang="en">
>   <head>
>     <meta charset="UTF-8" />
>     <meta
>       name="viewport"
>       content="width=device-width, initial-scale=1.0"
>     />
>     <meta
>       name="description"
>       content="A clear, concise page description."
>     />
>     <meta
>       name="color-scheme"
>       content="light dark"
>     />
>     <title>Page Title — Site Name</title>
>     <link
>       rel="stylesheet"
>       href="styles.css"
>     />
>   </head>
>   <body>
>     <header>…</header>
>     <main>…</main>
>     <footer>…</footer>
>     <script
>       src="app.js"
>       defer
>     ></script>
>   </body>
> </html>
> ```
>
> **Key choices explained:**
>
> - `charset` and `viewport` go first — always.
> - `<meta name="color-scheme">` is now standard practice: it tells the browser to theme its own
>   native UI (form controls, scrollbars) to match your light/dark support, with zero extra CSS.
> - `<script defer>` at the end of `<body>` (or in `<head>`) is the modern standard.
> - `<header>`, `<main>`, `<footer>` provide semantic page landmarks out of the box.
> - Reach for a `<search>` element (✅ Baseline widely available) anywhere you'd have written
>   `<div class="search">`.

---

## 2. Document Information — Head Tags

| Tag                        | Description                                                                                       |
| :------------------------- | :------------------------------------------------------------------------------------------------ |
| `<meta>`                   | Provides page metadata: charset, viewport, description, author, robots, and more.                 |
| `<link>`                   | Links external resources — stylesheets, favicons, preloads, canonical URLs.                       |
| `<style> … </style>`       | Embeds internal CSS. Use sparingly; prefer external stylesheets for maintainability.              |
| `<script> … </script>`     | Embeds or references JavaScript. Use `defer` or `async` to avoid blocking HTML parsing.           |
| `<noscript> … </noscript>` | Fallback content shown when JavaScript is disabled or not supported. Important for accessibility. |
| `<base href="url">`        | Sets the base URL for all relative URLs on the page. Only one `<base>` allowed per document.      |
| `<template> … </template>` | Inert HTML fragment not rendered until cloned by JavaScript. Used in Web Components.              |

### `<script>` Key Attributes

| Attribute                                  | Description                                                                                                                                           |
| :----------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src="url"`                                | Path to an external JS file.                                                                                                                          |
| `defer`                                    | Downloads in parallel; executes **after** HTML is fully parsed. **Preferred for most scripts.** Preserves execution order.                            |
| `async`                                    | Downloads in parallel; executes **immediately** when ready. Order is not guaranteed. Best for independent analytics-type scripts.                     |
| `type="module"`                            | Treats the script as an ES module. Automatically deferred. Enables `import`/`export` syntax.                                                          |
| `type="speculationrules"`                  | 🟡 **Chromium-only, not Baseline.** Holds a JSON ruleset for the Speculation Rules API (prefetch/prerender future navigations). See §17.              |
| `crossorigin="anonymous\|use-credentials"` | Enables CORS requests for scripts from a different origin (required for `integrity` checking).                                                        |
| `integrity="sha384-…"`                     | Subresource Integrity (SRI) hash. Browser refuses to execute the script if the hash doesn't match.                                                    |
| `fetchpriority="high\|low\|auto"`          | Hints the browser to prioritize or deprioritize fetching this script. ✅ **Baseline.**                                                                |
| `blocking="render"`                        | Blocks rendering until the script executes. Use only for critical render-blocking scripts — measure the impact on Core Web Vitals before shipping it. |
| `nomodule`                                 | Script is only loaded by browsers that do **not** support ES modules. Used for legacy fallbacks.                                                      |

### `<link>` Key Attributes & `rel` Values

| `rel` Value        | Description                                                                                                                                                                                                                                                  |
| :----------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `stylesheet`       | Links an external CSS file. Most common use.                                                                                                                                                                                                                 |
| `preload`          | Tells the browser to fetch a resource early (fonts, hero images, critical scripts). Pair with `as="font\|image\|script\|style"`.                                                                                                                             |
| `prefetch`         | Fetches a resource that will likely be needed soon (next page navigation). Low priority.                                                                                                                                                                     |
| `preconnect`       | Establishes a TCP/TLS connection to a third-party origin early.                                                                                                                                                                                              |
| `dns-prefetch`     | Resolves DNS for a third-party domain early. Lighter than `preconnect`. ✅ **Baseline 2025.**                                                                                                                                                                |
| `expect`           | 🟡 **New, Interop 2026 focus area.** Tells the browser an element matching a selector is expected to appear in the DOM, letting it delay first render/parser-blocking until that element exists. Useful for avoiding flashes of unstyled/incomplete content. |
| `icon`             | Specifies the page favicon.                                                                                                                                                                                                                                  |
| `apple-touch-icon` | Specifies the icon used when the page is saved to an iOS home screen.                                                                                                                                                                                        |
| `manifest`         | Links a Web App Manifest (PWA support).                                                                                                                                                                                                                      |
| `canonical`        | Tells search engines which URL is the preferred version of a page. Critical for SEO.                                                                                                                                                                         |
| `alternate`        | Specifies alternate versions: RSS feeds, translated pages (`hreflang`).                                                                                                                                                                                      |
| `modulepreload`    | Preloads an ES module and its dependencies.                                                                                                                                                                                                                  |

| Other `<link>` Attributes            | Description                                                                             |
| :----------------------------------- | :-------------------------------------------------------------------------------------- |
| `href="url"`                         | **Required.** The URL of the linked resource.                                           |
| `as="font\|image\|script\|style\|…"` | Specifies the resource type for `rel="preload"` hints.                                  |
| `media=""`                           | Applies the link only for matching media queries (e.g., `print`, `(min-width: 600px)`). |
| `fetchpriority="high\|low\|auto"`    | Priority hint for the fetch. Useful on `rel="preload"` for LCP images. ✅ **Baseline.** |
| `crossorigin`                        | Enables CORS for fonts and other cross-origin resources.                                |

> ⚠️ **Correction vs. earlier editions / older tutorials:**
> `<meta name="view-transition" content="same-origin">` is an **obsolete, deprecated syntax** that
> briefly shipped behind a flag while cross-document View Transitions were being prototyped. The
> current, shipped opt-in is a **CSS at-rule**, not an HTML tag — see §17.

---

## 3. Meta Tags, SEO & Social Sharing

### Core Meta Tags

| Tag                                                                      | Description                                                                                                                                                                                                           |
| :----------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<meta charset="UTF-8">`                                                 | **Required.** Sets character encoding. UTF-8 supports all languages and emoji. Used by ~99% of websites.                                                                                                              |
| `<meta name="viewport" content="width=device-width, initial-scale=1.0">` | **Required for responsive design.** Controls scaling on mobile browsers.                                                                                                                                              |
| `<meta name="description" content="…">`                                  | Page summary shown in search results. Keep 150–160 characters for best display.                                                                                                                                       |
| `<meta name="author" content="…">`                                       | Specifies the page's author.                                                                                                                                                                                          |
| `<meta name="robots" content="…">`                                       | Controls crawling/indexing. Values: `index`, `noindex`, `follow`, `nofollow`, `noarchive`, `nosnippet`.                                                                                                               |
| `<meta name="theme-color" content="#hex">`                               | Sets the browser UI / toolbar color on mobile. Can be scoped with `media` to provide different colors for light/dark.                                                                                                 |
| `<meta name="keywords" content="…">`                                     | Comma-separated keywords. Largely ignored by modern search engines.                                                                                                                                                   |
| `<meta http-equiv="refresh" content="30">`                               | Auto-refreshes the page after N seconds. Use sparingly — bad for accessibility.                                                                                                                                       |
| `<meta name="color-scheme" content="light dark">`                        | Declares which color schemes the page supports. Lets browsers theme their own built-in UI (scrollbars, form controls) to match, without extra CSS. Pairs naturally with CSS relative color syntax and `light-dark()`. |

### Open Graph (Social Sharing)

Used by Facebook, LinkedIn, Slack, and most social platforms to generate link previews.

```html
<meta
  property="og:title"
  content="Page Title"
/>
<meta
  property="og:description"
  content="A short, engaging description."
/>
<meta
  property="og:image"
  content="https://example.com/og-image.jpg"
/>
<meta
  property="og:url"
  content="https://example.com/page"
/>
<meta
  property="og:type"
  content="website"
/>
<meta
  property="og:site_name"
  content="Your Site Name"
/>
<meta
  property="og:locale"
  content="en_US"
/>
```

### Twitter / X Card Meta Tags

```html
<meta
  name="twitter:card"
  content="summary_large_image"
/>
<meta
  name="twitter:title"
  content="Page Title"
/>
<meta
  name="twitter:description"
  content="Description."
/>
<meta
  name="twitter:image"
  content="https://example.com/twitter-card.jpg"
/>
<meta
  name="twitter:site"
  content="@YourHandle"
/>
<meta
  name="twitter:creator"
  content="@AuthorHandle"
/>
```

> **Image sizing guide:** OG image: 1200×630px minimum. Twitter large card: 1200×628px. Keep file
> size under 1MB.

---

## 4. Page Structure Tags

| Tag                                       | Description                                                                                                      |
| :---------------------------------------- | :--------------------------------------------------------------------------------------------------------------- |
| `<h1> … </h1>` to `<h6> … </h6>`          | Headings. `<h1>` is the page's main title — **use only one per page** for SEO. Never skip heading levels.        |
| `<p> … </p>`                              | A paragraph of text.                                                                                             |
| `<br>`                                    | Line break. Void element — no closing tag. Use sparingly; prefer CSS `margin` for spacing.                       |
| `<hr>`                                    | Thematic break rendered as a horizontal line. Semantic — it means a topic shift.                                 |
| `<div> … </div>`                          | Generic block-level container with no semantic meaning. Use when no semantic element applies.                    |
| `<span> … </span>`                        | Generic inline container with no semantic meaning. Useful for targeting text fragments with CSS/JS.              |
| `<pre> … </pre>`                          | Preformatted text block. Preserves all whitespace and line breaks. Uses monospace font. Ideal for code examples. |
| `<blockquote cite="url"> … </blockquote>` | Block-level quotation. `cite` points to the source URL.                                                          |
| `<q cite="url"> … </q>`                   | Inline short quotation. Browsers automatically add quotation marks.                                              |

---

## 5. Text Formatting

| Tag                                      | Description                                                                                        |
| :--------------------------------------- | :------------------------------------------------------------------------------------------------- |
| `<strong> … </strong>`                   | **Bold** text with strong semantic importance (screen readers may stress it).                      |
| `<em> … </em>`                           | _Italic_ text with stressed emphasis (changes meaning of a sentence).                              |
| `<b> … </b>`                             | Bold text without semantic weight (e.g., keywords, product names).                                 |
| `<i> … </i>`                             | Italic text without emphasis (e.g., foreign words, technical terms, ship names).                   |
| `<u> … </u>`                             | Underline for unarticulated annotation (e.g., misspelling, proper noun in Chinese). Not for links. |
| `<s> … </s>`                             | Strikethrough — content no longer accurate or relevant (price change, outdated info).              |
| `<del datetime=""> … </del>`             | Text deleted from the document. Semantic — screen readers announce it.                             |
| `<ins datetime=""> … </ins>`             | Text inserted into the document. Use `datetime` for when the change occurred.                      |
| `<mark> … </mark>`                       | Highlighted text for reference (e.g., search result matches, key terms).                           |
| `<small> … </small>`                     | Fine print, legal text, copyright notices, or secondary information.                               |
| `<sub> … </sub>`                         | Subscript text (e.g., H₂O, log₁₀).                                                                 |
| `<sup> … </sup>`                         | Superscript text (e.g., E=mc², footnote markers²).                                                 |
| `<abbr title="full text"> … </abbr>`     | Abbreviation or acronym. The `title` shows the full form on hover.                                 |
| `<cite> … </cite>`                       | The **title** of a creative work (book, film, article, painting). Not for author names.            |
| `<dfn> … </dfn>`                         | Marks the defining instance of a term in text.                                                     |
| `<address> … </address>`                 | Contact information for the nearest `<article>` or the page itself (email, postal address).        |
| `<code> … </code>`                       | Inline code in monospace font. For code blocks use `<pre><code>…</code></pre>`.                    |
| `<kbd> … </kbd>`                         | Represents user keyboard input — e.g., `Ctrl+S`, `Enter`.                                          |
| `<samp> … </samp>`                       | Sample output from a computer program.                                                             |
| `<var> … </var>`                         | A variable in a mathematical expression or programming context.                                    |
| `<time datetime="2026-06-27"> … </time>` | A date/time value. `datetime` provides a machine-readable ISO 8601 format.                         |
| `<data value="…"> … </data>`             | Binds a human-readable value to a machine-readable equivalent.                                     |
| `<wbr>`                                  | A word-break opportunity. Hints where a long word or URL may be broken across lines.               |
| `<bdi> … </bdi>`                         | Bi-directional isolation. Isolates text whose direction is unknown (e.g., user-generated content). |
| `<bdo dir="ltr\|rtl"> … </bdo>`          | Bi-directional override. Forces text direction regardless of the document's default.               |
| `<ruby>`, `<rt>`, `<rp>`                 | East Asian typography annotations. `<rt>` = annotation text. `<rp>` = fallback parentheses.        |

---

## 6. Links

| Tag / Attribute                     | Description                                                                                                                                                                            |
| :---------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<a href="url"> … </a>`             | Anchor — creates a hyperlink. The `href` can be a URL, `#id`, `mailto:`, `tel:`, or a relative path.                                                                                   |
| `href="#element-id"`                | Navigates to an element with that `id` on the same page (in-page anchor link).                                                                                                         |
| `href="mailto:email@example.com"`   | Opens the user's mail client with a new message addressed to the given email.                                                                                                          |
| `href="tel:+212600000000"`          | Creates a clickable phone number. Essential for mobile users.                                                                                                                          |
| `href="sms:+212600000000"`          | Opens the SMS app on mobile devices.                                                                                                                                                   |
| `target="_blank"`                   | Opens link in a **new tab**. Always combine with `rel="noopener noreferrer"`.                                                                                                          |
| `target="_self"`                    | Opens in the same tab (default).                                                                                                                                                       |
| `target="_parent"`                  | Opens in the parent browsing context (iframes).                                                                                                                                        |
| `target="_top"`                     | Opens in the full body of the window, breaking out of all iframes.                                                                                                                     |
| `rel="noopener noreferrer"`         | **Security requirement** for `target="_blank"`. Prevents the opened page from accessing `window.opener`.                                                                               |
| `rel="nofollow"`                    | Tells search engines not to pass SEO authority ("link juice") to the target.                                                                                                           |
| `rel="sponsored"`                   | Marks a paid or advertising link (Google guideline).                                                                                                                                   |
| `rel="ugc"`                         | Marks user-generated content links (comments, forums).                                                                                                                                 |
| `download` or `download="filename"` | Prompts browser to download the target resource rather than navigate to it.                                                                                                            |
| `hreflang="lang-code"`              | Indicates the language of the linked document (e.g., `fr`, `ar`, `zh-Hans`).                                                                                                           |
| `referrerpolicy=""`                 | Controls how much referrer information is sent. Values: `no-referrer`, `origin`, `strict-origin-when-cross-origin`.                                                                    |
| `ping="url"`                        | Space-separated list of URLs notified (via POST) when the link is followed. Used for analytics.                                                                                        |
| `interestfor="id"`                  | 🟡 **Emerging — see §13.** Turns an `<a>` (or `<button>`) into an "interest invoker": hovering or focusing it can reveal a linked `popover="hint"` element, declaratively, without JS. |

> **Modern security pattern for external links:**
>
> ```html
> <a
>   href="https://external.com"
>   target="_blank"
>   rel="noopener noreferrer"
>   >External Link</a
> >
> ```

---

## 7. Images & Responsive Media

### `<img>` Attributes

| Attribute                         | Description                                                                                                             |
| :-------------------------------- | :---------------------------------------------------------------------------------------------------------------------- |
| `src="url"`                       | **Required.** Path to the image file.                                                                                   |
| `alt="text"`                      | **Required.** Alternative text for screen readers and when the image fails to load. Use `alt=""` for decorative images. |
| `width=""` / `height=""`          | Intrinsic dimensions in pixels. **Always set these** — prevents Cumulative Layout Shift (CLS).                          |
| `loading="lazy\|eager"`           | `lazy` defers loading until near the viewport. ✅ **Baseline.** Never lazy-load the LCP (hero) image.                   |
| `decoding="async\|sync\|auto"`    | Hints whether image decoding can happen off the main thread.                                                            |
| `srcset="" sizes=""`              | Provides multiple resolutions/widths for the browser to choose from responsively.                                       |
| `referrerpolicy=""`               | Controls the `Referer` header sent when fetching the image.                                                             |
| `ismap`                           | Marks the image as a server-side image map.                                                                             |
| `usemap="#mapname"`               | Associates the image with a client-side image map.                                                                      |
| `elementtiming="label"`           | Registers the image for the Element Timing API (performance observability).                                             |
| `fetchpriority="high\|low\|auto"` | Prioritizes the LCP candidate image above other resources. ✅ **Baseline.**                                             |

> 🟡 **Emerging:** Chrome 148 (May 2026) introduced **native lazy loading for `<video>` and
> `<audio>`** via the same `loading="lazy"` attribute already used on `<img>`/`<iframe>`. This
> delays fetching the media resource until it nears the viewport. It is Chromium-only for now — not
> yet Baseline — so treat it as a free progressive enhancement rather than something to rely on
> cross-browser.

### Responsive Images with `<picture>`

```html
<!-- Modern responsive image pattern -->
<picture>
  <!-- WebP for modern browsers, different sizes for different screens -->
  <source
    type="image/webp"
    srcset="hero-480.webp 480w, hero-960.webp 960w, hero-1920.webp 1920w"
    sizes="(max-width: 600px) 100vw, (max-width: 1200px) 80vw, 1200px"
  />
  <!-- JPEG fallback -->
  <source
    type="image/jpeg"
    srcset="hero-480.jpg 480w, hero-960.jpg 960w, hero-1920.jpg 1920w"
    sizes="(max-width: 600px) 100vw, (max-width: 1200px) 80vw, 1200px"
  />
  <!-- Final fallback img — always required -->
  <img
    src="hero-960.jpg"
    alt="Descriptive alt text here"
    width="1920"
    height="1080"
    loading="eager"
    decoding="async"
    fetchpriority="high"
  />
</picture>
```

> **Performance rule of thumb:**
>
> - Above the fold (hero image): `loading="eager"` + `fetchpriority="high"` + `decoding="async"`
> - Below the fold: `loading="lazy"` + `decoding="async"` (no `fetchpriority`)
> - For a responsive hero image specifically, also preload it with matching
>   `imagesrcset`/`imagesizes` so the browser doesn't have to wait for CSS/layout to know which size
>   to fetch:
>   `<link rel="preload" as="image" href="hero-960.jpg" imagesrcset="hero-480.jpg 480w, hero-960.jpg 960w, hero-1920.jpg 1920w" imagesizes="100vw" fetchpriority="high">`

### Image Maps

| Tag / Attribute                       | Description                                                                                     |
| :------------------------------------ | :---------------------------------------------------------------------------------------------- |
| `<map name="mapname"> … </map>`       | Defines a client-side image map referenced by an `<img usemap="#mapname">`.                     |
| `<area>`                              | Defines a clickable region inside the map.                                                      |
| `shape="rect\|circle\|poly\|default"` | Shape of the clickable area.                                                                    |
| `coords=""`                           | Coordinates defining the shape (rect: `x1,y1,x2,y2`; circle: `cx,cy,r`; poly: `x1,y1,x2,y2,…`). |
| `href=""`                             | Link destination for the area.                                                                  |
| `alt=""`                              | **Required** alternative text for the area.                                                     |
| `target=""`                           | Where to open the linked URL.                                                                   |

---

## 8. Lists

| Tag            | Description                                                                                      |
| :------------- | :----------------------------------------------------------------------------------------------- |
| `<ul> … </ul>` | Unordered (bulleted) list.                                                                       |
| `<ol> … </ol>` | Ordered (numbered) list. Supports `type="1\|A\|a\|I\|i"`, `start="N"`, and `reversed` attribute. |
| `<li> … </li>` | An individual list item. Used inside both `<ul>` and `<ol>`.                                     |
| `<dl> … </dl>` | Description list — semantically pairs terms with their definitions.                              |
| `<dt> … </dt>` | A term in a `<dl>`.                                                                              |
| `<dd> … </dd>` | The description/definition for the preceding `<dt>`.                                             |

> **Accessibility note:** Browsers sometimes strip list semantics from `<ul>` and `<ol>` when
> `list-style: none` is applied via CSS. Add `role="list"` to preserve the semantic meaning if you
> remove default list styles.

---

## 9. Forms & Inputs

### The `<form>` Element

| Attribute                | Description                                                                                                                           |
| :----------------------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| `action="url"`           | URL where form data is sent on submission. Omit for same-page handling via JS.                                                        |
| `method="GET\|POST"`     | HTTP method. Use `POST` for sensitive data or large payloads. `GET` appends data to the URL.                                          |
| `enctype=""`             | Encoding type. **Must be `multipart/form-data`** when the form includes file uploads. `application/x-www-form-urlencoded` is default. |
| `target=""`              | Where the response renders: `_self` (default), `_blank`, `_parent`, `_top`.                                                           |
| `autocomplete="on\|off"` | Enables or disables browser autocomplete for the entire form.                                                                         |
| `novalidate`             | Disables the browser's built-in HTML5 constraint validation. Useful when using custom JS validation.                                  |

### The `<input>` Element

| Attribute                                                          | Description                                                                                               |
| :----------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------- |
| `type=""`                                                          | **Required.** Declares input type (see full list below). Defaults to `text` if omitted.                   |
| `name=""`                                                          | Key name sent with form data. Required for the field to be included in submission.                        |
| `id=""`                                                            | Unique identifier. Must match the `for` attribute on the associated `<label>`.                            |
| `value=""`                                                         | Current/default value.                                                                                    |
| `placeholder=""`                                                   | Hint text shown in empty fields. Not a substitute for `<label>`.                                          |
| `required`                                                         | Field must be filled before form submission.                                                              |
| `disabled`                                                         | Disables the field. Not submitted with the form.                                                          |
| `readonly`                                                         | Field is visible but not editable. Value **is** submitted.                                                |
| `autofocus`                                                        | Auto-focuses this field on page load. Use on at most one element per page.                                |
| `autocomplete="on\|off\|email\|new-password\|current-password\|…"` | Controls browser autocomplete behavior for this field. `new-password` prevents managers from autofilling. |
| `maxlength=""` / `minlength=""`                                    | Maximum / minimum number of characters allowed.                                                           |
| `min=""` / `max=""` / `step=""`                                    | Range constraints and increment steps for numeric, range, and date inputs.                                |
| `pattern=""`                                                       | A regular expression the value must match (e.g., `pattern="[A-Za-z]{3,10}"`).                             |
| `multiple`                                                         | Allows multiple values. Used on `email` (comma-separated) and `file` inputs.                              |
| `accept=""`                                                        | Restricts file types for `type="file"` (e.g., `accept="image/*,.pdf"`).                                   |
| `capture="user\|environment"`                                      | On mobile, opens the front (`user`) or rear (`environment`) camera for `type="file"`.                     |
| `list="datalist-id"`                                               | Links input to a `<datalist>` element to show autocomplete suggestions.                                   |
| `inputmode=""`                                                     | Hints the virtual keyboard layout: `numeric`, `decimal`, `email`, `tel`, `url`, `search`, `none`.         |
| `enterkeyhint=""`                                                  | Customizes the Enter key label on virtual keyboards: `done`, `go`, `next`, `previous`, `search`, `send`.  |
| `spellcheck="true\|false"`                                         | Controls spell-checking on text inputs.                                                                   |
| `form="form-id"`                                                   | Associates the input with a `<form>` by ID. Allows inputs outside the form element.                       |

### Input Types — Complete List

| `type`              | Description                                                                                                                                                        |
| :------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `text`              | Single-line text (default).                                                                                                                                        |
| `password`          | Masked text entry.                                                                                                                                                 |
| `email`             | Email with format validation. Triggers email keyboard on mobile.                                                                                                   |
| `number`            | Numeric input. Supports `min`, `max`, `step`.                                                                                                                      |
| `tel`               | Phone number. No format validation — triggers phone keyboard.                                                                                                      |
| `url`               | URL with format validation.                                                                                                                                        |
| `search`            | Search field. May show a clear (×) button.                                                                                                                         |
| `date`              | Date picker (value: `YYYY-MM-DD`).                                                                                                                                 |
| `time`              | Time picker (value: `HH:MM`).                                                                                                                                      |
| `datetime-local`    | Combined date and time picker — no timezone.                                                                                                                       |
| `month`             | Month and year picker.                                                                                                                                             |
| `week`              | Week and year picker.                                                                                                                                              |
| `color`             | Browser color picker. Value is a hex string (`#rrggbb`).                                                                                                           |
| `range`             | Slider for a numeric range. Use `min`, `max`, `step`.                                                                                                              |
| `checkbox`          | Toggleable checkbox. Use `checked` attribute for default state.                                                                                                    |
| `radio`             | One-of-many selection. Group by sharing the same `name`.                                                                                                           |
| `file`              | File upload control. Add `multiple` for multiple files; `accept` to filter types.                                                                                  |
| `hidden`            | Not displayed. Value is submitted silently (e.g., CSRF tokens, user IDs).                                                                                          |
| `submit`            | Submits the form. Displays button with `value` as label.                                                                                                           |
| `reset`             | Resets all form fields to defaults. Use rarely — frustrating for users.                                                                                            |
| `button`            | Generic button with no default behavior.                                                                                                                           |
| `image`             | A graphical submit button using a `src` image.                                                                                                                     |
| `checkbox` (switch) | ⚗️ **Still experimental.** `<input type="checkbox" switch>` renders a native toggle/switch UI in Safari. Chrome and Firefox have not shipped it; not yet Baseline. |

### Other Form Elements

| Tag                                                                   | Description                                                                                                                                                                                                                                                 |
| :-------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<label for="id"> … </label>`                                         | Labels a form control. `for` must match the control's `id`. Clicking the label focuses the control.                                                                                                                                                         |
| `<textarea rows="" cols=""> … </textarea>`                            | Multi-line text input. Use the CSS `field-sizing: content` property to make it auto-grow with typed content instead of manual `resize` handling.                                                                                                            |
| `<select name="" id=""> … </select>`                                  | Dropdown menu. Add `multiple` for multi-select; `size=""` to show N visible options. See **Customizable `<select>`** below for the 2026 styling story.                                                                                                      |
| `<option value=""> … </option>`                                       | An item inside `<select>` or `<datalist>`. Add `selected` for default. Can now contain rich HTML (icons, images) inside a customizable select.                                                                                                              |
| `<optgroup label=""> … </optgroup>`                                   | Groups related `<option>` elements under a non-selectable group label.                                                                                                                                                                                      |
| `<datalist id=""> … </datalist>`                                      | Provides a list of predefined autocomplete suggestions for a linked `<input list="…">`.                                                                                                                                                                     |
| `<selectedcontent> … </selectedcontent>`                              | 🟡 **Limited availability.** Inside a customizable `<select>`'s `<button>` part, mirrors the HTML of the currently-selected `<option>` so it can include icons/markup, not just text. Chrome 135+ stable; Safari Technology Preview; Firefox behind a flag. |
| `<fieldset> … </fieldset>`                                            | Groups related form controls. Renders with a visible border by default.                                                                                                                                                                                     |
| `<legend> … </legend>`                                                | Heading/caption for a `<fieldset>`.                                                                                                                                                                                                                         |
| `<button type="submit\|reset\|button"> … </button>`                   | A clickable button that can contain HTML. `type="button"` prevents accidental form submission. Also the host for `commandfor`/`command`, `popovertarget`, and `interestfor` — see §13.                                                                      |
| `<output for="…" name=""> … </output>`                                | Displays the result of a calculation or user action.                                                                                                                                                                                                        |
| `<meter min="" max="" low="" high="" optimum="" value=""> … </meter>` | A scalar measurement within a known range (e.g., disk usage, battery level).                                                                                                                                                                                |
| `<progress max="" value=""> … </progress>`                            | Progress of a task. Omit `value` for an indeterminate (animated) progress bar.                                                                                                                                                                              |

### 🟡 Customizable `<select>` — the 2026 dropdown rewrite

For two decades, a fully-branded dropdown meant pulling in a JS library (React Select, downshift,
Tippy) and re-implementing ARIA by hand. The platform is finally closing that gap with a combination
of new HTML structure inside `<select>` and the `appearance: base-select` CSS value, which opts the
element out of native OS-level rendering so its internals become stylable.

```html
<select>
  <button>
    <selectedcontent></selectedcontent>
  </button>
  <option value="apple">🍎 Apple</option>
  <option value="banana">🍌 Banana</option>
  <option value="cherry">🍒 Cherry</option>
</select>
```

```css
select,
::picker(select) {
  appearance: base-select;
}
```

**Status as of June 2026:** Chrome 135 shipped full stable support. Safari has it documented in
Technology Preview. Firefox is actively prototyping it behind a flag. This is **not Baseline** —
ship it as a progressive enhancement with `@supports(appearance: base-select)`, and keep your
existing JS-driven or native `<select>` as the fallback. It retains native accessibility mappings
(keyboard navigation, `aria-selected`) automatically, which is the main reason it's worth the wait
over a from-scratch ARIA combobox.

### Submit Button Override Attributes

On `<button type="submit">` or `<input type="submit">`, these override the parent `<form>`'s own
attributes — handy for a single form with multiple possible destinations/behaviors ("Save as draft"
vs. "Publish").

| Attribute                | Overrides             | Description                                                                             |
| :----------------------- | :-------------------- | :-------------------------------------------------------------------------------------- |
| `formaction="url"`       | the form's `action`   | Sends this submission to a different URL.                                               |
| `formmethod="GET\|POST"` | the form's `method`   | Uses a different HTTP method for this submission only.                                  |
| `formenctype=""`         | the form's `enctype`  | Uses a different encoding type for this submission only.                                |
| `formtarget=""`          | the form's `target`   | Opens the response in a different browsing context for this submission only.            |
| `formnovalidate`         | the form's validation | Skips constraint validation for this submission only — common on a "Save draft" button. |

> - Every `<input>` must have an associated `<label>`
> - Use `fieldset` + `legend` for groups of related controls (radio buttons, checkboxes)
> - Use `autocomplete` attributes to help users and password managers
> - Never rely solely on `placeholder` text as a label

---

## 10. Tables

Tables are for **tabular data only** — not for page layout.

| Tag                                                 | Description                                                                                           |
| :-------------------------------------------------- | :---------------------------------------------------------------------------------------------------- |
| `<table> … </table>`                                | Defines a data table.                                                                                 |
| `<caption> … </caption>`                            | Provides a title/description for the table. Placed immediately after `<table>`. Helps screen readers. |
| `<thead> … </thead>`                                | Groups header rows.                                                                                   |
| `<tbody> … </tbody>`                                | Groups the main body rows. Multiple `<tbody>` elements allowed.                                       |
| `<tfoot> … </tfoot>`                                | Groups footer rows (totals, summaries).                                                               |
| `<tr> … </tr>`                                      | A table row.                                                                                          |
| `<th scope="col\|row\|colgroup\|rowgroup"> … </th>` | A header cell. `scope` is critical for screen reader accessibility.                                   |
| `<td> … </td>`                                      | A standard data cell.                                                                                 |
| `colspan="N"`                                       | Makes the cell span N columns horizontally.                                                           |
| `rowspan="N"`                                       | Makes the cell span N rows vertically.                                                                |
| `<colgroup> … </colgroup>`                          | Groups columns for collective styling. Place after `<caption>` and before `<thead>`.                  |
| `<col span="N">`                                    | Represents one or more columns inside `<colgroup>`. Void element.                                     |

> **Accessibility requirements for tables:**
>
> - Always include `<caption>`
> - Use `<th scope="col">` for column headers and `<th scope="row">` for row headers
> - For complex tables, use `id`/`headers` attribute pairing

---

## 11. Multimedia & Embeds

### Video

| Attribute                        | Description                                                                                                                                                              |
| :------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src="url"`                      | Path to the video file. Alternatively use `<source>` children for multiple formats.                                                                                      |
| `controls`                       | Shows native browser playback controls (play, pause, volume, fullscreen).                                                                                                |
| `autoplay`                       | Starts playing immediately. **Requires `muted`** to work in most browsers.                                                                                               |
| `muted`                          | Mutes audio by default. Required for `autoplay` in Chrome, Firefox, Safari.                                                                                              |
| `loop`                           | Loops the video indefinitely.                                                                                                                                            |
| `poster="url"`                   | An image shown before playback starts (thumbnail).                                                                                                                       |
| `preload="auto\|metadata\|none"` | Hints how much to preload. `metadata` loads just duration/dimensions.                                                                                                    |
| `playsinline`                    | Plays inline on iOS instead of entering fullscreen. Essential for mobile video.                                                                                          |
| `loading="lazy"`                 | 🟡 **Chromium-only (Chrome 148+), not Baseline.** Defers fetching the media resource until it nears the viewport — the same hint already standard on `<img>`/`<iframe>`. |
| `width=""` / `height=""`         | Dimensions in pixels. Specify to prevent layout shift.                                                                                                                   |
| `crossorigin`                    | Enables CORS for the video. Required for use in `<canvas>`.                                                                                                              |

### Audio

Shares most attributes with `<video>` but without `poster`, `playsinline`, and `width`/`height`.
`loading="lazy"` applies here too (same Chromium-only caveat).

### `<source>` Element

```html
<video
  controls
  poster="thumbnail.jpg"
  width="1280"
  height="720"
>
  <source
    src="video.webm"
    type="video/webm"
  />
  <source
    src="video.mp4"
    type="video/mp4"
  />
  <p>
    Your browser doesn't support HTML video.
    <a href="video.mp4">Download it</a>.
  </p>
</video>
```

### `<track>` Element

| Attribute                                                      | Description                                                                          |
| :------------------------------------------------------------- | :----------------------------------------------------------------------------------- |
| `kind="subtitles\|captions\|descriptions\|chapters\|metadata"` | Type of text track. `captions` includes sound effects; `subtitles` is dialogue only. |
| `src="file.vtt"`                                               | Path to a WebVTT (.vtt) file.                                                        |
| `srclang="en"`                                                 | Language of the track. Required when `kind="subtitles"`.                             |
| `label="English"`                                              | User-visible label in the browser's caption menu.                                    |
| `default`                                                      | Enables this track by default if no user preference is set.                          |

### Embedding & Graphics

| Tag                                                         | Description                                                                                                                                                     |
| :---------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<iframe src="url"> … </iframe>`                            | Embeds another HTML document. Used for YouTube, Google Maps, Figma embeds, etc.                                                                                 |
| `<iframe loading="lazy">`                                   | ✅ Lazy-loads off-screen iframes — widely supported.                                                                                                            |
| `<iframe sandbox="">`                                       | Restricts the embedded document's capabilities (no scripts, no forms, no top navigation, etc.) for security.                                                    |
| `<iframe allow="camera; microphone; fullscreen">`           | ✅ Grants a Permissions Policy to the embedded document — without this, an embedded page cannot use camera/mic/fullscreen/geolocation even if it asks the user. |
| `<iframe credentialless>`                                   | 🟡 Loads the iframe without sending ambient credentials (cookies, storage), as an alternative to strict COEP — emerging, Chromium-first.                        |
| `<video disablepictureinpicture>` / `disableremoteplayback` | ✅ Opts a `<video>` out of the browser's Picture-in-Picture button and AirPlay/Cast remote-playback affordance, respectively.                                   |
| `<embed>` / `<object>`                                      | Embeds external resources (PDFs, legacy plugin content). Largely superseded by `<iframe>`, native `<img>`, and `<video>`.                                       |
| `<canvas id="" width="" height=""> … </canvas>`             | A drawing surface for 2D/3D graphics via JavaScript (Canvas 2D API, WebGL, WebGPU).                                                                             |
| `<svg> … </svg>`                                            | Inline SVG vector graphics. Resolution-independent, styleable with CSS, and animatable. Best for icons and illustrations.                                       |

---

## 12. HTML5 Semantic & Structural Tags

> **Why use semantic tags?** Browsers, search engines, and assistive technologies all understand the
> page structure without extra ARIA annotations when you use the right semantic element.

| Tag                                               | Description                                                                                                                                                                                                                                                                                 |
| :------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `<header> … </header>`                            | Introductory content for a page or section (logo, site name, main nav, hero). ≠ `<head>`.                                                                                                                                                                                                   |
| `<footer> … </footer>`                            | Footer of the page or a section (copyright, secondary nav, contact info).                                                                                                                                                                                                                   |
| `<main> … </main>`                                | The dominant, unique content of the `<body>`. **Use only one `<main>` per page.** Landmark for screen readers.                                                                                                                                                                              |
| `<nav> … </nav>`                                  | A section with navigation links. A page can have multiple `<nav>` elements (primary, breadcrumb, footer nav).                                                                                                                                                                               |
| `<section> … </section>`                          | A standalone thematic section. Should include a heading (`<h2>`–`<h6>`).                                                                                                                                                                                                                    |
| `<article> … </article>`                          | Self-contained, independently distributable content (blog post, comment, product card, news item).                                                                                                                                                                                          |
| `<aside> … </aside>`                              | Content tangentially related to the surrounding content — sidebar, pull quote, related links, ad.                                                                                                                                                                                           |
| `<figure> … </figure>`                            | Self-contained content referenced from the main flow (image, chart, diagram, code block).                                                                                                                                                                                                   |
| `<figcaption> … </figcaption>`                    | Caption or description for the parent `<figure>`.                                                                                                                                                                                                                                           |
| `<search> … </search>`                            | ✅ **Baseline widely available (as of April 2026).** An explicit landmark wrapping a search form, filter UI, or any combination of submission controls representing a search experience. The browser assigns the element an implicit `role="search"` automatically — no manual ARIA needed. |
| `<details> … </details>`                          | Disclosure widget — content is hidden by default; toggles open on click. No JavaScript required. Add `name="group-name"` (✅ Baseline) to multiple `<details>` elements to make them an **exclusive accordion** — opening one closes the others sharing the same name.                      |
| `<summary> … </summary>`                          | The visible clickable heading for a `<details>` element. Clicking it toggles the rest of `<details>`.                                                                                                                                                                                       |
| `<dialog> … </dialog>`                            | A native dialog or modal. Open with `.show()` (non-modal), `.showModal()` (modal with backdrop), or declaratively via `command="show-modal"`. See §13 for the full 2026 pattern, including `closedby`.                                                                                      |
| `<menu> … </menu>`                                | An unordered list of interactive items (toolbar, context menu).                                                                                                                                                                                                                             |
| `<mark> … </mark>`                                | Highlighted text — used for search result highlights, relevant passages.                                                                                                                                                                                                                    |
| `<time datetime="2026-06-27T14:00"> … </time>`    | Human-readable date/time. `datetime` provides ISO 8601 machine-readable value.                                                                                                                                                                                                              |
| `<address> … </address>`                          | Contact information for the author/owner of the nearest `<article>` or the document body.                                                                                                                                                                                                   |
| `<progress max="100" value="70"> … </progress>`   | Completion progress bar. Omit `value` for indeterminate (loading animation).                                                                                                                                                                                                                |
| `<meter min="0" max="100" value="70"> … </meter>` | Scalar gauge within a known range. Not for progress — use for storage, ratings, scores.                                                                                                                                                                                                     |
| `<template> … </template>`                        | Inert HTML not rendered until cloned with JavaScript (`content.cloneNode(true)`). Core to Web Components.                                                                                                                                                                                   |
| `<slot name="…"> … </slot>`                       | Placeholder in a Web Component shadow DOM. Lets users inject their own markup at that position.                                                                                                                                                                                             |

```html
<header>
  <h1>Movie database</h1>
  <search>
    <form action="/search">
      <label for="q">Find a movie</label>
      <input
        type="search"
        id="q"
        name="q"
      />
      <button type="submit">Search</button>
    </form>
  </search>
</header>
```

> For the full, expanded treatment of `<dialog>`, `popover`, Invoker Commands, the Interest Invoker
> API, and Anchor Positioning — the biggest shift in how HTML elements talk to each other since
> `<dialog>` itself — see **§13**.

### Declarative Shadow DOM — Web Components without JavaScript

🆕 **Baseline newly available since February 2024; expected to reach Widely available August 2026.**
Normally a Shadow DOM tree can only be attached with the JavaScript `attachShadow()` method, which
means a server-rendered Web Component has no encapsulated styling until JS runs — causing layout
shift or a flash of unstyled content. A `<template>` with a `shadowrootmode` attribute fixes this by
letting the HTML parser attach the shadow root directly, with zero JavaScript needed for the static
structure:

```html
<user-card>
  <template shadowrootmode="open">
    <style>
      p {
        color: var(--accent);
      }
    </style>
    <p>Jane Smith — Lead Engineer</p>
  </template>
</user-card>
```

| Attribute                       | Description                                                                                                                                  |
| :------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------- |
| `shadowrootmode="open\|closed"` | **Required to opt in.** Same meaning as the `mode` option of `attachShadow()`: `open` exposes `element.shadowRoot` to JS; `closed` hides it. |
| `shadowrootclonable`            | If present, cloning the host element with `cloneNode()`/`importNode()` also clones its shadow root.                                          |
| `shadowrootdelegatesfocus`      | If present, focusing the host delegates focus to the first focusable element inside the shadow tree.                                         |
| `shadowrootserializable`        | If present, the shadow root is included when the page is serialized (e.g., via `getHTML()`).                                                 |

> Calling `attachShadow()` later from JavaScript on an element that already has a
> declaratively-created shadow root does not throw — it clears and reuses it. This is what lets a
> Custom Element be upgraded for interactivity after its static markup has already rendered from the
> server.

---

## 13. Declarative UI 2026 — Popover, Invoker Commands, Interest & Anchor Positioning

This is the section that has changed the most since the prior edition of this cheat sheet. The
combined effect of these features is that **most dropdown, tooltip, modal, and menu patterns no
longer require any JavaScript at all.**

### Status legend for this section

| Marker | Meaning                                                                  |
| :----- | :----------------------------------------------------------------------- |
| ✅     | Baseline — works in current Chrome, Edge, Firefox, and Safari            |
| 🆕     | Recently reached Baseline (within the last ~12 months)                   |
| 🟡     | Shipped in 2+ engines but not yet interoperable — ship behind a fallback |

### `popover` — the foundational attribute

| Attribute / Value                               | Description                                                                                                                                                                                                                                                    |
| :---------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `popover` / `popover=""` / `popover="auto"`     | ✅ **Baseline (Newly available Jan 2025).** Promotes the element to the top layer. `auto` popovers light-dismiss (Esc, click-outside) and close other open `auto` popovers when one opens.                                                                     |
| `popover="manual"`                              | ✅ Must be explicitly shown/hidden via script or invoker. Doesn't light-dismiss. Multiple manual popovers can be open at once — good for toast notifications.                                                                                                  |
| `popover="hint"`                                | 🟡 **Shipped in Chrome/Edge; Safari and Firefox catching up via the Interop 2026 effort.** A third category designed for tooltips: it light-dismisses and closes other `hint` popovers, but does **not** close `auto` popovers. Pair with `interestfor` below. |
| `popovertarget="id"` / `popovertargetaction=""` | ✅ The original declarative attributes for `<button>`/`<input>` to show/hide/toggle a popover. Still valid; superseded in capability by `command`/`commandfor`.                                                                                                |
| `::backdrop`                                    | ✅ CSS pseudo-element for styling the dimmed layer behind a modal `<dialog>` or popover.                                                                                                                                                                       |
| `:popover-open`                                 | ✅ CSS pseudo-class matching an open popover (a `<dialog>` uses the `open` attribute/`:open` instead — see below).                                                                                                                                             |

```html
<button popovertarget="menu">Open Menu</button>
<div
  id="menu"
  popover
>
  <a href="/profile">Profile</a>
  <a href="/settings">Settings</a>
</div>
```

### Invoker Commands API — `command` / `commandfor`

✅ **Baseline across all major engines (Chrome, Edge, Firefox, Safari) as of early 2026.** This is
the biggest no-JS upgrade to `<button>` since `type="submit"`. Two attributes let a button
declaratively control _any other element_ by ID.

| Attribute         | Description                                                                                                                                                       |
| :---------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `commandfor="id"` | The ID of the element this button controls — works just like `for` does on `<label>`.                                                                             |
| `command="…"`     | The action to perform. Built-ins: `show-modal`, `close`, `request-close`, `toggle-popover`, `show-popover`, `hide-popover`. Custom commands must start with `--`. |

```html
<!-- Modal dialog — zero JavaScript -->
<button
  commandfor="confirm-dialog"
  command="show-modal"
>
  Delete Record
</button>
<dialog id="confirm-dialog">
  <p>Are you sure?</p>
  <button
    commandfor="confirm-dialog"
    command="close"
    value="cancel"
  >
    Cancel
  </button>
  <button
    commandfor="confirm-dialog"
    command="close"
    value="confirm"
  >
    Delete
  </button>
</dialog>

<!-- Popover menu — zero JavaScript -->
<button
  commandfor="menu"
  command="toggle-popover"
>
  Menu
</button>
<div
  id="menu"
  popover
>
  <button
    commandfor="menu"
    command="hide-popover"
  >
    Close
  </button>
</div>

<!-- Custom command — needs a small JS handler, but no manual wiring of ARIA/focus -->
<button
  commandfor="photo"
  command="--rotate-right"
>
  Rotate
</button>
<img
  id="photo"
  src="photo.jpg"
  alt="A photo"
/>
<script>
  document.getElementById("photo").addEventListener("command", (e) => {
    if (e.command === "--rotate-right") e.target.style.rotate = "90deg";
  });
</script>
```

The browser handles `aria-expanded`, focus management, and the equivalent of the relevant JS API
call (`showModal()`, `togglePopover()`, etc.) for you. `commandfor`/`command` fully supersede
`popovertarget`/`popovertargetaction` — when both pairs are present on the same button, `commandfor`
wins, and the older pair is not being removed, so existing code keeps working.

> **Spec note:** Built-in commands currently target `<dialog>` and popover elements only. Support
> for `<details>` was discussed and deferred — watch for it in a future revision rather than relying
> on it today.

### `<dialog>` and `closedby`

| Feature                                    | Description                                                                                                                                                                                                                                                                                              |
| :----------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dialog.showModal()`                       | ✅ Opens as a modal: traps focus, makes the rest of the page `inert`, and is promoted to the top layer.                                                                                                                                                                                                  |
| `dialog.show()`                            | ✅ Opens non-modally — the rest of the page stays interactive.                                                                                                                                                                                                                                           |
| `dialog.close()` / `dialog.requestClose()` | ✅ `close()` closes immediately. `requestClose()` (Baseline May 2025) fires a cancelable `cancel` event first, so you can intercept and block the close (e.g., "unsaved changes" prompts).                                                                                                               |
| `closedby="any\|closerequest\|none"`       | 🟡 **Shipped in Chrome, Edge, Firefox; Safari support expected via Interop 2026.** Declares, in HTML, which user actions can dismiss the dialog: `any` allows light-dismiss (click outside) + Esc; `closerequest` allows only Esc/back-gesture; `none` requires a script or invoker command to close it. |

```html
<button
  commandfor="info"
  command="show-modal"
>
  Learn more
</button>
<dialog
  id="info"
  closedby="any"
>
  <p>This dialog can be dismissed by clicking outside it, or pressing Esc.</p>
  <button
    commandfor="info"
    command="close"
  >
    Close
  </button>
</dialog>
```

> ⚠️ Known spec gap: `closedby` is defined for `<dialog>` shown via `showModal()`/`show()`/the
> `open` attribute. If you instead show a `<dialog>` via the **popover** attribute
> (`<dialog popover>`), `closedby` does not currently apply — use `popover="auto"` (≈
> `closedby="any"`) or `popover="manual"` (≈ `closedby="none"`) instead for that combination.

### Interest Invoker API — `interestfor`

🟡 **Newest of the bunch — emerging, not Baseline.** Solves declarative hover/focus-triggered
tooltips and hovercards, the one popover interaction `command`/`commandfor` doesn't cover (those
only fire on click).

```html
<button interestfor="callout">ℹ️</button>
<div
  id="callout"
  popover="hint"
>
  Extra detail shown on hover or keyboard focus.
</div>
```

- Works on `<button>` **and** `<a>` (unlike Invoker Commands, which are button-only).
- Triggered by hover, long-press (touch), or keyboard focus — not click.
- Pair it with `popover="hint"` so opening it doesn't dismiss an unrelated open `auto` popover (like
  a navigation menu).
- Tune timing with the `interest-delay`, `interest-delay-start`, and `interest-delay-end` CSS
  properties.

### `:open` — one pseudo-class for every disclosure widget

🆕 **Baseline newly available (Safari 26.5 shipped it in May 2026, joining Chrome and Firefox).** A
single CSS pseudo-class that matches the "open" state of `<details>`, `<dialog>`, and the native
picker UI of `<select>`, `<input type="date">`, `<input type="color">`, etc. — so you no longer need
separate selectors (`[open]`, `:popover-open`, `::backdrop`) for conceptually the same state.

```css
dialog:open,
details:open {
  /* shared open-state styling */
}
```

### CSS Anchor Positioning — tethering without JavaScript

✅ **Baseline 2026** (Chrome 125+, Firefox 132+/147+, Safari 18.2+ for the core feature —
`@position-try` fallback flipping needs Safari 18.4+). This is a CSS feature, not an HTML one, but
it's the natural partner to `popover` and `<dialog>`: it replaces what Floating UI / Popper.js /
Tippy.js exist to do.

```css
.trigger {
  anchor-name: --my-anchor;
}
.tooltip {
  position: absolute;
  position-anchor: --my-anchor;
  position-area: top span-right;
  position-try-fallbacks: flip-block;
}
```

```html
<button
  class="trigger"
  commandfor="tip"
  command="toggle-popover"
>
  Info
</button>
<div
  id="tip"
  class="tooltip"
  popover
>
  Anchored tooltip content.
</div>
```

> ⚠️ There is a **non-standard `anchor="…"` HTML attribute** that some browsers accept as a
> shorthand way to set `position-anchor` from markup. It is explicitly documented as non-standard —
> prefer the CSS `anchor-name`/`position-anchor` pair above for anything shipped to production. The
> Popover API already establishes an implicit anchor relationship between an invoker button and its
> popover automatically, so for the common popover/tooltip case you often don't need to set an
> anchor relationship by hand at all.

---

## 14. Global Attributes

Global attributes can be applied to **any** HTML element.

| Attribute                                                           | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| :------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id="unique-name"`                                                  | Unique identifier. Used for CSS targeting, JS queries (`#id`), and in-page anchor links. Must be unique per page.                                                                                                                                                                                                                                                                                                                                                            |
| `class="name1 name2"`                                               | One or more space-separated class names. The primary hook for CSS and JS targeting.                                                                                                                                                                                                                                                                                                                                                                                          |
| `style="property: value"`                                           | Inline CSS. Use sparingly — prefer classes and external stylesheets.                                                                                                                                                                                                                                                                                                                                                                                                         |
| `title="text"`                                                      | Advisory tooltip text shown on hover. Not a substitute for `aria-label`.                                                                                                                                                                                                                                                                                                                                                                                                     |
| `lang="en"`                                                         | Language of the element's content. Overrides `<html lang="">` for that subtree.                                                                                                                                                                                                                                                                                                                                                                                              |
| `dir="ltr\|rtl\|auto"`                                              | Text direction. `auto` detects from content — useful for user-submitted multilingual text.                                                                                                                                                                                                                                                                                                                                                                                   |
| `tabindex="0\|-1\|N"`                                               | Controls keyboard focus order. `0` = natural order; `-1` = JS-focusable only; positive integers set explicit order (avoid).                                                                                                                                                                                                                                                                                                                                                  |
| `hidden` / `hidden="until-found"`                                   | Hides the element from all output modes. Plain `hidden` is stronger than CSS `display: none` semantically. `hidden="until-found"` (🆕 shipped in Chrome and Firefox; Safari catching up) keeps content out of normal display but still searchable by the browser's find-in-page and text-fragment links — the section auto-reveals on a match, firing `beforematch` first. Great for making accordion/FAQ content SEO- and search-friendly while still collapsed by default. |
| `writingsuggestions="true\|false"`                                  | 🟡 **Not Baseline.** Toggles the browser's inline, ghosted-text writing suggestions in editable fields — useful to turn off when you provide your own site-specific suggestions.                                                                                                                                                                                                                                                                                             |
| `autocorrect="on\|off"`                                             | 🟡 **Not Baseline (Safari-originated, widely mirrored on mobile).** Controls device-level autocorrection in editable text. Not part of every implementation's default text inputs (e.g. `password`/`email`/`url` never autocorrect).                                                                                                                                                                                                                                         |
| `inert`                                                             | ✅ **Baseline (2023).** Makes the element and **all descendants** non-interactive, non-focusable, and invisible to the accessibility tree. Ideal for inactive modal layers and multi-step flows.                                                                                                                                                                                                                                                                             |
| `data-*="value"`                                                    | Custom data attributes. Access via `element.dataset.*` in JavaScript. Name: `data-` + lowercase letters, no uppercase.                                                                                                                                                                                                                                                                                                                                                       |
| `contenteditable="true\|false\|plaintext-only"`                     | Makes the element editable. `plaintext-only` strips formatting on paste. ✅ **`plaintext-only` is Baseline 2025.**                                                                                                                                                                                                                                                                                                                                                           |
| `draggable="true\|false"`                                           | Makes the element draggable via the HTML Drag and Drop API.                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `spellcheck="true\|false"`                                          | Enables/disables spell checking on editable content.                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `translate="yes\|no"`                                               | Hints whether the text should be translated by browser translation tools.                                                                                                                                                                                                                                                                                                                                                                                                    |
| `accesskey="char"`                                                  | A keyboard shortcut to focus/activate the element. Browser-dependent — use cautiously.                                                                                                                                                                                                                                                                                                                                                                                       |
| `autocapitalize="off\|sentences\|words\|characters"`                | Controls text capitalization on virtual keyboards (touch devices).                                                                                                                                                                                                                                                                                                                                                                                                           |
| `enterkeyhint="done\|go\|next\|previous\|search\|send"`             | Customizes the Enter key label on virtual keyboards.                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `inputmode="text\|numeric\|decimal\|email\|tel\|url\|search\|none"` | Hints which virtual keyboard to display. Works on any focusable element, not just `<input>`.                                                                                                                                                                                                                                                                                                                                                                                 |
| `is="custom-element-name"`                                          | Extends a native HTML element with a registered custom element.                                                                                                                                                                                                                                                                                                                                                                                                              |
| `nonce="…"`                                                         | A cryptographic nonce for Content Security Policy (CSP).                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `popover="auto\|manual\|hint"`                                      | ✅/🟡 — see §13 for current per-value support.                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `popovertarget="id"` / `popovertargetaction=""`                     | ✅ On `<button>`/`<input>`: points to a popover element to control. Superseded by `commandfor`/`command` but still valid — see §13.                                                                                                                                                                                                                                                                                                                                          |
| `commandfor="id"` / `command="…"`                                   | ✅ **Baseline.** On `<button>`: declarative control of any element by ID — see §13 for the full reference.                                                                                                                                                                                                                                                                                                                                                                   |
| `interestfor="id"`                                                  | 🟡 On `<button>` or `<a>`: declarative hover/focus reveal of a `popover="hint"` element — see §13.                                                                                                                                                                                                                                                                                                                                                                           |
| `exportparts="…"`                                                   | Exposes shadow DOM parts for styling from outside the Web Component.                                                                                                                                                                                                                                                                                                                                                                                                         |
| `part="name"`                                                       | Marks the element as a stylable part of a Web Component (targetable with `::part(name)`).                                                                                                                                                                                                                                                                                                                                                                                    |
| `slot="name"`                                                       | Assigns the element to a named slot inside a Web Component.                                                                                                                                                                                                                                                                                                                                                                                                                  |

---

## 15. ARIA Accessibility Attributes

ARIA (Accessible Rich Internet Applications) fills gaps where native HTML semantics are insufficient
— primarily for custom widgets and live regions. **Always prefer native HTML elements over ARIA
equivalents.**

> **The first rule of ARIA:** Don't use ARIA if native HTML can do the job. `<button>` is always
> better than `<div role="button">`. `<search>` is always better than `<div role="search">`.

### Landmark Roles

| `role` Value    | Native HTML equivalent                       | Notes                                                                                                                                    |
| :-------------- | :------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| `banner`        | `<header>` (when a direct child of `<body>`) | Site-oriented content: logo, site name, primary search.                                                                                  |
| `navigation`    | `<nav>`                                      | Use a unique `aria-label` when a page has more than one `<nav>`.                                                                         |
| `main`          | `<main>`                                     | Exactly one per page.                                                                                                                    |
| `complementary` | `<aside>`                                    | Related-but-separable content.                                                                                                           |
| `contentinfo`   | `<footer>` (when a direct child of `<body>`) | Copyright, legal links, site-wide footer nav.                                                                                            |
| `search`        | `<search>`                                   | ✅ As of Baseline-widely-available `<search>`, you almost never need `role="search"` by hand anymore.                                    |
| `form`          | _(no native HTML element)_                   | There's no semantic form-landmark element — apply `role="form"` with a label only for a form important enough to be a navigation target. |
| `region`        | `<section>` with an accessible name          | A bare `<section>` with no heading/label conveys nothing — give it `aria-labelledby` or skip the role.                                   |

> **Labeling rule:** if the same landmark role appears more than once on a page (e.g., two `<nav>`
> elements), give each a distinct `aria-label`. Don't repeat the role name in the label —
> `aria-label="Footer"` on a `<nav>` is announced as "Footer, navigation," not "Footer navigation,
> navigation."

### Live Regions, States & Properties

| Attribute                                                         | Description                                                                                                                                                                                                |
| :---------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `aria-live="polite\|assertive\|off"`                              | Announces dynamic content changes to screen readers without moving focus.                                                                                                                                  |
| `aria-atomic="true\|false"`                                       | Whether the whole live region is re-announced, or only the changed part.                                                                                                                                   |
| `aria-relevant=""`                                                | Which types of DOM change inside a live region trigger an announcement (`additions`, `removals`, `text`).                                                                                                  |
| `aria-label="text"`                                               | Accessible name when no visible text label exists.                                                                                                                                                         |
| `aria-labelledby="id"`                                            | Points to the `id` of the element(s) that label this one.                                                                                                                                                  |
| `aria-describedby="id"`                                           | Points to the `id` of element(s) providing extended description (e.g., error message, help text).                                                                                                          |
| `aria-details="id"`                                               | Points to an element with a more detailed, structured description (richer than `aria-describedby`).                                                                                                        |
| `aria-hidden="true\|false"`                                       | Hides the element from the accessibility tree only — still visible and interactive visually.                                                                                                               |
| `aria-expanded="true\|false"`                                     | Indicates whether a collapsible widget is expanded. Set automatically for you by Invoker Commands (§13).                                                                                                   |
| `aria-current="page\|step\|location\|date\|time\|true\|false"`    | Marks the current item in a set (e.g., current page in pagination, current step in a wizard).                                                                                                              |
| `aria-disabled="true\|false"`                                     | Marks a control as disabled while keeping it perceivable/focusable (unlike the native `disabled` attribute).                                                                                               |
| `aria-checked="true\|false\|mixed"`                               | State of a checkbox-like widget, including the indeterminate `mixed` state.                                                                                                                                |
| `aria-selected="true\|false"`                                     | State of a selectable item (tabs, listbox options, grid cells).                                                                                                                                            |
| `aria-pressed="true\|false\|mixed"`                               | State of a toggle button.                                                                                                                                                                                  |
| `aria-controls="id"`                                              | Identifies the element(s) whose content/visibility this element controls.                                                                                                                                  |
| `aria-owns="id"`                                                  | Reparents accessibility-tree ownership when DOM order doesn't match visual/logical order.                                                                                                                  |
| `aria-haspopup="menu\|listbox\|tree\|grid\|dialog\|true"`         | Indicates the element triggers a popup.                                                                                                                                                                    |
| `aria-busy="true\|false"`                                         | Marks an area being updated (loading state).                                                                                                                                                               |
| `aria-valuemin=""` / `aria-valuemax=""` / `aria-valuenow=""`      | Current and boundary values for sliders and progress indicators.                                                                                                                                           |
| `aria-valuetext=""`                                               | Human-readable text alternative to `aria-valuenow` (e.g., "25% complete").                                                                                                                                 |
| `aria-modal="true"`                                               | Tells assistive technologies that the element is a modal — restricts focus to inside it.                                                                                                                   |
| `aria-readonly="true"`                                            | Marks an element as read-only to assistive technologies.                                                                                                                                                   |
| `aria-multiselectable="true"`                                     | Indicates multiple items can be selected (listbox, grid).                                                                                                                                                  |
| `aria-orientation="horizontal\|vertical"`                         | Indicates the orientation of a widget (tabs, sliders, toolbars).                                                                                                                                           |
| `aria-placeholder="text"`                                         | Placeholder hint for custom input widgets.                                                                                                                                                                 |
| `aria-autocomplete="none\|inline\|list\|both"`                    | Describes autocomplete behavior of comboboxes.                                                                                                                                                             |
| `aria-setsize=""` / `aria-posinset=""`                            | Total items in a set / position of this item. Used in virtual-scroll lists.                                                                                                                                |
| `aria-rowcount=""` / `aria-colcount=""`                           | Total rows/columns in a grid when not all are rendered.                                                                                                                                                    |
| `aria-invalid="true\|false\|grammar\|spelling"`                   | **Don't skip this one.** Marks a form field as failing validation, for custom widgets the native `:invalid` pseudo-class doesn't reach. Pair with `aria-describedby` pointing at the error message.        |
| `aria-required="true\|false"`                                     | Equivalent of the native `required` attribute, for custom widgets that aren't real `<input>`/`<select>` elements.                                                                                          |
| `aria-errormessage="id"`                                          | Points to the element containing a validation error message — more specific than `aria-describedby`, intended to be announced when `aria-invalid` is true.                                                 |
| `aria-keyshortcuts="Control+S"`                                   | Documents the keyboard shortcut(s) that activate an element, for assistive tech to surface to the user.                                                                                                    |
| `aria-roledescription="text"`                                     | Overrides how an element's role is announced (e.g., a `role="slider"` announced as "Volume control" instead of "slider").                                                                                  |
| `aria-description="text"`                                         | 🆕 **WAI-ARIA 1.3.** Like `aria-label`, but explicitly a _description_ rather than the accessible _name_ — for supplementary detail that shouldn't override the element's name.                            |
| `aria-braillelabel="text"` / `aria-brailleroledescription="text"` | 🆕 **WAI-ARIA 1.3.** Braille-specific overrides for the accessible name/role description, for refreshable braille displays where the visual label is impractical to render (e.g., heavy emoji/symbol use). |

> **New WAI-ARIA 1.3 roles:** `suggestion`, `comment`, and `mark` — for annotating proposed edits,
> threaded comments, and highlighted ranges in collaborative editing UIs (think Google Docs-style
> suggested changes) without resorting to a `<div>` soup of custom `data-*` attributes.

> **Platform direction worth knowing:** most ARIA attributes are now also exposed as reflected IDL
> properties on the DOM element (e.g., `element.ariaExpanded`), letting frameworks read/write them
> as JS properties instead of string attributes. This mainly matters to library authors, but it's a
> sign of where the platform is heading — ARIA state management is converging with ordinary JS
> property access rather than living solely in string attributes.

---

## 16. Event Attributes — Inline Reference

> **Best practice:** Use `addEventListener()` in JavaScript. Inline event attributes (`onclick="…"`)
> are valid but harder to maintain, cannot be removed with `removeEventListener`, and violate
> Content Security Policy (CSP) in many setups.

| Attribute                                               | Fires When                                                                                                                                                       |
| :------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onclick`                                               | Element is clicked (left mouse button).                                                                                                                          |
| `ondblclick`                                            | Element is double-clicked.                                                                                                                                       |
| `oncontextmenu`                                         | Right-click context menu is triggered.                                                                                                                           |
| `onmousedown` / `onmouseup`                             | Mouse button is pressed / released.                                                                                                                              |
| `onmouseover` / `onmouseout`                            | Pointer moves over / exits element (bubbles).                                                                                                                    |
| `onmouseenter` / `onmouseleave`                         | Pointer enters / exits element (does not bubble).                                                                                                                |
| `onmousemove`                                           | Pointer moves within the element.                                                                                                                                |
| `onkeydown` / `onkeyup`                                 | Key is pressed / released.                                                                                                                                       |
| `onkeypress`                                            | Key is pressed (deprecated — use `onkeydown`).                                                                                                                   |
| `onfocus` / `onblur`                                    | Element gains / loses focus (does not bubble).                                                                                                                   |
| `onfocusin` / `onfocusout`                              | Focus gained / lost (bubbles — useful for event delegation).                                                                                                     |
| `oninput`                                               | Value changes in real-time (`<input>`, `<textarea>`, `contenteditable`).                                                                                         |
| `onchange`                                              | Value is committed (fires on blur for text; fires immediately for checkboxes/selects).                                                                           |
| `onsubmit`                                              | Form is submitted.                                                                                                                                               |
| `onreset`                                               | Form is reset.                                                                                                                                                   |
| `onselect`                                              | Text is selected inside `<input>` or `<textarea>`.                                                                                                               |
| `onload`                                                | Resource (page, `<img>`, `<iframe>`, `<script>`) finishes loading.                                                                                               |
| `onunload`                                              | Page is unloaded.                                                                                                                                                |
| `onbeforeunload`                                        | Page is about to unload (can prompt user to confirm).                                                                                                            |
| `onresize`                                              | Browser window is resized (`window` only).                                                                                                                       |
| `onscroll`                                              | Element or page is scrolled.                                                                                                                                     |
| `onscrollend`                                           | ✅ **Baseline 2025.** Scroll has come to rest. Preferred over throttled `onscroll` for post-scroll logic.                                                        |
| `onerror`                                               | A resource fails to load or a script error occurs.                                                                                                               |
| `onabort`                                               | A resource load is aborted.                                                                                                                                      |
| `onplay` / `onpause` / `onended`                        | Media starts / pauses / reaches the end.                                                                                                                         |
| `onvolumechange`                                        | Volume or mute state changes on `<audio>` / `<video>`.                                                                                                           |
| `ontimeupdate`                                          | Playback position changes (`<audio>`, `<video>`).                                                                                                                |
| `oncanplay` / `oncanplaythrough`                        | Media is ready to play / can play to end without buffering.                                                                                                      |
| `ondragstart` / `ondrag` / `ondragend`                  | Drag starts / is in progress / ends on the dragged element.                                                                                                      |
| `ondragenter` / `ondragover` / `ondragleave` / `ondrop` | Drag-and-drop target events. `ondragover` must call `preventDefault()` to allow drops.                                                                           |
| `ontoggle`                                              | A `<details>`, `<dialog>`, or popover element is opened or closed.                                                                                               |
| `onbeforetoggle`                                        | ✅ **Baseline 2025.** A `<details>`, `<dialog>`, or popover is about to open or close. Fires before the visual change — useful for coordinating exit animations. |
| `onbeforematch`                                         | 🆕 Fires on a `hidden="until-found"` element right before the browser reveals it for a find-in-page or text-fragment match — see §14.                            |
| `onpageswap`                                            | 🟡 Fires on the outgoing document just before a cross-document navigation/View Transition swaps it out — see §17.                                                |
| `onpagereveal`                                          | 🟡 Fires on the incoming document right after it's activated but before its first render — see §17.                                                              |
| `oncontextlost` / `oncontextrestored`                   | Fires on a `<canvas>` when its GPU/2D rendering context is lost (e.g., driver reset) or subsequently restored.                                                   |

> JavaScript handlers (added via `addEventListener`, not necessarily inline attributes) can also
> listen for the `command` event fired by Invoker Commands custom commands (see §13).

---

## 17. Performance & Navigation — Speculation Rules, View Transitions, Resource Hints

### Resource hints recap

| `<link rel="…">` | What it does                                                                                                                                                        | Cost       |
| :--------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--------- |
| `dns-prefetch`   | Resolves DNS only. ✅ Baseline 2025.                                                                                                                                | Very low   |
| `preconnect`     | DNS + TCP + TLS handshake. Browsers drop the connection if unused within ~10s.                                                                                      | Low        |
| `preload`        | Fetches and caches a specific resource you know you'll need (fonts, hero images, critical CSS/JS).                                                                  | Medium     |
| `prefetch`       | Fetches a document/resource into HTTP cache for a likely-next navigation, without rendering it.                                                                     | Low–medium |
| `expect`         | 🟡 New: tells the browser a selector-matched element is expected, so it can hold first paint/parsing until it appears — useful against flash-of-incomplete-content. | Varies     |

### Speculation Rules API — the successor to `<link rel="prerender">`

⚗️ **Experimental, Chromium-only (Chrome/Edge). Not Baseline.** Firefox and Safari have not
implemented it. Use it as a Chromium-only enhancement, never as something the rest of your
navigation flow depends on.

```html
<script type="speculationrules">
  {
    "prefetch": [{ "where": { "href_matches": "/*" }, "eagerness": "moderate" }],
    "prerender": [
      {
        "where": {
          "and": [
            { "href_matches": "/*" },
            { "not": { "href_matches": "/logout" } },
            { "not": { "selector_matches": "[data-no-prerender]" } }
          ]
        },
        "eagerness": "conservative"
      }
    ]
  }
</script>
```

- `prefetch` downloads the document only. `prerender` fully loads, parses, and executes JavaScript
  in a hidden tab — meaningfully more expensive, so scope it carefully.
- `eagerness` (`immediate` / `eager` / `moderate` / `conservative`) controls how confident the
  browser needs to be in a navigation before it speculates.
- **Never** target URLs with side effects on a `GET` (logout, add-to-cart, delete actions) — exclude
  them explicitly with `not`/`selector_matches`.
- Pairs naturally with cross-document View Transitions below: a prerendered destination page makes
  the transition itself feel instant, since there's no network/render wait once the user actually
  navigates.

### Cross-document View Transitions

✅ **Same-document view transitions are Baseline.** Cross-document (multi-page app) transitions
currently work in Chromium only; Firefox and Safari have not shipped them, and bringing this to
interoperability is an explicit Interop 2026 focus area.

> ⚠️ **Correction:** Older tutorials (and the prior edition of this cheat sheet) showed
> `<meta name="view-transition" content="same-origin">` as the opt-in. **That meta tag never shipped
> as the final API** — it was a temporary, flag-gated stand-in while the feature was being
> prototyped, and Chrome has since removed support for it. The current, correct opt-in is a **CSS
> at-rule**, set on both the outgoing and incoming page:

```css
/* On every page you want to transition between */
@view-transition {
  navigation: auto;
}

@media (prefers-reduced-motion: reduce) {
  @view-transition {
    navigation: none;
  }
}
```

```css
/* Optional: name an element so it morphs between pages instead of cross-fading */
h1 {
  view-transition-name: page-heading;
}
```

- `navigation: auto` only fires for **user-initiated, same-origin** navigations (clicking a link,
  back/forward). Programmatic `location.href` assignment, cross-origin links, and form `POST`s never
  trigger it — intentionally, so you don't get a cross-fade on a payment submission.
- There's a hard 4-second timeout: if the destination page hasn't produced matching content in that
  time, the browser abandons the transition and navigates normally.
- Two visible elements sharing the same `view-transition-name` on one page will throw and skip the
  transition — keep names unique and conditional (e.g., only on the "active"/"featured" instance of
  a repeated card).
- `pageswap` and `pagereveal` events (listened to via `addEventListener`, not inline attributes) let
  you customize or cancel the transition on the outgoing/incoming document respectively.

---

## 18. Character Entities

Use named entities for readability, numeric entities when no named form exists.

| Character               | Symbol | Named Entity | Numeric Entity |
| :---------------------- | :----: | :----------- | :------------- |
| Ampersand               |   &    | `&amp;`      | `&#38;`        |
| Less-than sign          |   <    | `&lt;`       | `&#60;`        |
| Greater-than sign       |   >    | `&gt;`       | `&#62;`        |
| Quotation mark          |   "    | `&quot;`     | `&#34;`        |
| Apostrophe              |   '    | `&apos;`     | `&#39;`        |
| Non-breaking space      |        | `&nbsp;`     | `&#160;`       |
| Thin non-breaking space |        | `&nnbsp;`    | `&#8239;`      |
| Copyright               |   ©    | `&copy;`     | `&#169;`       |
| Registered trademark    |   ®    | `&reg;`      | `&#174;`       |
| Trademark               |   ™    | `&trade;`    | `&#8482;`      |
| Em dash                 |   —    | `&mdash;`    | `&#8212;`      |
| En dash                 |   –    | `&ndash;`    | `&#8211;`      |
| Horizontal ellipsis     |   …    | `&hellip;`   | `&#8230;`      |
| Bullet                  |   •    | `&bull;`     | `&#8226;`      |
| Middle dot / interpunct |   ·    | `&middot;`   | `&#183;`       |
| Section sign            |   §    | `&sect;`     | `&#167;`       |
| Degree symbol           |   °    | `&deg;`      | `&#176;`       |
| Multiplication sign     |   ×    | `&times;`    | `&#215;`       |
| Division sign           |   ÷    | `&divide;`   | `&#247;`       |
| Plus-minus              |   ±    | `&plusmn;`   | `&#177;`       |
| Left angle guillemet    |   «    | `&laquo;`    | `&#171;`       |
| Right angle guillemet   |   »    | `&raquo;`    | `&#187;`       |
| Left single quote       |   '    | `&lsquo;`    | `&#8216;`      |
| Right single quote      |   '    | `&rsquo;`    | `&#8217;`      |
| Left double quote       |   "    | `&ldquo;`    | `&#8220;`      |
| Right double quote      |   "    | `&rdquo;`    | `&#8221;`      |
| Euro                    |   €    | `&euro;`     | `&#8364;`      |
| Pound sterling          |   £    | `&pound;`    | `&#163;`       |
| Yen / yuan              |   ¥    | `&yen;`      | `&#165;`       |
| Cent                    |   ¢    | `&cent;`     | `&#162;`       |
| At sign                 |   @    | —            | `&#64;`        |
| Infinity                |   ∞    | `&infin;`    | `&#8734;`      |
| Check mark              |   ✓    | —            | `&#10003;`     |
| Heavy check mark        |   ✔    | —            | `&#10004;`     |
| Ballot X                |   ✗    | —            | `&#10007;`     |

---

## 19. Deprecated, Removed & Outdated-Technique Reference

These tags/attributes were deprecated in HTML5 or removed entirely. **Do not use them in new code.**
Modern CSS handles everything they once did.

| Deprecated Tag                                   | Why Removed                                | Modern Replacement                              |
| :----------------------------------------------- | :----------------------------------------- | :---------------------------------------------- |
| `<center>`                                       | Presentational                             | `text-align: center` or `margin: 0 auto` in CSS |
| `<font face="" size="" color="">`                | Presentational                             | CSS `font-family`, `font-size`, `color`         |
| `<big>`                                          | Presentational                             | CSS `font-size`                                 |
| `<tt>`                                           | Presentational                             | `<code>`, `<kbd>`, or `<samp>` semantically     |
| `<strike>`                                       | Replaced                                   | `<s>` (relevance) or `<del>` (deletion)         |
| `<acronym>`                                      | Redundant                                  | `<abbr>`                                        |
| `<dir>`                                          | Redundant                                  | `<ul>`                                          |
| `<marquee>`                                      | Presentational / accessibility             | CSS `animation` or `@keyframes`                 |
| `<blink>`                                        | Presentational / accessibility             | CSS `animation`                                 |
| `<frame>`, `<frameset>`, `<noframes>`            | Architectural                              | `<iframe>` or modern SPA routing                |
| `<applet>`                                       | Plugin-dependent                           | `<object>` or modern Web APIs                   |
| `<basefont>`                                     | Presentational                             | CSS on `body` or `:root`                        |
| `<isindex>`                                      | Replaced                                   | `<input type="search">`                         |
| `border=""` on `<img>`                           | Presentational                             | CSS `border`                                    |
| `align=""` on block elements                     | Presentational                             | CSS `text-align`, Flexbox, Grid                 |
| `bgcolor=""`                                     | Presentational                             | CSS `background-color`                          |
| `cellpadding=""` / `cellspacing=""` on `<table>` | Presentational                             | CSS `padding` and `border-spacing`              |
| `width=""` / `height=""` on most elements        | Presentational (except `<img>`, `<video>`) | CSS `width`, `height`                           |
| `hspace=""` / `vspace=""` on `<img>`             | Presentational                             | CSS `margin`                                    |
| `<rb>`                                           | Removed from spec                          | Use `<ruby>` + `<rt>` directly                  |
| `<keygen>`                                       | Removed                                    | Web Crypto API                                  |
| `<menuitem>`                                     | Removed                                    | No standard replacement                         |

### Outdated _techniques_ (still valid HTML, but no longer best practice)

| Old technique                                                                                         | Why to avoid it now                                                                                              | Use instead                                                         |
| :---------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------ |
| `<meta name="view-transition" content="same-origin">`                                                 | Never the final shipped API; was a temporary flag-gated stand-in and no longer does anything.                    | `@view-transition { navigation: auto; }` in CSS — see §17.          |
| `<link rel="prerender" href="…">`                                                                     | Chrome-only legacy hint, internally downgraded to NoState Prefetch and headed for removal.                       | Speculation Rules API `<script type="speculationrules">` — see §17. |
| Hand-rolled `role="button"`/`role="dialog"`/`role="search"` `<div>`s for things HTML now has natively | Reinventing keyboard handling, focus management, and ARIA state by hand is fragile and easy to get subtly wrong. | `<button>`, `<dialog>` (+ `closedby`), `<search>` — see §12–§13.    |
| JS positioning libraries (Floating UI, Popper.js, Tippy.js) for simple tooltips/dropdowns             | An entire dependency and runtime cost for something the layout engine now does natively.                         | CSS Anchor Positioning + `popover` — see §13.                       |
| Manually wiring `aria-expanded`/focus on a custom dropdown button                                     | Re-implements what the platform now does for you on click.                                                       | `command`/`commandfor` Invoker Commands — see §13.                  |

---

## Quick Reference — What's New Since the April 2026 Edition

| Feature                                                                                 | Status as of June 27, 2026                                                   | Where    |
| :-------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------- | :------- |
| `<search>` element                                                                      | ✅ Promoted to Baseline **widely available**                                 | §12      |
| Invoker Commands (`command`/`commandfor`)                                               | ✅ Confirmed Baseline across **all major engines**                           | §13      |
| `interestfor` attribute + `popover="hint"`                                              | 🟡 Chrome/Edge shipped; Safari/Firefox via Interop 2026                      | §13      |
| `<dialog closedby="…">`                                                                 | 🟡 Chrome, Edge, Firefox shipped; Safari via Interop 2026                    | §13      |
| `:open` CSS pseudo-class                                                                | 🆕 Newly available — Safari 26.5 joined Chrome/Firefox                       | §13      |
| Customizable `<select>` / `<selectedcontent>` / `appearance: base-select`               | 🟡 Chrome 135 stable; Safari TP; Firefox behind a flag — still not Baseline  | §9       |
| CSS Anchor Positioning (`anchor-name`, `position-anchor`, `anchor()`)                   | ✅ Reached Baseline 2026                                                     | §13      |
| Native `loading="lazy"` on `<video>`/`<audio>`                                          | 🟡 Chrome 148 only — not Baseline                                            | §7, §11  |
| `@view-transition` CSS at-rule (cross-document)                                         | ⚠️ **Correction**: replaces the obsolete `<meta name="view-transition">` tag | §17      |
| Speculation Rules API                                                                   | ⚗️ Still Chromium-only, still experimental                                   | §17      |
| `<link rel="expect">`                                                                   | 🟡 New, part of the Interop 2026 focus list                                  | §2       |
| `contenteditable="plaintext-only"`                                                      | ✅ Baseline 2025 (unchanged)                                                 | §14      |
| `onscrollend` / `onbeforetoggle`                                                        | ✅ Baseline 2025 (unchanged)                                                 | §16      |
| Declarative Shadow DOM (`shadowrootmode`)                                               | 🆕 Newly available since Feb 2024 — widely available expected **Aug 2026**   | §12      |
| `<details name="…">` exclusive accordions                                               | ✅ Baseline (Chrome, Safari, Firefox 130+ all shipped)                       | §12      |
| `hidden="until-found"` + `beforematch`                                                  | 🆕 Chrome + Firefox shipped; Safari implementation merged, rolling out       | §14, §16 |
| `<iframe allow="…">` (Permissions Policy)                                               | ✅ Long-standing — added here for completeness                               | §11      |
| `formaction`/`formnovalidate`/`formmethod`/`formtarget`/`formenctype`                   | ✅ Long-standing — added here for completeness                               | §9       |
| `aria-invalid`, `aria-required`, `aria-errormessage`                                    | ✅ Long-standing — added here, were missing from earlier editions            | §15      |
| ARIA 1.3 (`aria-description`, `aria-braillelabel`, roles `suggestion`/`comment`/`mark`) | 🆕 New in the ARIA 1.3 draft, validator support landed 2026                  | §15      |
| `writingsuggestions` / `autocorrect` global attributes                                  | 🟡 Not Baseline — Safari/Chrome-originated, not in Firefox                   | §14      |

---

_Last updated: June 27, 2026_ _Sources consulted: WHATWG HTML Living Standard; MDN Web Docs
(including pages updated as recently as May 2026); web.dev Baseline monthly digests (January, April,
and May 2026 editions) and the Baseline 2026 / web-features tracker; the web.dev Interop 2026
roadmap post; Chrome for Developers blog (Invoker Commands, Speculation Rules, View Transitions,
hidden=until-found, Declarative Shadow DOM); WebKit blog; InfoQ coverage of the Invoker Commands
API; CSS-Tricks coverage of the Interest Invoker API and cross-document View Transitions; MDN blog
post on exclusive `<details>` accordions._

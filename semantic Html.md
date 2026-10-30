# The Complete HTML Cheat Sheet — October 2026 Edition

Revised 20 Oct 2026 from the 27 Jun 2026 edition. Statuses re-checked against Web Platform Status
(web-features), MDN, web.dev and WebKit's Safari 27.0 release notes (17 Sep 2026). A claim I could
not re-check is tagged _(June)_.

**Legend:** ✅ Widely available (30+ months in all core engines) · 🆕 Newly available (current
stable Chrome, Edge, Firefox, Safari) · 🟡 Limited (missing in an engine: feature-detect or use
@supports and keep a fallback) · ⚗️ Experimental (flag or preview only)

## 0. What changed since June

### Corrections to the June edition

| #   | June edition said                                                         | Correct as of Oct 2026                                                                                                                                                                 |
| --- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Cross-document View Transitions are Chromium-only; Safari has not shipped | Safari 18.2 shipped them (Chrome 126+). Only Firefox lacks them. 🟡                                                                                                                    |
| 2   | popover=hint: Safari and Firefox still catching up                        | Firefox 149 shipped it (24 Mar 2026). Safari has not, and that blocks Baseline. 🟡                                                                                                     |
| 3   | Invoker Commands Baseline as of early 2026                                | Newly available since 12 Dec 2025 (Firefox 144 in Oct 2025, Safari 26.2 last). Widely available expected 12 Jun 2028.                                                                  |
| 4   | sizes=auto: Safari not yet shipped                                        | Safari 27.0 shipped it. All three engines now have it, so it should read 🆕 (confirm on Web Platform Status).                                                                          |
| 5   | Customizable select: Safari Technology Preview only                       | Safari 27.0 stable ships it, with new default UA styles. Chrome/Edge 135+ and Safari 27. Firefox has the code behind a preference; I could not confirm a default-on release. Still 🟡. |
| 6   | \&nnbsp; listed as an entity                                              | Not a defined HTML named reference. Use `&#8239;` for the narrow no-break space.                                                                                                       |
| 7   | type=module listed twice in the script table                              | Duplicate removed.                                                                                                                                                                     |
| 8   | target=\_blank plus rel=noopener noreferrer called a security requirement | Modern browsers already treat target=\_blank as noopener. Add noreferrer only if you want to suppress the Referer header.                                                              |
| 9   | Declarative Shadow DOM widely available expected Aug 2026                 | That date has passed (30 months after Feb 2024), so it should now read ✅. Confirm on Web Platform Status.                                                                             |
| 10  | onunload listed with no warning                                           | Unreliable and being phased out in Chrome. Use pagehide or visibilitychange.                                                                                                           |

### New or re-statused since June

| Feature                                                                                    | Status | Detail                                                                     |
| ------------------------------------------------------------------------------------------ | ------ | -------------------------------------------------------------------------- |
| Customizable select (appearance: base-select, selectedcontent, ::picker-icon, ::checkmark) | 🟡     | Chrome/Edge 135+, Safari 27.0. Firefox not confirmed.                      |
| img sizes=auto (lazy images only)                                                          | 🆕     | Chrome, Firefox, Safari 27.0. Confirm date on Web Platform Status.         |
| Invoker Commands (command, commandfor)                                                     | 🆕     | Since 12 Dec 2025.                                                         |
| popover=hint                                                                               | 🟡     | Chrome/Edge 133, Firefox 149. Safari missing.                              |
| dialog closedby                                                                            | 🟡     | Chrome/Edge 134, Firefox 141. Safari missing.                              |
| interestfor                                                                                | 🟡     | Chrome/Edge; others not confirmed _(June)_.                                |
| :open pseudo-class                                                                         | 🆕     | Counted among the Baseline 2026 additions.                                 |
| field-sizing: content                                                                      | 🆕     | June 2026. Chrome 123, Safari 26.2, Firefox 152 last.                      |
| Same-document View Transitions                                                             | 🆕     | Since 14 Oct 2025 (Firefox 144).                                           |
| Cross-document View Transitions                                                            | 🟡     | Chrome 126+, Safari 18.2+, Firefox missing.                                |
| @scope                                                                                     | 🆕     | Since 12 Dec 2025.                                                         |
| Trusted Types                                                                              | 🆕     | Since 24 Feb 2026 (Firefox 148).                                           |
| `<model>` element                                                                          | 🟡     | Safari 27 on iOS, iPadOS, macOS (visionOS earlier).                        |
| `<img controls>`                                                                           | 🟡     | Safari; spatial and panorama photo controls on visionOS.                   |
| shadowrootslotassignment                                                                   | 🟡     | New in Safari 27.                                                          |
| :heading and :heading(1, 2)                                                                | 🟡     | New in Safari 27.                                                          |
| Speculation Rules                                                                          | ⚗️     | Still Chromium-only. Firefox has a positive position on the prefetch half. |

## 1. Document structure and boilerplate

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1"
    />
    <meta
      name="color-scheme"
      content="light dark"
    />
    <title>Page Title — Site Name</title>
    <meta
      name="description"
      content="A clear, concise description."
    />
    <link
      rel="stylesheet"
      href="styles.css"
    />
  </head>
  <body>
    <header>…</header>
    <main>…</main>
    <footer>…</footer>
    <script
      src="app.js"
      defer
    ></script>
  </body>
</html>
```

- DOCTYPE must be first. `lang` on `<html>` is required for accessibility and SEO.
- charset must appear within the first 1024 bytes; put it and viewport first in `<head>`.
- `<title>` is mandatory; keep it under about 60 characters.
- `color-scheme` makes native controls and scrollbars follow light/dark with no extra CSS.
- Use `<search>` (✅) instead of `<div class=search>`: it carries the search landmark role
  implicitly.

## 2. Head

| Tag           | Purpose                                                                           |
| ------------- | --------------------------------------------------------------------------------- |
| `<meta>`      | Metadata: charset, viewport, description, robots, theme-color, color-scheme.      |
| `<link>`      | External resources: stylesheets, icons, preloads, canonical URL.                  |
| `<style>`     | Embedded CSS. Prefer external files for caching.                                  |
| `<script>`    | Embedded or external JS. Use defer, async or type=module.                         |
| `<noscript>`  | Fallback when scripting is off.                                                   |
| `<base href>` | Base for every relative URL, including bare #fragment links. One per document.    |
| `<template>`  | Inert fragment, cloned by JS. Basis of Web Components and Declarative Shadow DOM. |

### script attributes

| Attribute              | Meaning                                                                                                                    |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| src                    | External file.                                                                                                             |
| defer                  | Parallel download, runs after parsing, keeps order. Default choice.                                                        |
| async                  | Parallel download, runs as soon as ready, no order. For independent scripts like analytics.                                |
| type=module            | ES module. Deferred automatically.                                                                                         |
| type=importmap         | ✅ (widely available since Sep 2025). Maps bare specifiers to URLs. Must come before the first module script that uses it. |
| type=speculationrules  | ⚗️ Chromium-only. See section 15.                                                                                          |
| crossorigin, integrity | CORS and Subresource Integrity hash (sha384-…). Integrity needs CORS for cross-origin files.                               |
| fetchpriority          | high, low or auto. 🆕 (Newly available since 29 Oct 2024; Widely expected Apr 2027).                                       |
| blocking=render        | Blocks rendering until the script runs. Measure Core Web Vitals first.                                                     |
| nomodule               | Only for browsers without module support.                                                                                  |
| nonce                  | CSP nonce.                                                                                                                 |

### link rel values

| rel                              | Purpose                                                                                                     |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| stylesheet                       | CSS file.                                                                                                   |
| preload                          | Fetch a known-needed resource early. Needs as=. For a responsive image also set imagesrcset and imagesizes. |
| prefetch                         | Low-priority fetch for a likely next navigation.                                                            |
| preconnect                       | DNS + TCP + TLS to a third-party origin now.                                                                |
| dns-prefetch                     | DNS only. Lighter than preconnect.                                                                          |
| modulepreload                    | Preload an ES module and its dependencies.                                                                  |
| expect                           | 🟡 Hold first render until a selector-matched element exists (June).                                        |
| icon, apple-touch-icon, manifest | Favicon, iOS home-screen icon, PWA manifest.                                                                |
| canonical                        | Preferred URL for SEO.                                                                                      |
| alternate                        | Feeds and hreflang translations.                                                                            |

Other link attributes: href (required), as, media, crossorigin, fetchpriority, and blocking=render
(🟡 Chrome, Edge, Safari; Firefox missing, June).

> `<meta name=view-transition>` is obsolete and does nothing. Opt in with the CSS at-rule
> `@view-transition { navigation: auto }` (section 15).

## 3. Meta tags, SEO and social

| Tag                | Notes                                                                        |
| ------------------ | ---------------------------------------------------------------------------- |
| description        | Search snippet, about 150–160 characters.                                    |
| robots             | index, noindex, follow, nofollow, noarchive, nosnippet.                      |
| theme-color        | Browser UI colour. Add a media attribute for separate light and dark values. |
| color-scheme       | light dark. Pairs with CSS light-dark().                                     |
| keywords           | Ignored by search engines. Skip it.                                          |
| http-equiv=refresh | Avoid: bad for accessibility.                                                |

```html
<meta
  property="og:title"
  content="Page Title"
/>
<meta
  property="og:description"
  content="Short description."
/>
<meta
  property="og:image"
  content="https://example.com/og.jpg"
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
  name="twitter:card"
  content="summary_large_image"
/>
```

OG image: 1200×630, under 1 MB. twitter:title, description and image fall back to the og: tags when
absent.

## 4. Text and page structure

| Element                              | Use                                                                                                         |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `<h1>`–`<h6>`                        | Headings. One `<h1>` per page by convention; never skip levels. `<hgroup>` pairs a heading with a subtitle. |
| `<p>`, `<br>`, `<hr>`                | Paragraph, line break (use sparingly), thematic break.                                                      |
| `<div>`, `<span>`                    | Generic block and inline containers. Last resort.                                                           |
| `<pre>`                              | Preformatted, monospace. Use `<pre><code>` for blocks.                                                      |
| `<blockquote cite>`, `<q cite>`      | Block and inline quotations.                                                                                |
| `<strong>` / `<em>`                  | Importance / stress emphasis. Semantic.                                                                     |
| `<b>` / `<i>`                        | Visual bold / italic with no added importance (keywords, foreign terms).                                    |
| `<u>`                                | Unarticulated annotation (e.g. a misspelling). Never for links.                                             |
| `<s>` / `<del>` / `<ins>`            | No longer accurate / deleted / inserted. del and ins take datetime and cite.                                |
| `<mark>`                             | Highlight for relevance (search hits).                                                                      |
| `<small>`                            | Fine print, legal text.                                                                                     |
| `<sub>`, `<sup>`                     | Sub and superscript.                                                                                        |
| `<abbr title>`                       | Abbreviation with its expansion.                                                                            |
| `<cite>`                             | Title of a creative work, not a person.                                                                     |
| `<dfn>`                              | The defining instance of a term.                                                                            |
| `<address>`                          | Contact info for the nearest article or the page.                                                           |
| `<code>`, `<kbd>`, `<samp>`, `<var>` | Code, keyboard input, program output, variable.                                                             |
| `<time datetime>`                    | Machine-readable ISO 8601 date or time.                                                                     |
| `<data value>`                       | Machine-readable value for human text.                                                                      |
| `<wbr>`                              | Optional word-break point in long strings or URLs.                                                          |
| `<bdi>`, `<bdo dir>`                 | Isolate unknown-direction text / override direction.                                                        |
| `<ruby>`, `<rt>`, `<rp>`             | East Asian pronunciation annotations.                                                                       |

## 5. Links

| Syntax                       | Meaning                                                                                              |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| `<a href>`                   | Hyperlink. href may be a URL, #id, mailto:, tel:, sms: or relative path.                             |
| target                       | \_self (default), \_blank, \_parent, \_top.                                                          |
| rel=noopener                 | Implied by target=\_blank in current browsers. Harmless to write.                                    |
| rel=noreferrer               | Also drops the Referer header.                                                                       |
| rel=nofollow, sponsored, ugc | Withhold ranking credit; paid links; user-generated links.                                           |
| download                     | Save the target instead of navigating. Same-origin only unless the server sends Content-Disposition. |
| hreflang                     | Language of the target document.                                                                     |
| referrerpolicy               | e.g. strict-origin-when-cross-origin.                                                                |
| ping                         | List of URLs notified on click. Firefox ignores it by default.                                       |
| interestfor=id               | 🟡 Hover/focus reveal of a popover=hint element. See section 11.                                     |

## 6. Images and responsive media

| Attribute     | Notes                                                                                                                        |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| src, alt      | Both required. alt= (empty) for decorative images.                                                                           |
| width, height | Always set: prevents layout shift (CLS).                                                                                     |
| loading       | lazy or eager. ✅ Never lazy-load the LCP image. Not yet in Baseline for video and audio (see section 9).                    |
| decoding      | async, sync, auto.                                                                                                           |
| srcset, sizes | Resolution/width candidates and the layout width hint.                                                                       |
| sizes=auto    | 🆕 Use the rendered layout width. Valid only with loading=lazy. Write sizes="auto, 100vw" so older browsers have a fallback. |
| fetchpriority | high on the LCP image. 🆕                                                                                                    |
| controls      | 🟡 Safari: spatial and panorama controls on visionOS.                                                                        |
| usemap, ismap | Client-side and server-side image maps.                                                                                      |
| elementtiming | Registers the image with the Element Timing API.                                                                             |

```html
<picture>
  <source
    type="image/avif"
    srcset="hero-480.avif 480w, hero-960.avif 960w, hero-1920.avif 1920w"
    sizes="(max-width: 600px) 100vw, 80vw"
  />
  <source
    type="image/webp"
    srcset="hero-480.webp 480w, hero-960.webp 960w, hero-1920.webp 1920w"
    sizes="(max-width: 600px) 100vw, 80vw"
  />
  <img
    src="hero-960.jpg"
    alt="Describe the image"
    width="1920"
    height="1080"
    fetchpriority="high"
    decoding="async"
  />
</picture>
```

- Above the fold: loading=eager (default), fetchpriority=high, optionally preload with matching
  imagesrcset and imagesizes.
- Below the fold: loading=lazy, decoding=async, and sizes=auto if the layout width is not known up
  front.
- Image maps: `<map name>` plus `<area shape coords href alt>`; shape is rect, circle, poly or
  default.

## 7. Lists and tables

| Element                | Notes                                                                |
| ---------------------- | -------------------------------------------------------------------- |
| `<ul>`, `<ol>`, `<li>` | ol takes type, start and reversed.                                   |
| `<dl>`, `<dt>`, `<dd>` | Term/description pairs.                                              |
| role=list              | Add when list-style: none strips list semantics in Safari/VoiceOver. |

| Table element                   | Notes                                                          |
| ------------------------------- | -------------------------------------------------------------- |
| `<table>`, `<caption>`          | Data only, never layout. Caption directly after the table tag. |
| `<thead>`, `<tbody>`, `<tfoot>` | Row groups.                                                    |
| `<th scope>`                    | col, row, colgroup or rowgroup. Critical for screen readers.   |
| colspan, rowspan                | Span columns or rows.                                          |
| `<colgroup>`, `<col span>`      | Column styling. After caption, before thead.                   |
| headers and id                  | Pair them for complex tables.                                  |

## 8. Forms and inputs

### form

| Attribute    | Meaning                                                      |
| ------------ | ------------------------------------------------------------ |
| action       | Submission URL. Omit when JS handles it.                     |
| method       | GET (appends to the URL) or POST (sensitive or large data).  |
| enctype      | Must be multipart/form-data when the form has file inputs.   |
| target       | Where the response renders.                                  |
| autocomplete | on or off for the whole form.                                |
| novalidate   | Skip built-in constraint validation (for custom validation). |

### input attributes

| Attribute                                     | Meaning                                                                                                                                                                                          |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| type                                          | Control type. Defaults to text.                                                                                                                                                                  |
| name                                          | Key sent on submit. Without it the field is not submitted.                                                                                                                                       |
| id                                            | Must match the label's for.                                                                                                                                                                      |
| value, placeholder                            | Default value; hint text (never a substitute for a label).                                                                                                                                       |
| required, disabled, readonly                  | Must be filled; not submitted and not focusable; submitted but not editable.                                                                                                                     |
| autofocus                                     | At most one element per page.                                                                                                                                                                    |
| autocomplete                                  | email, new-password, current-password, plus two modern tokens: one-time-code (✅ SMS code autofill) and webauthn appended to another token, e.g. username webauthn (✅ conditional-UI passkeys). |
| min, max, step, minlength, maxlength, pattern | Constraints.                                                                                                                                                                                     |
| multiple, accept, capture                     | Several emails or files; file-type filter; front or rear camera on mobile.                                                                                                                       |
| list                                          | Links to a datalist for suggestions.                                                                                                                                                             |
| inputmode, enterkeyhint                       | Virtual keyboard layout; Enter key label.                                                                                                                                                        |
| form                                          | Associate the input with a form by id from outside it.                                                                                                                                           |

### input types

| Type                                    | Notes                                                                                    |
| --------------------------------------- | ---------------------------------------------------------------------------------------- |
| text, search, password                  | Single-line text; search may show a clear button; password is masked.                    |
| email, url, tel, number                 | Format-validated (email, url); phone keypad (tel); numeric with min, max, step (number). |
| date, time, datetime-local, month, week | Pickers. datetime-local has no time zone.                                                |
| color, range                            | Colour picker (#rrggbb); slider.                                                         |
| checkbox, radio                         | Radios in a group share a name.                                                          |
| checkbox with the switch attribute      | 🟡 Native toggle. Safari only.                                                           |
| file                                    | Add multiple and accept.                                                                 |
| hidden                                  | Submitted silently (CSRF tokens, ids).                                                   |
| submit, reset, button, image            | Buttons. Avoid reset.                                                                    |

### other form elements

| Element                             | Notes                                                                                                                                    |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `<label for>`                       | Clicking it focuses the control. Every input needs one.                                                                                  |
| `<textarea>`                        | Add `field-sizing: content` (🆕 June 2026) to auto-grow without JS. Keep a @supports fallback. rows and cols are ignored once it is set. |
| `<select>`                          | Add multiple or size. A bare `<hr>` between options draws a separator (✅).                                                              |
| `<optgroup>`, `<option>`            | Group label; items.                                                                                                                      |
| `<datalist>`                        | Suggestions for an input with list.                                                                                                      |
| `<fieldset>`, `<legend>`            | Group related controls under a caption.                                                                                                  |
| `<button>`                          | type=submit, reset or button. Also hosts command and commandfor, popovertarget and interestfor.                                          |
| `<output>`, `<meter>`, `<progress>` | Computed result; gauge in a known range; task progress (omit value for indeterminate).                                                   |

Submit buttons can override the form per click: formaction, formmethod, formenctype, formtarget,
formnovalidate (handy for Save draft).

### Customizable select 🟡

```html
<select>
  <button><selectedcontent></selectedcontent></button>
  <option value="a">🍎 Apple</option>
  <option value="b">🍌 Banana</option>
</select>
```

```css
@supports (appearance: base-select) {
  select,
  select::picker(select) {
    appearance: base-select;
  }
}
```

- Status: Chrome/Edge 135+ and Safari 27.0 (with new default UA styles). Firefox not confirmed.
  Leave the native select as the fallback.
- New parts: `::picker(select)`, `::picker-icon`, `::checkmark`, `<selectedcontent>`, and rich HTML
  inside `<option>`.
- Behaviour change: the picker stays inside the browser pane, and the select no longer sizes itself
  to its longest option.
- Keyboard, screen-reader and form behaviour stay native.

**Form rules:** every input has a `<label>`; group radios and checkboxes with fieldset and legend;
set autocomplete; never rely on placeholder alone.

## 9. Multimedia and embeds

### video and audio

| Attribute                                      | Notes                                                  |
| ---------------------------------------------- | ------------------------------------------------------ |
| src or `<source>` children                     | Multiple formats; browser picks the first it can play. |
| controls                                       | Native playback UI.                                    |
| autoplay                                       | Needs muted in all major browsers.                     |
| loop, poster, preload                          | Loop; thumbnail; none, metadata or auto.               |
| playsinline                                    | Stay inline on iOS.                                    |
| loading=lazy                                   | 🟡 Chrome 148+ only (June).                            |
| width, height                                  | Prevent layout shift.                                  |
| crossorigin                                    | Required for canvas use.                               |
| disablepictureinpicture, disableremoteplayback | Opt out of PiP and cast.                               |

Audio shares these except poster, playsinline and the size attributes.

`<track>`: kind (subtitles, captions, descriptions, chapters, metadata), src (.vtt), srclang
(required for subtitles), label, default.

```html
<video
  controls
  poster="thumb.jpg"
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
  <track
    kind="captions"
    src="en.vtt"
    srclang="en"
    label="English"
    default
  />
</video>
```

### iframe, embed, graphics

| Element               | Notes                                                                                                                                                                                   |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<iframe>`            | Always add a title. loading=lazy (✅, June). sandbox restricts capabilities. allow grants Permissions Policy (camera, microphone, fullscreen). credentialless is 🟡 and Chromium-first. |
| `<embed>`, `<object>` | Legacy plugin-style embeds; prefer img, video, iframe.                                                                                                                                  |
| `<canvas>`            | JS drawing surface (2D, WebGL, WebGPU). Fires contextlost and contextrestored.                                                                                                          |
| `<svg>`               | Inline vector graphics, styleable with CSS.                                                                                                                                             |
| `<model>`             | 🟡 3D model embed, Safari 27 (iOS, iPadOS, macOS; visionOS earlier). Takes source children plus an img fallback. Attributes include environmentmap and stagemode.                       |

## 10. Semantic structure

| Element                    | Use                                                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `<header>`, `<footer>`     | Intro and closing content of the page or a section.                                                                      |
| `<main>`                   | The page's dominant content. One per page.                                                                               |
| `<nav>`                    | Navigation. Give each one a unique aria-label when there are several.                                                    |
| `<section>`                | Thematic grouping; give it a heading.                                                                                    |
| `<article>`                | Self-contained, redistributable content.                                                                                 |
| `<aside>`                  | Tangential content.                                                                                                      |
| `<figure>`, `<figcaption>` | Referenced self-contained content and its caption.                                                                       |
| `<search>`                 | ✅ Search landmark, implicit role=search.                                                                                |
| `<details>`, `<summary>`   | Disclosure widget with no JS. Same name attribute on several details makes an exclusive accordion (🆕 since 3 Sep 2024). |
| `<dialog>`                 | Native modal or non-modal dialog. See section 11.                                                                        |
| `<menu>`                   | Toolbar-style list of commands.                                                                                          |
| `<template>`, `<slot>`     | Inert fragment; Web Component insertion point.                                                                           |

```html
<header>
  <search>
    <form action="/search">
      <label for="q">Find a movie</label>
      <input
        type="search"
        id="q"
        name="q"
      />
      <button>Search</button>
    </form>
  </search>
</header>
```

### Declarative Shadow DOM

A template with shadowrootmode lets the parser attach a shadow root, so server-rendered components
are encapsulated before any JS runs. Newly available since Feb 2024; its 30-month mark passed in Aug
2026, so it should now be ✅.

```html
<user-card>
  <template shadowrootmode="open">
    <style>
      p {
        color: var(--accent);
      }
    </style>
    <p>Jane Smith, Lead Engineer</p>
  </template>
</user-card>
```

| Attribute                     | Meaning                                                      |
| ----------------------------- | ------------------------------------------------------------ |
| shadowrootmode=open or closed | Required. Same as attachShadow mode.                         |
| shadowrootclonable            | Cloning the host clones the shadow root.                     |
| shadowrootdelegatesfocus      | Focusing the host focuses its first focusable inner element. |
| shadowrootserializable        | Include the shadow root when serializing (getHTML).          |
| shadowrootslotassignment      | 🟡 named or manual slot assignment. New in Safari 27.        |

## 11. Declarative UI: popover, invoker commands, interest, anchors

### popover

| Value or attribute                 | Status and behaviour                                                                                        |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| popover or popover=auto            | 🆕 Top layer, light-dismiss, closes other auto popovers.                                                    |
| popover=manual                     | Closed only by script or an invoker. Several can be open (toasts).                                          |
| popover=hint                       | 🟡 For tooltips: dismisses other hints but not auto popovers. Chrome/Edge 133, Firefox 149. Safari missing. |
| popovertarget, popovertargetaction | Original declarative invoker. Still valid.                                                                  |
| ::backdrop, :popover-open          | Styling hooks.                                                                                              |

### Invoker Commands (command and commandfor) 🆕

Baseline Newly available since 12 Dec 2025. Buttons only. commandfor is the target id; command is
the action.

| command                                    | Effect                                                    |
| ------------------------------------------ | --------------------------------------------------------- |
| show-modal, close, request-close           | On a dialog.                                              |
| toggle-popover, show-popover, hide-popover | On a popover.                                             |
| a custom value starting with two dashes    | Fires a command event on the target for your own handler. |

```html
<button
  commandfor="confirm"
  command="show-modal"
>
  Delete
</button>
<dialog
  id="confirm"
  closedby="any"
>
  <p>Are you sure?</p>
  <button
    commandfor="confirm"
    command="close"
  >
    Cancel
  </button>
</dialog>

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
  …
</div>
```

The browser sets aria-expanded and manages focus. If a button carries both commandfor and
popovertarget, commandfor wins. Built-in commands target dialog and popover only, not details.

### dialog

| Feature                            | Status                                                                                                                                   |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| showModal(), show()                | ✅ Modal (focus trap, inert page, top layer) or non-modal.                                                                               |
| close(), requestClose()            | requestClose fires a cancelable cancel event first. 🆕 since 27 May 2025.                                                                |
| closedby=any, closerequest or none | 🟡 Who may dismiss it. Chrome/Edge 134, Firefox 141. Safari missing. Does not apply to dialog popover; use popover=auto or manual there. |

### interestfor 🟡

Hover, long-press or keyboard-focus reveal for a popover=hint element. Works on button and a. Delay
is tuned with the interest-delay properties. Chrome/Edge only as far as I could confirm (June);
polyfills exist.

```html
<button interestfor="tip">Info</button>
<div
  id="tip"
  popover="hint"
>
  Extra detail.
</div>
```

### :open 🆕

One pseudo-class for the open state of details, dialog and the native pickers of select and date or
colour inputs: `dialog:open, details:open { }`.

### CSS Anchor Positioning (Baseline 2026)

```css
.trigger {
  anchor-name: --a;
}
.tip {
  position: absolute;
  position-anchor: --a;
  position-area: top span-right;
  position-try-fallbacks: flip-block;
}
```

- Safari 27.0 changes: anchors follow transformed anchors; the position-anchor default is now normal
  (none opts out); `anchors-valid` and `anchors-visible` are renamed `anchor-valid` and
  `anchor-visible` (old keywords still accepted for now).
- A popover invoker already creates an implicit anchor relationship, so you often need no
  anchor-name at all.
- The HTML `anchor` attribute is non-standard. Use the CSS properties.

## 12. Global attributes

| Attribute                                                | Notes                                                                                                                                                                                                                       |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id, class, style, title                                  | Unique id; CSS and JS hook; inline CSS (sparingly); advisory tooltip, not a substitute for aria-label.                                                                                                                      |
| lang, dir                                                | Language override; ltr, rtl or auto (good for user-submitted text).                                                                                                                                                         |
| tabindex                                                 | 0 natural order; -1 script-focusable only; avoid positive values.                                                                                                                                                           |
| hidden, hidden=until-found                               | until-found keeps content findable by find-in-page and text fragments and reveals it on a match, firing beforematch. Chrome and Firefox; Safari 27 release notes include a VoiceOver fix for it. Confirm the Baseline date. |
| inert                                                    | ✅ Subtree becomes non-interactive, unfocusable and hidden from the accessibility tree.                                                                                                                                     |
| data-\*                                                  | Custom data, read via element.dataset.                                                                                                                                                                                      |
| contenteditable                                          | true, false or plaintext-only (✅ 2025).                                                                                                                                                                                    |
| draggable, spellcheck, translate, accesskey              | Drag and drop; spell check; translation hint; keyboard shortcut (use cautiously).                                                                                                                                           |
| autocapitalize, enterkeyhint, inputmode                  | Virtual-keyboard hints. Work on any editable element.                                                                                                                                                                       |
| is, nonce                                                | Customized built-in element; CSP nonce.                                                                                                                                                                                     |
| popover, popovertarget, command, commandfor, interestfor | See section 11.                                                                                                                                                                                                             |
| part, exportparts, slot                                  | Web Component styling and slotting hooks.                                                                                                                                                                                   |
| writingsuggestions, autocorrect                          | 🟡 Not Baseline.                                                                                                                                                                                                            |

## 13. ARIA

**First rule:** use native HTML when it can do the job. `<button>` over a div with role=button,
`<search>` over role=search, `<dialog>` over role=dialog.

| Landmark role | Native element                                                             |
| ------------- | -------------------------------------------------------------------------- |
| banner        | `<header>` as a direct child of body                                       |
| navigation    | `<nav>`                                                                    |
| main          | `<main>`                                                                   |
| complementary | `<aside>`                                                                  |
| contentinfo   | `<footer>` as a direct child of body                                       |
| search        | `<search>`                                                                 |
| form          | No element. Add role=form with a label only for forms worth navigating to. |
| region        | `<section>` that has an accessible name                                    |

If a landmark appears twice, give each a distinct aria-label and do not repeat the role word in it.

| Group              | Attributes                                                                                                                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Naming             | aria-label, aria-labelledby, aria-describedby, aria-details; aria-description and aria-braillelabel / aria-brailleroledescription (🆕 ARIA 1.3 draft)                                                        |
| State              | aria-expanded (set for you by Invoker Commands), aria-current (page, step, location, date, time, true), aria-disabled, aria-checked (true, false, mixed), aria-selected, aria-pressed, aria-busy, aria-modal |
| Hiding             | aria-hidden removes an element from the accessibility tree only. It stays visible and focusable.                                                                                                             |
| Relationships      | aria-controls, aria-owns, aria-haspopup, aria-setsize, aria-posinset, aria-rowcount, aria-colcount                                                                                                           |
| Live regions       | aria-live (polite, assertive, off), aria-atomic, aria-relevant                                                                                                                                               |
| Validation         | aria-invalid (pair with aria-describedby), aria-required, aria-errormessage                                                                                                                                  |
| Values and widgets | aria-valuemin, aria-valuemax, aria-valuenow, aria-valuetext, aria-orientation, aria-multiselectable, aria-readonly, aria-placeholder, aria-autocomplete, aria-keyshortcuts, aria-roledescription             |

ARIA 1.3 draft adds the roles suggestion, comment and mark for collaborative-editing UIs. Most ARIA
attributes are also reflected as DOM properties (element.ariaExpanded).

## 14. Events

Prefer addEventListener over inline on\* attributes: inline handlers cannot be removed and break
many CSP setups.

| Event                                                 | Notes                                                                                       |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| click, dblclick, contextmenu                          | Pointer actions.                                                                            |
| mouseenter, mouseleave                                | Do not bubble. mouseover and mouseout do.                                                   |
| keydown, keyup                                        | keypress is deprecated.                                                                     |
| focus, blur / focusin, focusout                       | The second pair bubbles; use it for delegation.                                             |
| beforeinput                                           | ✅ Before text changes; cancelable. Not fired on select.                                    |
| input, change                                         | Live value change; committed value.                                                         |
| submit, reset                                         | Form events.                                                                                |
| scroll, scrollend                                     | scrollend ✅ (2025) for post-scroll work.                                                   |
| toggle, beforetoggle                                  | ✅ details, dialog and popover; beforetoggle fires first and is useful for exit animations. |
| beforematch                                           | 🆕 Fires on a hidden=until-found element before it is revealed.                             |
| command                                               | Fired on the target for custom invoker commands.                                            |
| pageswap, pagereveal                                  | 🟡 Cross-document View Transitions.                                                         |
| pagehide, visibilitychange                            | Use these, not unload, to save state.                                                       |
| contextlost, contextrestored                          | Canvas rendering context lost and restored.                                                 |
| play, pause, ended, timeupdate, canplay, volumechange | Media.                                                                                      |

## 15. Performance and navigation

| link rel      | Does                                                               | Cost          |
| ------------- | ------------------------------------------------------------------ | ------------- |
| dns-prefetch  | DNS only                                                           | Very low      |
| preconnect    | DNS, TCP, TLS. Dropped if unused for about 10 s.                   | Low           |
| preload       | Fetch a known-needed resource now                                  | Medium        |
| prefetch      | Fetch a likely next document                                       | Low to medium |
| modulepreload | Fetch an ES module and its imports                                 | Medium        |
| expect        | 🟡 Hold first paint until a selector-matched element exists (June) | Varies        |

### Speculation Rules ⚗️ Chromium only

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

- prefetch downloads the document only. prerender loads and runs it in a hidden tab, so it costs
  much more.
- eagerness: immediate, eager, moderate, conservative.
- Never speculate URLs with side effects on GET (logout, add to cart, delete).
- Firefox and Safari ignore the script silently. For them, feature-detect with relList.supports and
  fall back to rel=prefetch on hover.

### View Transitions

- Same document 🆕 (since 14 Oct 2025): `document.startViewTransition(() => updateDOM())`. The
  `:active-view-transition` pseudo-class is 🆕 too (Jan 2026).
- Cross document 🟡 (Chrome 126+, Safari 18.2+, Firefox missing): both pages opt in with CSS.

```css
@view-transition {
  navigation: auto;
}
@media (prefers-reduced-motion: reduce) {
  @view-transition {
    navigation: none;
  }
}
h1 {
  view-transition-name: page-heading;
}
```

- Only same-origin, user-initiated navigations (links, back, forward) trigger it. Form POSTs and
  script navigations do not.
- Two visible elements with the same view-transition-name on one page cancel the transition. Keep
  names unique.
- pageswap and pagereveal let you customize or cancel it. A 4-second timeout applies (June).

## 16. Character entities

| Group        | Entities                                                                                                                |
| ------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Reserved     | `&amp;` `&lt;` `&gt;` `&quot;` `&apos;`                                                                                 |
| Spaces       | `&nbsp;` no-break; `&#8239;` narrow no-break (no named form exists)                                                     |
| Legal        | `&copy;` `&reg;` `&trade;`                                                                                              |
| Punctuation  | `&mdash;` `&ndash;` `&hellip;` `&bull;` `&middot;` `&sect;` `&lsquo;` `&rsquo;` `&ldquo;` `&rdquo;` `&laquo;` `&raquo;` |
| Math         | `&deg;` `&times;` `&divide;` `&plusmn;` `&infin;`                                                                       |
| Currency     | `&euro;` `&pound;` `&yen;` `&cent;`                                                                                     |
| Numeric only | `&#64;` at sign; `&#10003;` check; `&#10004;` heavy check; `&#10007;` ballot X                                          |

## 17. Deprecated, removed and outdated

| Tag                         | Replace with                                                |
| --------------------------- | ----------------------------------------------------------- |
| center, font, big, basefont | CSS: text-align, margin auto, font-family, font-size, color |
| tt                          | code, kbd or samp                                           |
| strike                      | s or del                                                    |
| acronym                     | abbr                                                        |
| dir                         | ul                                                          |
| marquee, blink              | CSS animation (respect prefers-reduced-motion)              |
| frame, frameset, noframes   | iframe or app routing                                       |
| applet                      | object or Web APIs                                          |
| isindex                     | input type=search                                           |
| rb                          | Obsolete. Use ruby and rt directly.                         |
| keygen, menuitem            | Removed. Web Crypto API; no replacement.                    |

Presentational attributes (align, bgcolor, border on img, cellpadding, cellspacing, hspace, vspace,
width and height on most elements) are replaced by CSS. width and height remain correct on img,
video, canvas and iframe.

| Outdated technique                               | Use instead                                    |
| ------------------------------------------------ | ---------------------------------------------- |
| meta name=view-transition                        | `@view-transition` CSS at-rule                 |
| link rel=prerender                               | Speculation Rules (Chromium), or rel=prefetch  |
| div with role=button, dialog or search           | button, dialog, search                         |
| Popper, Floating UI or Tippy for simple tooltips | popover plus CSS Anchor Positioning            |
| Hand-wired aria-expanded dropdown buttons        | command and commandfor                         |
| JS auto-resize textarea                          | field-sizing: content behind @supports         |
| Select2 or React Select just for styling         | Customizable select as progressive enhancement |
| unload or beforeunload to save state             | pagehide, visibilitychange                     |

## 18. What to ship today

| Feature                                                                                                                                | Decision                                                                               |
| -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| command and commandfor, popover auto and manual, dialog, details name, search, inert, importmap, same-document View Transitions, :open | Ship. 🆕 or ✅.                                                                        |
| field-sizing, sizes=auto                                                                                                               | Ship. 🆕. Keep a fallback (@supports; sizes="auto, 100vw").                            |
| popover=hint, dialog closedby, interestfor                                                                                             | Enhancement. Fall back to popover=auto, or to Esc-only dismissal.                      |
| Customizable select                                                                                                                    | Enhancement behind @supports (appearance: base-select). Native select is the fallback. |
| Cross-document View Transitions                                                                                                        | Enhancement. Navigation works normally without it.                                     |
| Speculation Rules                                                                                                                      | Chromium enhancement. rel=prefetch fallback.                                           |
| model, img controls                                                                                                                    | Safari-only. Always provide an img or poster fallback.                                 |

## Verification notes

Re-verified for this edition: cross-document and same-document View Transitions, Speculation Rules,
popover=hint, closedby, requestClose, Invoker Commands, customizable select (Safari 27.0),
field-sizing, details name, fetchpriority, and the Safari 27.0 HTML additions.

Carried from the June edition without a fresh source: link rel=expect, iframe loading=lazy Widely
status, video and audio loading=lazy (Chrome 148), iframe credentialless, interestfor outside
Chrome/Edge, the hidden=until-found Baseline date, the ARIA 1.3 items, the exact Baseline date of
popover, whether Firefox ships customizable select, and the Baseline date of sizes=auto.

Before relying on any single feature, check it on Web Platform Status (webstatus.dev).

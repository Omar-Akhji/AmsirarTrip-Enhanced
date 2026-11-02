# Tour Itinerary Sticky Progress Bar & Timeline Indicator

*   **Author:** Omar AJ & Antigravity
*   **Status:** Proposed
*   **Date:** 2026-11-02
*   **Framework/Skill:** Elephant-Goldfish Model (`egm-draft`)

--------------------------------------------------------------------------------

## Overview

Tour itinerary pages contain multi-day schedules detailing routes, cities, accommodations, and activities. On mobile and desktop devices, users scrolling through longer itineraries (e.g., 3-day to 10-day expeditions) lose context of which day and route segment they are currently reviewing.

This design introduces a synchronized progress system for the Tour Itinerary:
1. A **sticky summary header** that pins below the navigation bar while scrolling through the itinerary, showing the active day (e.g., "STAGE 03 · 3RD DAY"), current route cities (e.g., "Boumalne Dades ➜ Merzouga"), and progress counter (e.g., "03 / 04").
2. A **vertical timeline rail** with an active indicator dot that travels down the itinerary track in sync with scroll position.

## The Problem

When reviewing a tour's day-by-day itinerary:
- The overall itinerary is lengthy. Once the user scrolls past Day 1, the page lacks persistent location and temporal markers.
- Users have to scroll up to check which day they are inspecting or which cities are on the itinerary for that leg.
- There is no continuous visual indication of how far the user has progressed through the journey.

## Goals

1. **Persistent Context**: Keep the active stage, ordinal day, and route cities persistently visible in a sticky bar while the itinerary section is in the viewport.
2. **Scroll-Driven Tracking**: Move a timeline indicator dot down the vertical guide rail as the user scrolls, updating the active stage when the indicator crosses into the next day.
3. **Responsive Ergonomics**: Provide a compact bar on mobile viewports (<640px) and an expanded bar with route locations on tablet/desktop viewports (>=640px).
4. **Performance & Clean Lifecycle**: Implement scroll observation using `IntersectionObserver` and `requestAnimationFrame` with zero external dependencies. Handle Astro page navigation (`astro:page-load`) without memory leaks or stale listeners.

## Non-Goals

1. **Interactive Navigation / Jumping**: Clicking sticky items to jump to days is out of scope for the initial version (scroll-driven observation only).
2. **Excursion Pages Modification**: Single-day excursions do not feature multi-day itineraries and are excluded from this feature.
3. **External Animation Libraries**: No heavyweight third-party timeline libraries (e.g., Framer Motion, GSAP ScrollSmoother) will be introduced. Pure CSS sticky positioning and standard web APIs will drive the component.

## Open Questions

*   **Question 1**: Should the sticky bar pin directly underneath the global header navbar, or should it float as an island badge on mobile?
*   **Question 2**: When scrolling past the final day into the "Included / Excluded" section, should the sticky bar fade out, unpin, or remain docked?

## Critical User Journeys (CUJs)

### CUJ 1: Reviewing Day-by-Day Expedition on Desktop

*   **Given**: A user is viewing a 4-day tour page (e.g., Atlas and Desert Escape) and scrolls to the "Expedition Itinerary" section.
*   **When**: The user reaches the top of the itinerary section.
*   **Then**: The sticky bar slides into view below the navbar showing "STAGE 01 · 1ST DAY | Marrakech ➜ Boumalne Dades | 01 / 04".
*   **When**: The user scrolls down into the Day 2 card.
*   **Then**: The timeline dot travels smoothly down the vertical rail, crossing into Day 2. The sticky bar updates to "STAGE 02 · 2ND DAY | Boumalne Dades ➜ Merzouga | 02 / 04".

### CUJ 2: Scrolling Past the Itinerary Section

*   **Given**: The user has finished reading the final day (e.g., Day 4).
*   **When**: The user scrolls into the "Included & Excluded Services" section.
*   **Then**: The sticky bar smoothly fades out and unpins, leaving unobstructed space for subsequent sections.

--------------------------------------------------------------------------------

## Technical Plan (Architecture)

### Architecture Diagram

```
+-----------------------------------------------------------+
| Site Navigation Header (sticky top-0)                     |
+-----------------------------------------------------------+
| [Sticky Itinerary Stage Bar] (sticky top-16/top-20 z-20)   |
| Stage 03 · 3RD DAY | Merzouga ➜ Ouarzazate | 03 / 04 [==--] |
+-----------------------------------------------------------+
| Itinerary Section Track                                   |
|                                                           |
|  (●)  --- STAGE 01 · 1ST DAY ---------------------------  |
|   |   Marrakech ➜ Boumalne Dades                          |
|   |   Details, accommodations, activities...              |
|   |                                                       |
|  (●)  --- STAGE 02 · 2ND DAY ---------------------------  |
|   |   Boumalne Dades ➜ Merzouga                           |
|   |   Details, accommodations, activities...              |
|   |                                                       |
|  (●) <--- [Traveling Dot follows scroll position]         |
|   |                                                       |
|  (○)  --- STAGE 03 · 3RD DAY ---------------------------  |
|   |   Merzouga ➜ Ouarzazate                               |
|   |   Details, accommodations, activities...              |
+-----------------------------------------------------------+
```

### Component Breakdown

1. **`TourItinerary.astro`**:
   - Embeds a `<div class="itinerary-sticky-bar sticky top-16 sm:top-20 z-20">` container at the head of the list.
   - Enriches each `<li>` item with data attributes: `data-itinerary-stage`, `data-stage-number`, `data-stage-title`, `data-stage-ordinal`.
   - Incorporates a continuous vertical rail `<div class="timeline-rail">` with a dynamic thumb indicator `<div class="timeline-dot">`.
   - Attaches a lightweight client script module or custom element (`<tour-itinerary-tracker>`).

2. **Controller Logic (`src/features/tours/scripts/tour-itinerary-tracker.ts`)**:
   - Uses `IntersectionObserver` with root margin `-20% 0px -70% 0px` to determine the active day based on user scroll position.
   - Calculates relative scroll percentage within the stages container to update the vertical indicator dot position without jank.
   - Updates text content, progress bar width, and active state classes with minimal DOM mutations.

--------------------------------------------------------------------------------

## Alternatives Considered

### Alternative A: Global Window Scroll Listener without IntersectionObserver
*   **Pros**: Simple arithmetic on `window.scrollY`.
*   **Cons**: Causes continuous layout reads (`getBoundingClientRect`) during fast scrolling, risking frame drops on mobile devices.
*   **Reason for Rejection**: `IntersectionObserver` handles threshold crossings off the main rendering thread and only triggers updates when section boundaries intersect the viewport trigger line.

### Alternative B: Fixed Bottom Navigation Bar on Mobile
*   **Pros**: Closer to user's thumbs on mobile phones.
*   **Cons**: Conflicts with mobile browser bottom chrome (Safari address bar, Chrome navigation bar) and crowds the screen.
*   **Reason for Rejection**: A clean top-pinned bar placed immediately below the site header matches the user's reference design and maintains consistent hierarchy.

--------------------------------------------------------------------------------

## Detailed Implementation Plan

### Target Files to Create/Modify

#### 1. `src/features/tours/components/TourItinerary.astro` (Modify)
*   **Scope**: Component markup and styling.
*   **Changes**:
    - Add sticky header element with day label, route locations, and progress counter.
    - Add continuous timeline rail with absolute traveling dot.
    - Add data attributes for stage numbering and titles.

#### 2. `src/features/tours/scripts/tour-itinerary-tracker.ts` (Create)
*   **Scope**: Client controller for scroll tracking.
*   **Changes**:
    - Manage active stage detection via `IntersectionObserver`.
    - Update sticky bar text and progress bar smoothly.
    - Clean up observer and listeners on Astro page transitions.

### Verification Plan
*   **Linting**: `bunx eslint src/features/tours/`
*   **Type Safety**: `bun run check`
*   **Visual Check**: Verify scroll tracking across multi-day tour itineraries on mobile (375px) and desktop (1280px).

--------------------------------------------------------------------------------

*Drafted with EGM*

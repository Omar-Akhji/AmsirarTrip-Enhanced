# Amsirar Trip 🇲🇦

> **Boutique Moroccan Tours, Desert Expeditions & Cultural Journeys**  
> Premium web platform for [Amsirar Trip](https://amsirartrip.com), a licensed local tour operator
> based in Marrakech offering private Sahara desert tours, High Atlas mountain trekking, and bespoke
> itineraries across Morocco.

---

## 🌟 Overview

Amsirar Trip is an editorial, high-performance web application designed with deep craft, physical
interaction design, and multilingual reach across Europe and the Americas. Built with modern web
architecture to deliver instant page transitions, fluid animations, and high-converting booking
workflows.

- **Private Sahara Expeditions**: Merzouga (Erg Chebbi), Zagora, and M'Hamid (Erg Chegaga).
- **High Atlas Mountain Treks**: Mount Toubkal summits, Imlil valley, and Berber stone villages.
- **Imperial Cities Itineraries**: Marrakech, Fes, Meknes, Rabat, Chefchaouen, and Essaouira.
- **Day Trips & Excursions**: Ouzoud Waterfalls, Ourika Valley, Agafay Desert sunset, and hot-air
  balloon flights.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: [Astro](https://astro.build/) (Server-Side Rendering via `@astrojs/node` adapter)
- **Interactive Islands**: [Vue 3](https://vuejs.org/) (Booking forms, newsletter modal, interactive
  calendar, video player)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with OKLCH warm Moroccan palette tokens
  (terracotta, golden amber, sand canvas)
- **Motion & Interactions**: [GSAP](https://gsap.com/),
  [Lenis](https://github.com/darkroomengineering/lenis) smooth scrolling, native View Transitions,
  and sub-300ms motion craft
- **Package Manager & Runtime**: [Bun](https://bun.sh/)
- **Internationalization (i18n)**: 4 languages supported (`en`, `fr`, `es`, `de`) with localized
  slug routing, language selector, and alternate hreflang canonicals
- **SEO & AI Discoverability**: Schema.org JSON-LD (Organization, Tour, TouristTrip, FAQPage,
  BreadcrumbList), XML sitemap index, `/llms.txt`, and `/ai-catalog.json`
- **Security & Privacy**: Strict Content Security Policy (`strict-dynamic`), anti-CSRF headers,
  Google reCAPTCHA v3 verification, and GDPR-compliant cookie consent

---

## 📁 Project Structure

```text
├── public/                     # Static assets, fonts, icons, manifests & llms.txt
├── src/
│   ├── actions/                # Astro server actions (booking & contact dispatches)
│   ├── content/                # Content collections (tours, excursions, legal MDX)
│   ├── features/               # Feature-sliced domain modules
│   │   ├── about/              # Agency story, guide bios, mission
│   │   ├── booking/            # Vue booking form, validation & calculation
│   │   ├── contact/            # Contact methods stack & interactive map
│   │   ├── excursions/         # Day trip catalog & program itineraries
│   │   ├── home/               # Hero carousel, scroll stack, stats & reviews
│   │   ├── legal/              # Privacy policy & terms of service
│   │   └── tours/              # Multi-day tour packages & detailed itineraries
│   ├── i18n/                   # Locales, dictionary schemas, and routing utilities
│   ├── layouts/                # Base HTML layout, head metadata, scripts & navbar
│   ├── lib/                    # CSP, structured data, API helpers & constants
│   ├── locales/                # Translation JSON bundles (en, fr, es, de)
│   ├── pages/                  # Dynamic localized route endpoints ([...locale])
│   ├── scripts/                # Compositor animations, transitions & smooth scroll
│   ├── shared/                 # Reusable UI components, modals, and layouts
│   └── styles/                 # global.css design tokens & scroll keyframes
├── tests/                      # Playwright E2E and TypeScript type tests
└── AGENTS.md                   # Project execution protocols and agent playbooks
```

---

## 🚀 Getting Started

### Prerequisites

Install [Bun](https://bun.sh/) (version 1.1+ recommended).

### Installation

```bash
bun install
```

### Development

Start the local Astro development server with hot-module reloading:

```bash
bun run dev
```

Visit `http://localhost:4321` in your browser.

### Building for Production

Compile server and client bundles into `./dist/`:

```bash
bun run build
```

Preview the production server locally:

```bash
bun run preview
```

### Verification & Testing

```bash
# Type check and diagnostic analysis
bun run check

# Lint source files
bun run lint

# Format code with Prettier
bun run format

# Run Playwright E2E test suites
bun run test:e2e
```

---

## 📄 License & Ownership

Copyright © 2026 **Amsirar Trip SARL**. All rights reserved. Licensed Moroccan Tour Operator —
Marrakech, Morocco.

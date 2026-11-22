import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { afterEach, describe, expect, it, vi } from "vitest";
import NewsletterModal from "../../src/layouts/footer/NewsletterModal.astro";
import LanguageSelector from "../../src/layouts/navbar/LanguageSelector.astro";
import PageHeader from "../../src/layouts/PageHeader.astro";
import { checkRateLimit, clearRateLimitStateForTests } from "../../src/lib/api-utils";
import FaqAccordion from "../../src/shared/ui/widgets/FaqAccordion.astro";
import TripMetricTile from "../../src/shared/ui/widgets/TripMetricTile.astro";

describe("Astro Container API component rendering", () => {
  it("renders FaqAccordion in both bare and section modes with FAQPage schema and exclusive details group", async () => {
    const container = await AstroContainer.create();
    const faqs = [{ question: "What to pack?", answer: "Warm layers for desert nights." }];

    const fullHtml = await container.renderToString(FaqAccordion, {
      props: {
        bare: false,
        categoryLabel: "FAQ",
        faqTitle: "Desert Questions",
        faqs,
        idPrefix: "tour",
      },
    });
    expect(fullHtml).toContain('data-animate="step-unfold"');
    expect(fullHtml).toContain('itemtype="https://schema.org/FAQPage"');
    expect(fullHtml).toContain("Desert Questions");
    expect(fullHtml).toContain('name="tour-faq"');

    const bareHtml = await container.renderToString(FaqAccordion, {
      props: { bare: true, faqs, idPrefix: "bare" },
    });
    expect(bareHtml).toContain('data-animate="step-unfold"');
    expect(bareHtml).toContain("What to pack?");
    expect(bareHtml).not.toContain("<section");
  });

  it("renders TripMetricTile with dl/dt/dd semantics and optional compact/tabular variants", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TripMetricTile, {
      props: {
        compact: true,
        label: "Duration",
        tabularNums: true,
        truncate: true,
        value: "3 Days",
      },
      slots: { default: '<svg data-testid="metric-icon"></svg>' },
    });

    expect(html).toContain("<dt");
    expect(html).toContain("Duration");
    expect(html).toContain("<dd");
    expect(html).toContain("3 Days");
    expect(html).toContain("tabular-nums");
    expect(html).toContain("metric-icon");
  });

  it("renders LanguageSelector with semantic nav and list links instead of ARIA menu roles", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(LanguageSelector, {
      props: { id: "test-lang", placement: "right", size: "sm" },
    });

    expect(html).toContain("<nav");
    expect(html).toContain('popover="auto"');
    expect(html).toContain('aria-current="true"');
    expect(html).toContain('hreflang="fr"');
    expect(html).not.toContain('role="menu"');
    expect(html).not.toContain('role="menuitemradio"');
  });

  it("renders PageHeader with localized breadcrumb navigation and valid heading structure", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(PageHeader, {
      locals: { locale: "en" },
      props: {
        breadcrumbs: [{ label: "Home", href: "/" }, { label: "Tours" }],
        hasUnderline: true,
        headingId: "tours-heading",
        subtitle: "Explore private Sahara circuits",
        title: "Morocco Desert Tours",
      },
    });

    expect(html).toContain('id="tours-heading"');
    expect(html).toContain("Morocco Desert Tours");
    expect(html).toContain('aria-current="page"');
    expect(html).not.toContain("<hgroup");
  });

  it("renders NewsletterModal with progressive-enhancement POST form, closedby=any, and hidden language input", async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(NewsletterModal, { props: { locale: "fr" } });

    expect(html).toContain('closedby="any"');
    expect(html).toContain('method="POST"');
    expect(html).toContain('name="language"');
    expect(html).toContain('value="fr"');
    expect(html).toContain('name="website"');
  });
});

describe("Deterministic fake-timer rate-limit window expiry", () => {
  afterEach(() => {
    clearRateLimitStateForTests();
    vi.useRealTimers();
  });

  it("resets quota deterministically after windowMs elapses using vi.setSystemTime", () => {
    vi.useFakeTimers();
    const start = new Date("2026-11-21T12:00:00Z");
    vi.setSystemTime(start);

    const identifier = "newsletter:198.51.100.55";
    expect(checkRateLimit({ identifier, maxRequests: 1, windowMs: 60_000 }).allowed).toBe(true);
    expect(checkRateLimit({ identifier, maxRequests: 1, windowMs: 60_000 }).allowed).toBe(false);

    vi.setSystemTime(new Date(start.getTime() + 60_001));
    expect(checkRateLimit({ identifier, maxRequests: 1, windowMs: 60_000 }).allowed).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import {
  generateFaqJsonLd,
  generateOrganizationJsonLd,
  generateTourJsonLd,
  generateWebsiteJsonLd,
} from "./structuredData";

describe("generateTourJsonLd", () => {
  it("generates valid TouristTrip schema", () => {
    const result = generateTourJsonLd({
      name: "3-Day Sahara Tour",
      description: "Explore the desert",
      provider: "Amsirar Trip",
      image: "/images/tour.webp",
      duration: "P3D",
      location: { start: "Marrakech", end: "Marrakech" },
      url: "/tours/sahara-3-days",
    });

    expect(result["@type"]).toBe("TouristTrip");
    expect(result.name).toBe("3-Day Sahara Tour");
    expect(result.image).toBe("https://amsirartrip.com/images/tour.webp");
    expect(result.url).toBe("https://amsirartrip.com/tours/sahara-3-days");
    expect(result.provider["@type"]).toBe("TravelAgency");
  });

  it("includes price when provided", () => {
    const result = generateTourJsonLd({
      name: "Tour",
      description: "Desc",
      provider: "Amsirar Trip",
      image: "/img.webp",
      price: 295,
      currency: "EUR",
      duration: "P3D",
      location: { start: "A", end: "B" },
      url: "/tours/tour",
    });

    expect(result.offers).toBeDefined();
    expect(result.offers!.price).toBe(295);
    expect(result.offers!.priceCurrency).toBe("EUR");
  });

  it("sanitizes HTML from name and description", () => {
    const result = generateTourJsonLd({
      name: "<script>alert('xss')</script>Tour",
      description: "Clean <b>bold</b> text",
      provider: "Amsirar Trip",
      image: "/img.webp",
      duration: "P1D",
      location: { start: "A", end: "B" },
      url: "/tour",
    });

    expect(result.name).not.toContain("<script>");
    expect(result.description).not.toContain("<b>");
  });
});

describe("generateFaqJsonLd", () => {
  it("generates valid FAQPage schema", () => {
    const result = generateFaqJsonLd([
      { question: "Is this tour private?", answer: "Yes, it can be." },
      { question: "What's included?", answer: "Transport and hotel." },
    ]) as Record<string, unknown>;

    expect(result["@type"]).toBe("FAQPage");
    const entities = result["mainEntity"] as Record<string, unknown>[];
    expect(entities).toHaveLength(2);
    expect(entities[0]!["@type"]).toBe("Question");
  });
});

describe("generateOrganizationJsonLd", () => {
  it("generates valid TravelAgency schema", () => {
    const result = generateOrganizationJsonLd();

    expect(result["@type"]).toBe("TravelAgency");
    expect(result.name).toBe("Amsirar Trip");
    expect(result.foundingDate).toBe("2004");
    expect(result.sameAs).toBeInstanceOf(Array);
    expect(result.aggregateRating).toBeDefined();
  });
});

describe("generateWebsiteJsonLd", () => {
  it("generates valid WebSite schema", () => {
    const result = generateWebsiteJsonLd();

    expect(result["@type"]).toBe("WebSite");
    expect(result.name).toBe("Amsirar Trip");
    expect(result.potentialAction!["@type"]).toBe("SearchAction");
    expect(result.inLanguage).toContain("en");
  });
});

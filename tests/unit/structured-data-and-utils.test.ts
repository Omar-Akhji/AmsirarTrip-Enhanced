import assert from "node:assert/strict";
import { describe, it } from "node:test";
import agencyProfile from "@/data/agency-profile.json";
import {
  generateBreadcrumbJsonLd,
  generateExcursionJsonLd,
  generateFaqJsonLd,
  generateOrganizationJsonLd,
  generateTourJsonLd,
} from "@/lib/structured-data";
import { cn, splitTitleAccent } from "@/lib/utils";

void describe("structured-data builders", () => {
  void it("generates sanitized TouristTrip JSON-LD using agency-profile contact info", () => {
    const tour = generateTourJsonLd({
      name: "3-Day <b>Sahara</b> Tour",
      description: "Desert route javascript:alert(1)",
      provider: "Amsirar Trip",
      image: "/images/Tours/Tour1.webp",
      price: 295,
      currency: "EUR",
      duration: "P3D",
      location: { start: "Marrakech", end: "Marrakech" },
      url: "/tours/merzouga-desert-adventure-3-days",
    });

    assert.equal(tour["@type"], "TouristTrip");
    assert.equal(tour["name"], "3-Day Sahara Tour");
    assert.equal(tour["description"], "Desert route alert(1)");
    assert.equal(tour["image"], "https://amsirartrip.com/images/Tours/Tour1.webp");

    const provider = tour["provider"] as {
      readonly contactPoint?: { readonly telephone?: string };
    };
    assert.equal(provider.contactPoint?.telephone, agencyProfile.contact.mobile);

    const excursion = generateExcursionJsonLd({
      name: "Ouzoud Day Trip",
      description: "Waterfalls excursion",
      provider: "Amsirar Trip",
      image: "/images/Excursions/Ouzoud_Waterfalls.webp",
      duration: "PT10H",
      location: { point: "Ouzoud Waterfalls" },
      url: "/excursions/ouzoud-waterfalls-day-trip",
    });
    assert.equal(excursion["@type"], "TouristTrip");
  });

  void it("generates Organization, BreadcrumbList, and FAQPage JSON-LD cleanly", () => {
    const org = generateOrganizationJsonLd();
    assert.equal(org["legalName"], agencyProfile.legalName);
    assert.equal(org["telephone"], agencyProfile.contact.mobile);

    const crumbs = generateBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Tours", url: "/tours" },
    ]);
    assert.equal(crumbs["@type"], "BreadcrumbList");

    const faq = generateFaqJsonLd([
      {
        question: "Is pickup included?",
        answer: "Yes, hotel pickup <script>bad</script> included.",
      },
    ]);
    const entities = faq["mainEntity"] as { readonly acceptedAnswer: { readonly text: string } }[];
    assert.equal(entities[0]?.acceptedAnswer.text, "Yes, hotel pickup bad included.");
  });
});

void describe("utils", () => {
  void it("joins conditional class strings with cn", () => {
    assert.equal(cn("flex", false, null, undefined, "gap-2"), "flex gap-2");
  });

  void it("splits headings cleanly with splitTitleAccent", () => {
    assert.deepEqual(splitTitleAccent(""), { main: "", accent: "" });
    assert.deepEqual(splitTitleAccent("About"), { main: "About", accent: "" });
    assert.deepEqual(splitTitleAccent("Guest Reviews"), { main: "Guest", accent: "Reviews" });
    assert.deepEqual(splitTitleAccent("What Our Guests Say"), {
      main: "What Our",
      accent: "Guests Say",
    });
  });
});

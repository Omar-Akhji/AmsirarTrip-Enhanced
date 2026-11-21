import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { getExcursionRouteMap, getTourRouteMap } from "@/features/maps/data/routes";
import { isTrustedGoogleMapsEmbedUrl } from "@/lib/maps";
import deDict from "@/locales/de/common.json";
import enDict from "@/locales/en/common.json";
import esDict from "@/locales/es/common.json";
import frDict from "@/locales/fr/common.json";

const NON_DEFAULT_LOCALES = ["fr", "de", "es"] as const;
type NonDefaultLocale = (typeof NON_DEFAULT_LOCALES)[number];

interface LocalizedSeoJson {
  readonly faqs: readonly { readonly answer: string; readonly question: string }[];
  readonly highlights: readonly string[];
  readonly imageAlt?: string;
  readonly lead: string;
  readonly metaDescription: string;
  readonly price: { readonly label: string; readonly note: string };
  readonly title: string;
}

interface TourContentJson {
  readonly durationDays: number;
  readonly seo: LocalizedSeoJson;
  readonly tourKey: string;
  readonly translations: Record<NonDefaultLocale, LocalizedSeoJson>;
}

interface ExcursionStageJson {
  readonly description: string;
  readonly location: string;
  readonly time: string;
  readonly title: string;
}

interface ExcursionLocaleJson {
  readonly excludes: readonly string[];
  readonly goodToKnow: readonly string[];
  readonly includes: readonly string[];
  readonly jsonLd: { readonly description: string; readonly name: string };
  readonly location: string;
  readonly metrics: {
    readonly distance: string;
    readonly duration: string;
    readonly elevation: string;
    readonly pickup: string;
  };
  readonly overview: readonly string[];
  readonly program: readonly ExcursionStageJson[];
  readonly seo: LocalizedSeoJson;
}

interface ExcursionContentJson extends ExcursionLocaleJson {
  readonly excursionKey: string;
  readonly translations: Record<NonDefaultLocale, ExcursionLocaleJson>;
}

interface TourDayLocale {
  readonly text: readonly string[];
  readonly title: string;
}

type LocaleRecord = Record<string, unknown>;

const LOCALE_DICTS: Record<NonDefaultLocale, LocaleRecord> = { fr: frDict, de: deDict, es: esDict };

const EN_RECORD: LocaleRecord = enDict;

function getTourBlock(dict: LocaleRecord, tourKey: string): Record<string, unknown> {
  const block = dict[tourKey];
  assert.ok(block && typeof block === "object" && !Array.isArray(block), `Missing ${tourKey}`);
  return block as Record<string, unknown>;
}

void describe("tours & excursions common.json translations", () => {
  void it("translates tour1-tour9 across fr, de, es with preserved route arrows and line counts", () => {
    for (let i = 1; i <= 9; i++) {
      const tourKey = `tour${i}`;
      const enTour = getTourBlock(EN_RECORD, tourKey);

      for (const locale of NON_DEFAULT_LOCALES) {
        const locTour = getTourBlock(LOCALE_DICTS[locale], tourKey);

        assert.notEqual(
          locTour["title"],
          enTour["title"],
          `${locale}.${tourKey}.title untranslated`,
        );
        assert.notEqual(
          locTour["overview"],
          enTour["overview"],
          `${locale}.${tourKey}.overview untranslated`,
        );

        for (const field of ["includes", "excludes", "goodToKnow"] as const) {
          const enVal = enTour[field];
          const locVal = locTour[field];
          assert.equal(typeof enVal, "string");
          assert.equal(typeof locVal, "string");
          assert.notEqual(locVal, enVal, `${locale}.${tourKey}.${field} untranslated`);
          assert.equal(
            (locVal as string).split("\n").length,
            (enVal as string).split("\n").length,
            `${locale}.${tourKey}.${field} line count mismatch`,
          );
        }

        const dayKeys = Object.keys(enTour).filter((k) => /^day\d+$/.test(k));
        for (const dayKey of dayKeys) {
          const enDay = enTour[dayKey] as TourDayLocale;
          const locDay = locTour[dayKey] as TourDayLocale;
          assert.ok(locDay, `Missing ${locale}.${tourKey}.${dayKey}`);

          if (enDay.title.includes("➜")) {
            assert.equal(
              locDay.title.includes("➜"),
              true,
              `${locale}.${tourKey}.${dayKey}.title missing ➜ separator`,
            );
          }

          if (/Valley|Desert|Gorges|Forest|Arrival|Departure|Tour|Free|Day/i.test(enDay.title)) {
            assert.notEqual(
              locDay.title,
              enDay.title,
              `${locale}.${tourKey}.${dayKey}.title untranslated`,
            );
          }

          assert.equal(
            locDay.text.length,
            enDay.text.length,
            `${locale}.${tourKey}.${dayKey}.text length mismatch`,
          );
          assert.notDeepEqual(
            locDay.text,
            enDay.text,
            `${locale}.${tourKey}.${dayKey}.text untranslated`,
          );
        }
      }
    }
  });

  void it("fixes specific translation regressions, typos, and parity bugs", () => {
    for (const locale of NON_DEFAULT_LOCALES) {
      const desc = LOCALE_DICTS[locale]["tours"] as {
        readonly tour3: { readonly description: string };
      };
      assert.match(
        desc.tour3.description,
        /F[eè]s|Fez/i,
        `${locale}.tours.tour3.description must mention Fes`,
      );
      assert.match(
        desc.tour3.description,
        /Erg Chebbi/i,
        `${locale}.tours.tour3.description must mention Erg Chebbi`,
      );
      assert.doesNotMatch(
        desc.tour3.description,
        /medina de Marrakech|médina de Marrakech|Medina von Marrakesch/i,
      );

      assert.notEqual(
        (LOCALE_DICTS[locale]["booking"] as { readonly checkBadge: string }).checkBadge,
        enDict.booking.checkBadge,
      );

      for (let i = 1; i <= 6; i++) {
        const excKey = `excursion${i}`;
        const highlights = (LOCALE_DICTS[locale][excKey] as { readonly highlights: string[] })
          .highlights;
        assert.equal(highlights.length, 6, `${locale}.${excKey}.highlights should have 6 items`);
      }
    }

    assert.equal(enDict.excursion.sidebar.subBrand, "Tourist Transport");
    assert.equal(deDict.tours.priceNote.includes("lizensierte"), false);
    assert.equal(deDict.tours.tour1.description.includes("Wüstenbivak"), false);
    assert.equal(deDict.excursion5.overview.includes("rauhe"), false);
  });
});

void describe("content collection JSON translations", () => {
  void it("provides localized fr/de/es SEO fields on all 9 tour JSON files", () => {
    const toursDir = path.join(process.cwd(), "src", "content", "tours");
    const files = readdirSync(toursDir).filter((f) => f.endsWith(".json"));
    assert.equal(files.length, 9);

    for (const file of files) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- bounded test fixture directory
      const data = JSON.parse(readFileSync(path.join(toursDir, file), "utf8")) as TourContentJson;
      for (const locale of NON_DEFAULT_LOCALES) {
        const tr = data.translations[locale];
        assert.notEqual(tr.title, data.seo.title, `${file} ${locale}.title untranslated`);
        assert.notEqual(tr.lead, data.seo.lead, `${file} ${locale}.lead untranslated`);
        assert.notEqual(
          tr.price.label,
          data.seo.price.label,
          `${file} ${locale}.price.label untranslated`,
        );
        assert.equal(
          tr.highlights.length,
          data.seo.highlights.length,
          `${file} ${locale}.highlights count mismatch`,
        );
        assert.equal(tr.faqs.length, data.seo.faqs.length, `${file} ${locale}.faqs count mismatch`);
        assert.notDeepEqual(tr.highlights, data.seo.highlights);
        assert.notDeepEqual(tr.faqs, data.seo.faqs);
      }
    }
  });

  void it("provides full localized fr/de/es content on all 6 excursion JSON files", () => {
    const excDir = path.join(process.cwd(), "src", "content", "excursions");
    const files = readdirSync(excDir).filter((f) => f.endsWith(".json"));
    assert.equal(files.length, 6);

    for (const file of files) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- bounded test fixture directory
      const raw = readFileSync(path.join(excDir, file), "utf8");
      const data = JSON.parse(raw) as ExcursionContentJson;
      for (const locale of NON_DEFAULT_LOCALES) {
        const tr = data.translations[locale];
        assert.equal(
          tr.overview.length,
          data.overview.length,
          `${file} ${locale}.overview count mismatch`,
        );
        assert.equal(
          tr.program.length,
          data.program.length,
          `${file} ${locale}.program count mismatch`,
        );
        assert.equal(
          tr.includes.length,
          data.includes.length,
          `${file} ${locale}.includes count mismatch`,
        );
        assert.equal(
          tr.excludes.length,
          data.excludes.length,
          `${file} ${locale}.excludes count mismatch`,
        );
        assert.equal(
          tr.goodToKnow.length,
          data.goodToKnow.length,
          `${file} ${locale}.goodToKnow count mismatch`,
        );
        assert.equal(
          tr.seo.highlights.length,
          data.seo.highlights.length,
          `${file} ${locale}.seo.highlights count mismatch`,
        );
        assert.equal(
          tr.seo.faqs.length,
          data.seo.faqs.length,
          `${file} ${locale}.seo.faqs count mismatch`,
        );
        assert.notDeepEqual(tr.overview, data.overview);
        assert.notDeepEqual(tr.program, data.program);
        assert.notEqual(tr.seo.title, data.seo.title);
        assert.notEqual(tr.jsonLd.name, data.jsonLd.name);
      }
    }
  });
});

void describe("localized route maps", () => {
  void it("returns localized tour & excursion route maps while preserving trusted embed URLs", () => {
    for (const locale of NON_DEFAULT_LOCALES) {
      for (let i = 1; i <= 9; i++) {
        const enMap = getTourRouteMap(`tour${i}`, "Marrakech", "Marrakech", "Title", "en");
        const locMap = getTourRouteMap(`tour${i}`, "Marrakech", "Marrakech", "Title", locale);
        assert.ok(enMap && locMap);
        assert.equal(locMap.waypoints.length, enMap.waypoints.length);
        assert.equal(isTrustedGoogleMapsEmbedUrl(locMap.googleMapsEmbedUrl), true);
        assert.equal(locMap.title.endsWith("- Route Map"), false);
        assert.ok(enMap.distance);
        if (/round-trip|grand loop|expedition|,/i.test(enMap.distance)) {
          assert.notEqual(locMap.distance, enMap.distance);
        }
        assert.notDeepEqual(
          locMap.waypoints.map((wp) => wp.description),
          enMap.waypoints.map((wp) => wp.description),
        );
        for (const wp of locMap.waypoints) {
          assert.equal(wp.dayOrTime?.startsWith("Day "), false);
        }
      }

      for (let i = 1; i <= 6; i++) {
        const enMap = getExcursionRouteMap(`excursion${i}`, "Morocco", "Title", "en");
        const locMap = getExcursionRouteMap(`excursion${i}`, "Morocco", "Title", locale);
        assert.ok(enMap && locMap);
        assert.equal(locMap.waypoints.length, enMap.waypoints.length);
        assert.equal(isTrustedGoogleMapsEmbedUrl(locMap.googleMapsEmbedUrl), true);
        assert.equal(locMap.title.endsWith("- Route Map"), false);
        assert.notEqual(locMap.distance, enMap.distance);
        assert.notDeepEqual(
          locMap.waypoints.map((wp) => wp.description),
          enMap.waypoints.map((wp) => wp.description),
        );
        for (const wp of locMap.waypoints) {
          assert.equal(/\b(?:AM|PM)\b/.test(wp.dayOrTime ?? ""), false);
        }
      }
    }
  });
});

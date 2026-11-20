import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { useTranslations } from "@/i18n/utils";
import {
  getBookingSchema,
  getContactSchema,
  getNewsletterSchema,
  type ValidationTranslator,
} from "@/lib/schemas";

function getTranslator(locale = "en"): ValidationTranslator {
  const t = useTranslations(locale);
  return (key) => t(key);
}

void describe("Form Zod schemas", () => {
  void it("validates a valid booking payload across boundaries", () => {
    const schema = getBookingSchema(getTranslator("en"));
    const parsed = schema.safeParse({
      reservationType: "Merzouga Desert 3 Days",
      fullName: "  Amine Benali  ",
      email: "amine@example.com",
      phone: "+212 6 61 17 23 93",
      persons: "4",
      date: "2028-06-15",
      message: " ".repeat(3),
      language: "fr",
      duration: "3",
      recaptchaToken: "token-ok",
    });

    assert.equal(parsed.success, true);
    assert.equal(parsed.data.fullName, "Amine Benali");
    assert.equal(parsed.data.persons, 4);
    assert.equal(parsed.data.message, undefined);
    assert.equal(parsed.data.language, "fr");
  });

  void it("rejects whitespace-only fields, past dates, invalid phone, and out-of-range persons", () => {
    const schema = getBookingSchema(getTranslator("en"));
    const parsed = schema.safeParse({
      reservationType: " ".repeat(3),
      fullName: " ".repeat(3),
      email: "not-an-email",
      phone: "123",
      persons: 0,
      date: "2020-01-01",
      recaptchaToken: "  ",
    });

    assert.equal(parsed.success, false);
    const fields = new Set(parsed.error.issues.map((issue) => issue.path[0]));
    assert.equal(fields.has("reservationType"), true);
    assert.equal(fields.has("fullName"), true);
    assert.equal(fields.has("email"), true);
    assert.equal(fields.has("phone"), true);
    assert.equal(fields.has("persons"), true);
    assert.equal(fields.has("date"), true);
    assert.equal(fields.has("recaptchaToken"), true);
  });

  void it("enforces contact message length bounds and returns localized validation errors", () => {
    const frT = useTranslations("fr");
    const frSchema = getContactSchema(getTranslator("fr"));
    const parsed = frSchema.safeParse({
      name: "Samira",
      email: "samira@example.com",
      phone: "+33 6 12 34 56 78",
      message: "short",
      recaptchaToken: "token-ok",
    });

    assert.equal(parsed.success, false);
    assert.equal(parsed.error.issues[0]?.message, frT("validations.messageMin"));
  });

  void it("validates newsletter payloads and trims inputs", () => {
    const schema = getNewsletterSchema(getTranslator("en"));
    const valid = schema.safeParse({
      name: "  Nadia  ",
      email: "nadia@example.com",
      recaptchaToken: "token-ok",
    });
    assert.equal(valid.success, true);
    assert.equal(valid.data.name, "Nadia");

    const missingToken = schema.safeParse({
      name: "Nadia",
      email: "nadia@example.com",
      recaptchaToken: "",
    });
    assert.equal(missingToken.success, false);
  });
});

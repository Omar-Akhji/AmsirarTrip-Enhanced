import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildBookingEmail,
  buildContactEmail,
  buildNewsletterEmail,
} from "@/actions/helpers/email-templates";
import { escapeHtml, getLanguageName, sanitizeHeaderValue } from "@/actions/helpers/form-helpers";

void describe("form-helpers", () => {
  void it("resolves known locale names and safely ignores prototype property lookups", () => {
    assert.equal(getLanguageName("fr"), "Français");
    assert.equal(getLanguageName("toString"), "toString");
    assert.equal(getLanguageName("constructor"), "constructor");
    assert.equal(getLanguageName("__proto__"), "__proto__");
  });

  void it("escapes HTML special characters and strips CR/LF header injection vectors", () => {
    assert.equal(
      escapeHtml(`<script>alert("x" & 'y')</script>`),
      "&lt;script&gt;alert(&quot;x&quot; &amp; &#039;y&#039;)&lt;/script&gt;",
    );
    assert.equal(
      sanitizeHeaderValue("User\r\nBcc: attacker@evil.com", 50),
      "User Bcc: attacker@evil.com",
    );
  });
});

void describe("email-templates", () => {
  void it("escapes untrusted inputs and enforces rel=noopener noreferrer in booking emails", () => {
    const prepared = buildBookingEmail({
      reservationType: "Merzouga Tour <img onerror=alert(1)>",
      fullName: "O'Connor <script>alert(1)</script>",
      email: "guest@example.com",
      phone: "+33 6 12 34 56 78",
      persons: 2,
      date: "2027-07-10",
      message: "Line 1\n<script>xss()</script>",
      language: "es",
      duration: 3,
    });

    assert.equal(prepared.replyTo, "guest@example.com");
    assert.equal(prepared.html.includes("<script>"), false);
    assert.equal(prepared.html.includes("&lt;script&gt;xss()&lt;/script&gt;"), true);
    assert.equal(prepared.html.includes('target="_blank" rel="noopener noreferrer"'), true);
    assert.equal(prepared.text.includes("Español"), true);
  });

  void it("builds escaped contact and newsletter emails without header breaks", () => {
    const contact = buildContactEmail({
      name: "Claire\r\nHeader",
      email: "claire@example.com",
      phone: "+44 7700 900077",
      topic: "Custom Route",
      message: "Looking for a 7-day desert itinerary.",
    });
    assert.doesNotMatch(contact.subject, /[\r\n]/);
    assert.equal(contact.html.includes("Custom Route"), true);
    assert.equal(contact.text.includes("Claire"), true);

    const newsletter = buildNewsletterEmail({ name: "Youssef!", email: "youssef@example.com" });
    assert.equal(newsletter.subject, "Newsletter: Youssef (youssef@example.com)");
    assert.equal(newsletter.text.includes("youssef@example.com"), true);
  });
});

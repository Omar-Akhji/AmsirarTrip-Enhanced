import { expect, test } from "@playwright/test";

test.describe("Booking Form E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a sample tour page
    await page.goto("/tours/grand-moroccan-circuit-10-days");

    // Scroll the booking form into view to trigger Astro's client:visible hydration
    const formSection = page.locator("#booking");
    await formSection.scrollIntoViewIfNeeded();

    // Wait for the form to complete hydration
    const form = formSection.locator('form[data-form="booking"]');
    await expect(form).toHaveAttribute("data-hydrated", "true", { timeout: 15_000 });
  });

  test("should render the booking form elements correctly", async ({ page }) => {
    const formSection = page.locator("#booking");
    await expect(formSection).toBeVisible();

    const heading = page.locator("#booking-heading");
    await expect(heading).toContainText("Request a Reservation");

    // Check inputs scoped to the #booking container
    const fullNameInput = formSection.locator('input[name="fullName"]');
    const emailInput = formSection.locator('input[name="email"]');
    const phoneInput = formSection.locator("input#booking-phone");
    const peopleInput = formSection.locator('input[name="numberOfPeople"]');
    const dateTrigger = formSection.locator("button#reservationDate-trigger");
    const messageTextarea = formSection.locator('textarea[name="message"]');

    await expect(fullNameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(phoneInput).toBeVisible();
    await expect(peopleInput).toBeVisible();
    await expect(dateTrigger).toBeVisible();
    await expect(messageTextarea).toBeVisible();
  });

  test("should show validation error when submitting without reCAPTCHA", async ({ page }) => {
    const formSection = page.locator("#booking");

    // Fill out the required personal fields scoped to the #booking container
    await formSection.locator('input[name="fullName"]').fill("Test User");
    await formSection.locator('input[name="email"]').fill("test@example.com");
    await formSection.locator("input#booking-phone").fill("661172393");
    await formSection.locator('input[name="numberOfPeople"]').fill("2");
    await formSection.locator("button#reservationDate-trigger").click();
    const enabledDayBtn = formSection
      .locator("[role='dialog'] button[aria-pressed]:not([disabled])")
      .first();
    await enabledDayBtn.click();
    await expect(formSection.locator('input[name="reservationDate"]')).not.toHaveValue("");
    await formSection.locator("button[data-calendar-today]").click();
    await formSection
      .locator('textarea[name="message"]')
      .fill("This is an automated test message for booking.");

    // Submit the form
    await formSection.locator('button[type="submit"]').click();

    // reCAPTCHA is required, so it should display a captcha validation error
    const submitStatus = formSection.locator('button[type="submit"] [aria-live="polite"]');
    await expect(submitStatus).toBeVisible();
    await expect(submitStatus).toContainText(/recaptcha/i);
  });
});

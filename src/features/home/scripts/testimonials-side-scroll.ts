import { setupSideScroll } from "./side-scroll-engine";

class TestimonialsSideScrollElement extends HTMLElement {
  private cleanup: (() => void) | null = null;

  connectedCallback(): void {
    this.cleanup = setupSideScroll(this, "testimonials-side");
  }

  disconnectedCallback(): void {
    this.cleanup?.();
    this.cleanup = null;
  }
}

if (!customElements.get("testimonials-side-scroll")) {
  customElements.define("testimonials-side-scroll", TestimonialsSideScrollElement);
}

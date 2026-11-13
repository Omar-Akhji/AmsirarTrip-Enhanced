import { setupSideScroll } from "./side-scroll-engine";

class ServicesSideScrollElement extends HTMLElement {
  private cleanup: (() => void) | null = null;

  connectedCallback(): void {
    this.cleanup = setupSideScroll(this, "services-side");
  }

  disconnectedCallback(): void {
    this.cleanup?.();
    this.cleanup = null;
  }
}

if (!customElements.get("services-side-scroll")) {
  customElements.define("services-side-scroll", ServicesSideScrollElement);
}

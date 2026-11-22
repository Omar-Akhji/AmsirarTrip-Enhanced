class VideoShowcaseElement extends HTMLElement {
  private controller: AbortController | null = null;
  private observer: IntersectionObserver | null = null;

  connectedCallback(): void {
    const video = this.querySelector("video");
    const button = this.querySelector<HTMLButtonElement>("[data-video-toggle]");
    if (!video || !button) return;

    this.dataset["js"] = "ready";
    video.controls = false;
    this.observer?.disconnect();
    this.controller?.abort();
    this.controller = new AbortController();
    const { signal } = this.controller;

    const setState = (state: "idle" | "buffering" | "playing" | "error") => {
      this.dataset["state"] = state;
      const label =
        state === "playing" ? button.dataset["labelPause"] : button.dataset["labelPlay"];
      if (label) button.setAttribute("aria-label", label);
    };

    video.addEventListener(
      "error",
      () => {
        setState("error");
      },
      { signal },
    );
    video.addEventListener(
      "ended",
      () => {
        setState("idle");
      },
      { signal },
    );
    video.addEventListener(
      "waiting",
      () => {
        if (!video.paused) setState("buffering");
      },
      { signal },
    );
    video.addEventListener(
      "playing",
      () => {
        setState("playing");
      },
      { signal },
    );
    video.addEventListener(
      "pause",
      () => {
        if (this.dataset["state"] !== "error") setState("idle");
      },
      { signal },
    );

    button.addEventListener(
      "click",
      () => {
        if (video.paused) {
          setState("buffering");
          void video
            .play()
            .then(() => {
              setState("playing");
            })
            .catch((error: unknown) => {
              if (error instanceof DOMException && error.name === "AbortError") {
                if (this.dataset["state"] === "buffering") setState("idle");
                return;
              }
              setState("error");
            });
        } else {
          video.pause();
        }
      },
      { signal },
    );

    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => !entry.isIntersecting) && !video.paused) {
          video.pause();
        }
      },
      { threshold: 0.1 },
    );
    this.observer.observe(this);
  }

  disconnectedCallback(): void {
    this.controller?.abort();
    this.controller = null;
    this.observer?.disconnect();
    this.observer = null;
  }
}

if (typeof customElements !== "undefined" && !customElements.get("video-showcase")) {
  customElements.define("video-showcase", VideoShowcaseElement);
}

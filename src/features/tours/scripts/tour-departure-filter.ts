function setupDepartureFilter(): void {
  const buttons = document.querySelectorAll<HTMLButtonElement>(".hub-filter-btn");
  const items = document.querySelectorAll<HTMLElement>(".tour-card-item");

  if (buttons.length === 0 || items.length === 0) return;

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const selectedCity = btn.dataset["city"] ?? "all";

      buttons.forEach((b) => {
        const isActive = b === btn;
        b.dataset["active"] = isActive ? "true" : "false";
        b.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      items.forEach((item) => {
        const departure = item.dataset["departure"] ?? "";
        const isMatch = selectedCity === "all" || departure === selectedCity;
        item.classList.toggle("hidden", !isMatch);
      });
    });
  });
}

setupDepartureFilter();
document.addEventListener("astro:page-load", setupDepartureFilter);

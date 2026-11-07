function setupDepartureFilter(): void {
  const buttons = document.querySelectorAll<HTMLButtonElement>(".hub-filter-btn");
  const items = document.querySelectorAll<HTMLElement>(".tour-card-item");

  if (buttons.length === 0 || items.length === 0) return;

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const selectedCity = btn.dataset["city"] ?? "all";

      buttons.forEach((b) => {
        if (b === btn) {
          b.classList.remove("bg-stone-100", "text-stone-700", "hover:bg-stone-200");
          b.classList.add("bg-stone-900", "text-white");
        } else {
          b.classList.remove("bg-stone-900", "text-white");
          b.classList.add("bg-stone-100", "text-stone-700", "hover:bg-stone-200");
        }
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

document.addEventListener("DOMContentLoaded", function () {
  // Thumbnail gallery swap
  const mainImage = document.querySelector(".main-image img");
  document.querySelectorAll(".thumb-row img").forEach((thumb) => {
    thumb.addEventListener("click", () => {
      document.querySelectorAll(".thumb-row img").forEach((t) => t.classList.remove("active"));
      thumb.classList.add("active");
      if (mainImage) mainImage.src = thumb.src;
    });
  });

  // Product tab switching
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      const panel = document.getElementById("tab-" + btn.dataset.tab);
      if (panel) panel.classList.add("active");
    });
  });
});

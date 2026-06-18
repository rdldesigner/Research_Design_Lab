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

  // ===== Image Zoom Lightbox =====
  const mainImageEl = document.querySelector(".main-image img");
  if (!mainImageEl) return;

  // Build lightbox DOM
  const overlay = document.createElement("div");
  overlay.className = "img-lightbox";
  overlay.innerHTML = `
    <div class="img-lightbox-inner">
      <button class="lightbox-close" aria-label="Close">&times;</button>
      <div class="lightbox-zoom-btns">
        <button class="lbz-btn" id="lbz-in" aria-label="Zoom in">+</button>
        <button class="lbz-btn" id="lbz-out" aria-label="Zoom out">&minus;</button>
        <button class="lbz-btn" id="lbz-reset" aria-label="Reset zoom" title="Reset">&#8635;</button>
      </div>
      <div class="lightbox-img-wrap">
        <img class="lightbox-img" src="" alt="" draggable="false" />
      </div>
    </div>`;
  document.body.appendChild(overlay);

  const lbImg = overlay.querySelector(".lightbox-img");
  const imgWrap = overlay.querySelector(".lightbox-img-wrap");

  let scale = 1, minScale = 1, maxScale = 4;
  let originX = 0, originY = 0;
  let isDragging = false, dragStartX = 0, dragStartY = 0, lastTX = 0, lastTY = 0;

  function applyTransform() {
    lbImg.style.transform = `translate(${originX}px, ${originY}px) scale(${scale})`;
  }

  function clampOrigin() {
    const iw = lbImg.naturalWidth * scale;
    const ih = lbImg.naturalHeight * scale;
    const ww = imgWrap.clientWidth;
    const wh = imgWrap.clientHeight;
    const maxX = Math.max(0, (iw - ww) / 2);
    const maxY = Math.max(0, (ih - wh) / 2);
    originX = Math.min(maxX, Math.max(-maxX, originX));
    originY = Math.min(maxY, Math.max(-maxY, originY));
  }

  function resetZoom() {
    scale = 1; originX = 0; originY = 0;
    applyTransform();
    lbImg.style.cursor = "default";
  }

  function openLightbox(src, alt) {
    lbImg.src = src;
    lbImg.alt = alt;
    resetZoom();
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  // Open on main image click
  mainImageEl.style.cursor = "zoom-in";
  mainImageEl.addEventListener("click", () => openLightbox(mainImageEl.src, mainImageEl.alt));

  // Close button
  overlay.querySelector(".lightbox-close").addEventListener("click", closeLightbox);

  // Click outside image inner box to close
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeLightbox();
  });

  // ESC key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });

  // Zoom buttons
  document.getElementById("lbz-in").addEventListener("click", () => {
    scale = Math.min(maxScale, scale + 0.5);
    clampOrigin(); applyTransform();
    lbImg.style.cursor = scale > 1 ? "grab" : "default";
  });
  document.getElementById("lbz-out").addEventListener("click", () => {
    scale = Math.max(minScale, scale - 0.5);
    if (scale === 1) { originX = 0; originY = 0; }
    clampOrigin(); applyTransform();
    lbImg.style.cursor = scale > 1 ? "grab" : "default";
  });
  document.getElementById("lbz-reset").addEventListener("click", resetZoom);

  // Mouse wheel zoom
  imgWrap.addEventListener("wheel", (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.25 : -0.25;
    scale = Math.min(maxScale, Math.max(minScale, scale + delta));
    if (scale === 1) { originX = 0; originY = 0; }
    clampOrigin(); applyTransform();
    lbImg.style.cursor = scale > 1 ? "grab" : "default";
  }, { passive: false });

  // Drag to pan
  imgWrap.addEventListener("mousedown", (e) => {
    if (scale <= 1) return;
    isDragging = true;
    dragStartX = e.clientX - lastTX;
    dragStartY = e.clientY - lastTY;
    lbImg.style.cursor = "grabbing";
    e.preventDefault();
  });
  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    originX = e.clientX - dragStartX;
    originY = e.clientY - dragStartY;
    lastTX = originX; lastTY = originY;
    clampOrigin(); applyTransform();
  });
  window.addEventListener("mouseup", () => {
    if (!isDragging) return;
    isDragging = false;
    lbImg.style.cursor = scale > 1 ? "grab" : "default";
  });

  // Touch pinch zoom
  let lastDist = 0;
  imgWrap.addEventListener("touchstart", (e) => {
    if (e.touches.length === 2) {
      lastDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX,
                            e.touches[0].clientY - e.touches[1].clientY);
    }
  }, { passive: true });
  imgWrap.addEventListener("touchmove", (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX,
                              e.touches[0].clientY - e.touches[1].clientY);
      const ratio = dist / lastDist;
      scale = Math.min(maxScale, Math.max(minScale, scale * ratio));
      lastDist = dist;
      if (scale === 1) { originX = 0; originY = 0; }
      clampOrigin(); applyTransform();
    }
  }, { passive: false });
});

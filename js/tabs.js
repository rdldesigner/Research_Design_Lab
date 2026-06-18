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

  // Collect all gallery images: main + thumbnails (deduplicated by src)
  let galleryImages = [];
  let currentIndex = 0;

  function buildGallery() {
    const seen = new Set();
    galleryImages = [];
    // Always start with the current main image
    const thumbs = document.querySelectorAll(".thumb-row img");
    if (thumbs.length > 0) {
      thumbs.forEach((t) => {
        if (!seen.has(t.src)) { seen.add(t.src); galleryImages.push({ src: t.src, alt: t.alt }); }
      });
    } else {
      galleryImages.push({ src: mainImageEl.src, alt: mainImageEl.alt });
    }
  }

  // Build lightbox DOM
  const overlay = document.createElement("div");
  overlay.className = "img-lightbox";
  overlay.innerHTML = `
    <div class="img-lightbox-inner">
      <button class="lightbox-close" aria-label="Close">&times;</button>
      <button class="lightbox-nav lightbox-prev" aria-label="Previous image">&#8249;</button>
      <button class="lightbox-nav lightbox-next" aria-label="Next image">&#8250;</button>
      <div class="lightbox-counter"></div>
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
  const prevBtn = overlay.querySelector(".lightbox-prev");
  const nextBtn = overlay.querySelector(".lightbox-next");
  const counter = overlay.querySelector(".lightbox-counter");

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
    lastTX = 0; lastTY = 0;
    applyTransform();
    lbImg.style.cursor = "default";
  }

  function updateNavVisibility() {
    prevBtn.style.display = galleryImages.length > 1 ? "flex" : "none";
    nextBtn.style.display = galleryImages.length > 1 ? "flex" : "none";
    counter.style.display = galleryImages.length > 1 ? "block" : "none";
    counter.textContent = galleryImages.length > 1 ? `${currentIndex + 1} / ${galleryImages.length}` : "";
  }

  function showImage(index) {
    currentIndex = (index + galleryImages.length) % galleryImages.length;
    const { src, alt } = galleryImages[currentIndex];
    lbImg.src = src;
    lbImg.alt = alt;
    resetZoom();
    updateNavVisibility();
  }

  function openLightbox(index) {
    buildGallery();
    showImage(index);
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  // Open on main image click — find index matching current src
  mainImageEl.style.cursor = "zoom-in";
  mainImageEl.addEventListener("click", () => {
    buildGallery();
    const idx = galleryImages.findIndex((g) => g.src === mainImageEl.src);
    openLightbox(idx >= 0 ? idx : 0);
  });

  // Prev / Next buttons
  prevBtn.addEventListener("click", (e) => { e.stopPropagation(); showImage(currentIndex - 1); });
  nextBtn.addEventListener("click", (e) => { e.stopPropagation(); showImage(currentIndex + 1); });

  // Close button
  overlay.querySelector(".lightbox-close").addEventListener("click", closeLightbox);

  // Click outside image inner box to close
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (!overlay.classList.contains("active")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showImage(currentIndex - 1);
    if (e.key === "ArrowRight") showImage(currentIndex + 1);
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

  // Touch pinch zoom + swipe navigation
  let lastDist = 0;
  let touchStartX = 0;
  imgWrap.addEventListener("touchstart", (e) => {
    if (e.touches.length === 2) {
      lastDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX,
                            e.touches[0].clientY - e.touches[1].clientY);
    } else if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
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
  imgWrap.addEventListener("touchend", (e) => {
    if (scale > 1) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) {
      dx < 0 ? showImage(currentIndex + 1) : showImage(currentIndex - 1);
    }
  }, { passive: true });
});

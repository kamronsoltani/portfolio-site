/**
 * Cloudinary media URLs for portfolio images.
 * Images load from res.cloudinary.com — not from GitHub-hosted assets/.
 */
(function () {
  const CONFIG = {
    cloudName: "ybzqvvbv",
    baseFolder: "portfolio",
    widths: {
      thumb: 320,
      card: 560,
      gallery: 720,
      film: 900,
      hero: 1200,
      lightbox: 2200,
    },
    /** Per-role Cloudinary quality. Film uses good (not eco) so scans stay sharp. */
    qualities: {
      thumb: "auto:eco",
      card: "auto",
      gallery: "auto:good",
      film: "auto:good",
      hero: "auto:good",
      lightbox: "auto:best",
    },
    /** Responsive candidates for film masonry tiles (CSS px ≈ column width). */
    filmSrcset: [560, 800, 1100, 1400, 1800],
    filmSizes: "(max-width: 779px) 47vw, 31vw",
  };

  const LAZY_ROOT_MARGIN = "420px 0px";
  let lazyObserver = null;

  function enabled() {
    return Boolean(CONFIG.cloudName && CONFIG.cloudName.trim());
  }

  function normalizeLocalPath(localPath) {
    if (!localPath || typeof localPath !== "string") return "";
    let path = localPath.trim();
    try {
      path = decodeURIComponent(path);
    } catch (_) {
      /* keep as-is */
    }
    path = path.replace(/^\//, "").split("?")[0].split("#")[0];
    return path;
  }

  function encodeLocalPath(localPath) {
    return normalizeLocalPath(localPath)
      .split("/")
      .map((seg) => encodeURIComponent(seg))
      .join("/");
  }

  function publicId(localPath) {
    const normalized = normalizeLocalPath(localPath);
    if (!normalized) return "";
    const withBase = normalized.startsWith(`${CONFIG.baseFolder}/`)
      ? normalized
      : `${CONFIG.baseFolder}/${normalized}`;
    return withBase
      .replace(/\.(jpe?g|png|gif|webp|avif)$/i, "")
      .split("/")
      .map((seg) => seg.trim())
      .filter(Boolean)
      .join("/");
  }

  function roleQuality(role) {
    return CONFIG.qualities[role] || "auto";
  }

  function url(localPath, opts = {}) {
    const normalized = normalizeLocalPath(localPath);
    if (!normalized) return "";

    if (!enabled()) {
      return encodeLocalPath(normalized);
    }

    const width = opts.width;
    const quality = opts.quality || "auto";
    const transforms = ["f_auto", `q_${quality}`];
    if (width) transforms.push(`w_${width}`, "c_limit");

    const id = publicId(normalized)
      .split("/")
      .map((seg) => encodeURIComponent(seg))
      .join("/");

    return `https://res.cloudinary.com/${CONFIG.cloudName}/image/upload/${transforms.join(",")}/${id}`;
  }

  function full(localPath) {
    return url(localPath, {
      width: CONFIG.widths.lightbox,
      quality: roleQuality("lightbox"),
    });
  }

  function thumbUrl(localPath, width, quality) {
    return url(localPath, {
      width: width || CONFIG.widths.thumb,
      quality: quality || roleQuality("thumb"),
    });
  }

  function roleWidth(role) {
    return CONFIG.widths[role] || CONFIG.widths.gallery;
  }

  function inferRole(img) {
    if (!img?.closest) return "gallery";
    if (img.closest(".film-page .film-grid, .film-grid--masonry, .film-gallery-tile")) {
      return "film";
    }
    if (img.closest(".gallery-item, .preview-track")) return "thumb";
    if (img.closest(".card-image, .resume-event-photo, .film-archive-grid")) return "card";
    if (img.closest(".project-gallery-tile, .project-gallery-grid")) return "gallery";
    if (img.closest(".project-hero-main, .hero-hobby-fill")) return "hero";
    return "gallery";
  }

  function shouldLoadEager(img, role) {
    if (img?.dataset?.mediaEager === "1") return true;
    if (role === "hero") return true;
    try {
      const rect = img.getBoundingClientRect();
      return rect.top < window.innerHeight + 80 && rect.bottom > -80;
    } catch {
      return role === "hero";
    }
  }

  function applyFilmSrcset(img, normalized, quality) {
    const widths = CONFIG.filmSrcset || [];
    if (!widths.length) return;
    img.srcset = widths
      .map((w) => `${url(normalized, { width: w, quality })} ${w}w`)
      .join(", ");
    img.sizes = CONFIG.filmSizes || "25vw";
  }

  function getLazyObserver() {
    if (lazyObserver) return lazyObserver;
    if (!("IntersectionObserver" in window)) return null;

    lazyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const img = entry.target;
          const pending = img.dataset.mediaPending;
          if (!pending) return;
          beginImageReveal(img);
          img.src = pending;
          if (img.dataset.mediaPendingSrcset) {
            img.srcset = img.dataset.mediaPendingSrcset;
            delete img.dataset.mediaPendingSrcset;
          }
          if (img.dataset.mediaPendingSizes) {
            img.sizes = img.dataset.mediaPendingSizes;
            delete img.dataset.mediaPendingSizes;
          }
          delete img.dataset.mediaPending;
          lazyObserver.unobserve(img);
        });
      },
      { rootMargin: LAZY_ROOT_MARGIN, threshold: 0.01 }
    );
    return lazyObserver;
  }

  function mediaShell(img) {
    return (
      img.closest(
        ".film-gallery-tile, .card-image, .gallery-item, .project-gallery-frame, .project-hero-main, .resume-event-photo-frame"
      ) || img.parentElement
    );
  }

  function beginImageReveal(img) {
    if (!img || img.dataset.mediaRevealBound === "1") return;
    img.dataset.mediaRevealBound = "1";
    img.classList.add("media-reveal", "media-pending");
    const shell = mediaShell(img);
    shell?.classList.add("media-shell-loading");

    const finish = () => {
      img.classList.remove("media-pending");
      img.classList.add("is-revealed");
      shell?.classList.remove("media-shell-loading");
      img.dataset.mediaLoaded = "1";
    };

    if (img.complete && img.naturalWidth > 0) {
      finish();
      return;
    }

    img.addEventListener("load", finish, { once: true });
    img.addEventListener(
      "error",
      () => {
        img.classList.remove("media-pending");
        shell?.classList.remove("media-shell-loading");
      },
      { once: true }
    );
  }

  /**
   * Apply Cloudinary thumb + full-size lightbox URL to an <img>.
   * Below-fold images defer network fetch until near viewport.
   * Film tiles get responsive srcset for sharp retina without over-fetching.
   */
  function setImgMedia(img, localPath, opts = {}) {
    if (!img || !localPath) return;

    const role = opts.role || inferRole(img);
    const width = opts.width || roleWidth(role);
    const quality = opts.quality || roleQuality(role);
    const normalized = normalizeLocalPath(localPath);
    const thumb = thumbUrl(normalized, width, quality);
    const fullSrc = full(normalized);
    const isFilm = role === "film";

    img.dataset.mediaPath = normalized;
    img.setAttribute("data-full-src", fullSrc);
    img.loading = opts.eager ? "eager" : "lazy";
    img.decoding = "async";
    if (opts.eager) img.setAttribute("fetchpriority", "high");
    else img.setAttribute("fetchpriority", "low");

    if (!enabled()) {
      beginImageReveal(img);
      img.src = encodeLocalPath(normalized);
      return;
    }

    if (opts.eager || shouldLoadEager(img, role)) {
      beginImageReveal(img);
      img.src = thumb;
      if (isFilm) applyFilmSrcset(img, normalized, quality);
      return;
    }

    const observer = getLazyObserver();
    if (!observer) {
      beginImageReveal(img);
      img.src = thumb;
      if (isFilm) applyFilmSrcset(img, normalized, quality);
      return;
    }

    img.dataset.mediaPending = thumb;
    if (isFilm) {
      const widths = CONFIG.filmSrcset || [];
      img.dataset.mediaPendingSrcset = widths
        .map((w) => `${url(normalized, { width: w, quality })} ${w}w`)
        .join(", ");
      img.dataset.mediaPendingSizes = CONFIG.filmSizes || "25vw";
    }
    beginImageReveal(img);
    // Transparent pixel — avoids a wrong-aspect placeholder jump while shimmer shows.
    if (!img.getAttribute("src") || img.src.startsWith("data:")) {
      img.removeAttribute("src");
    }
    img.classList.add("media-pending");
    mediaShell(img)?.classList.add("media-shell-loading");
    observer.observe(img);
  }

  function upgradeStaticImages(root = document) {
    if (!root?.querySelectorAll) return;

    root.querySelectorAll('img[src*="assets/images/"], img[src*="assets/design/"]').forEach((img) => {
      if (img.dataset.mediaUpgraded === "1") return;

      const raw = img.getAttribute("src") || "";
      const localPath = normalizeLocalPath(raw);
      if (!localPath.startsWith("assets/")) return;

      const role = img.dataset.mediaRole || inferRole(img);
      setImgMedia(img, localPath, {
        role,
        width: Number(img.dataset.mediaWidth) || roleWidth(role),
        eager: img.dataset.mediaEager === "1",
      });
      img.dataset.mediaUpgraded = "1";
    });
  }

  window.PORTFOLIO_MEDIA = {
    config: CONFIG,
    enabled,
    url,
    full,
    thumbUrl,
    setImgMedia,
    inferRole,
    upgradeStaticImages,
    normalizeLocalPath,
    encodeLocalPath,
  };

  function boot() {
    upgradeStaticImages();
    document.documentElement.dataset.mediaCdn = enabled() ? "cloudinary" : "local";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

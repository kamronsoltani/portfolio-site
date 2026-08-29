/**
 * Cloudinary media URLs for portfolio images.
 * Images load from res.cloudinary.com — not from GitHub-hosted assets/.
 */
(function () {
  const CONFIG = {
    cloudName: "ybzqvvbv",
    baseFolder: "portfolio",
    widths: {
      thumb: 280,
      card: 480,
      gallery: 640,
      hero: 960,
      lightbox: 1800,
    },
  };

  const LAZY_ROOT_MARGIN = "280px 0px";
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
    return url(localPath, { width: CONFIG.widths.lightbox });
  }

  function thumbUrl(localPath, width) {
    return url(localPath, { width: width || CONFIG.widths.thumb, quality: "auto:eco" });
  }

  function roleWidth(role) {
    return CONFIG.widths[role] || CONFIG.widths.gallery;
  }

  function inferRole(img) {
    if (!img?.closest) return "gallery";
    if (img.closest(".gallery-item, .film-grid, .preview-track")) return "thumb";
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
          img.src = pending;
          delete img.dataset.mediaPending;
          img.dataset.mediaLoaded = "1";
          lazyObserver.unobserve(img);
        });
      },
      { rootMargin: LAZY_ROOT_MARGIN, threshold: 0.01 }
    );
    return lazyObserver;
  }

  /**
   * Apply Cloudinary thumb + full-size lightbox URL to an <img>.
   * Below-fold images defer network fetch until near viewport.
   */
  function setImgMedia(img, localPath, opts = {}) {
    if (!img || !localPath) return;

    const role = opts.role || inferRole(img);
    const width = opts.width || roleWidth(role);
    const normalized = normalizeLocalPath(localPath);
    const thumb = thumbUrl(normalized, width);
    const fullSrc = full(normalized);

    img.dataset.mediaPath = normalized;
    img.setAttribute("data-full-src", fullSrc);
    img.loading = opts.eager ? "eager" : "lazy";
    img.decoding = "async";
    if (opts.eager) img.setAttribute("fetchpriority", "high");
    else img.setAttribute("fetchpriority", "low");

    if (!enabled()) {
      img.src = encodeLocalPath(normalized);
      return;
    }

    if (opts.eager || shouldLoadEager(img, role)) {
      img.src = thumb;
      img.dataset.mediaLoaded = "1";
      return;
    }

    const observer = getLazyObserver();
    if (!observer) {
      img.src = thumb;
      return;
    }

    img.dataset.mediaPending = thumb;
    if (!img.getAttribute("src")) {
      img.src =
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 3'%3E%3C/svg%3E";
    }
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

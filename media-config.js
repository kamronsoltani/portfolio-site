/**
 * Cloudinary media URLs for portfolio images.
 *
 * SETUP (one time):
 * 1. Create a free account at https://cloudinary.com/users/register/free
 * 2. Copy your Cloud name from the dashboard → set `cloudName` below
 * 3. Run: cd scripts && npm install && npm run upload
 * 4. Deploy the site (images load from Cloudinary CDN, not from git)
 *
 * While `cloudName` is empty, the site falls back to local `assets/` paths.
 */
(function () {
  const CONFIG = {
    /** Paste your Cloudinary cloud name here (Dashboard → Product environment credentials). */
    cloudName: "ybzqvvbv",
    /** Must match the folder prefix used by scripts/upload-to-cloudinary.mjs */
    baseFolder: "portfolio",
    widths: {
      thumb: 400,
      card: 600,
      gallery: 800,
      hero: 1200,
      lightbox: 2400,
    },
  };

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

  function inferWidth(img) {
    if (!img || !img.closest) return CONFIG.widths.gallery;
    if (img.closest(".gallery-item, .film-grid, .preview-track, .hero-slideshow-dots")) {
      return CONFIG.widths.thumb;
    }
    if (img.closest(".card-image, .resume-event-photo")) return CONFIG.widths.card;
    if (img.closest(".project-gallery-tile, .project-gallery-grid")) return CONFIG.widths.gallery;
    if (img.closest(".project-hero-main, .hero-slide-media, .hero-hobby-fill")) {
      return CONFIG.widths.hero;
    }
    return CONFIG.widths.gallery;
  }

  function upgradeStaticImages(root = document) {
    if (!enabled() || !root?.querySelectorAll) return;

    root.querySelectorAll('img[src*="assets/images/"], img[src*="assets/design/"]').forEach((img) => {
      if (img.dataset.mediaUpgraded === "1") return;

      const raw = img.getAttribute("src") || "";
      const localPath = normalizeLocalPath(raw);
      if (!localPath.startsWith("assets/")) return;

      const width = Number(img.dataset.mediaWidth) || inferWidth(img);
      const thumb = url(localPath, { width });
      const fullSrc = full(localPath);

      img.setAttribute("data-full-src", fullSrc);
      img.src = thumb;
      img.dataset.mediaUpgraded = "1";
    });
  }

  window.PORTFOLIO_MEDIA = {
    config: CONFIG,
    enabled,
    url,
    full,
    inferWidth,
    upgradeStaticImages,
    normalizeLocalPath,
    encodeLocalPath,
  };

  function boot() {
    upgradeStaticImages();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

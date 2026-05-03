const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".nav-links");
const year = document.getElementById("year");


if (year) {
  year.textContent = new Date().getFullYear();
}

if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const expanded = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!expanded));
    nav.classList.toggle("show");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuButton.setAttribute("aria-expanded", "false");
      nav.classList.remove("show");
    });
  });
}

/**
 * Same URL as each project page’s main hero <img>. Keys match design-engineering card `id`.
 * Add an entry when you add a hero image on that project page.
 */
const PROJECT_HERO_SRC = {
  "project-mangrove-water": "assets/design/Mangrove/main image.png",
  "project-morphing-dress": "assets/design/Formaflow/display/mainphoto.jpeg",
  "project-smart-goniometer": "assets/design/Smart-Goniometer/1.jpeg",
  "project-cal-aerospace-sae": "assets/design/Cal Aero SAE/2025 plane flying.jpeg",
  "project-lmks-v1": "assets/design/LMKS/mainphoto.png",
  "project-me103-sourdough": "assets/design/Sourdough/sourdough main.png",
  "project-esp-flight-tracker": "assets/design/espflighttracker/4.jpg",
  "project-realtime-insole": "assets/design/Insole Monitor/insole 1.png",
  "project-esp-meter": "assets/design/ESP-Meter/ESPMeter1.png",
  "project-me226-fermiq": "assets/design/FermIQ/fermiq1.png",
  "project-me100-intillifresh": "assets/design/ME100 Intilliflishsense/me1001.png",
  "project-me102b-ez-darkroom": "assets/design/102b darkroom/darkroom1.png",
  "project-e29-light-skate": "assets/design/E29/e291.png",
  "project-me235-candy-crawler": "assets/design/ME235 /ME2351.png",
  "project-e26-windmill": "assets/design/e26/e262.png",
};

/** Encode each path segment so spaces (e.g. `Visual Resume`) work in `src`. */
function encodeAssetPath(rel) {
  if (!rel) return "";
  return rel.split("/").map((seg) => encodeURIComponent(seg)).join("/");
}

/**
 * Visual resume expandable photo strips: keyed by `data-photo-set` on `.resume-event-photos`.
 * Engineering: project assets. NTU / Siemens / GLOBE: files under `assets/images/Visual Resume/…` on disk.
 */
const RESUME_PHOTO_SETS = {
  mangrove: [
    { src: "assets/design/Mangrove/main%20image.png", cap: "Turi-Tap System Render" },
    { src: "assets/design/Mangrove/turipump0.png", cap: "CAD Iteration" },
    { src: "assets/design/Mangrove/fieldtest1.jpg", cap: "Field Testing" },
  ],
  "cal-aero": [
    { src: "assets/design/Cal Aero SAE/2025 plane flying.jpeg", cap: "Competition Flight" },
    { src: "assets/design/Cal Aero SAE/landing gear.png", cap: "Landing Gear" },
    { src: "assets/design/Cal Aero SAE/manufacturing session.jpeg", cap: "Build and Integration" },
  ],
  ntu: [
    { src: encodeAssetPath("assets/images/Visual Resume/NTU/Xie Ming.jpeg"), cap: "Poster Presentation" },
    { src: encodeAssetPath("assets/images/Visual Resume/NTU/Certificate.jpeg"), cap: "Certificate" },
    { src: encodeAssetPath("assets/images/Visual Resume/NTU/000089320011.jpeg"), cap: "MBS" },
    { src: encodeAssetPath("assets/images/Visual Resume/NTU/000089320035.jpeg"), cap: "SG60" },
    { src: encodeAssetPath("assets/images/Visual Resume/NTU/000089320036.jpeg"), cap: "LADs" },
    { src: encodeAssetPath("assets/images/Visual Resume/NTU/000097660007.jpeg"), cap: "Ce La Vie" },
  ],
  siemens: [
    { src: encodeAssetPath("assets/images/Visual Resume/Siemens Mobility/IMG_0080.jpeg"), cap: "Venture Car Manufacturing" },
    { src: encodeAssetPath("assets/images/Visual Resume/Siemens Mobility/IMG_4691.jpeg"), cap: "ALC42" },
    { src: encodeAssetPath("assets/images/Visual Resume/Siemens Mobility/IMG_6089.jpeg"), cap: "Intern Cohort" },
  ],
  globe: [
    { src: encodeAssetPath("assets/images/Visual Resume/GLOBE/IMG_4577.jpeg"), cap: "7/11" },
    { src: encodeAssetPath("assets/images/Visual Resume/GLOBE/IMG_4594.jpeg"), cap: "Fun Architecture" },
    { src: encodeAssetPath("assets/images/Visual Resume/GLOBE/IMG_4605.jpeg"), cap: "Night Market" },
    { src: encodeAssetPath("assets/images/Visual Resume/GLOBE/IMG_4621.jpeg"), cap: "Night Market II" },
    { src: encodeAssetPath("assets/images/Visual Resume/GLOBE/HTC Vive.jpeg"), cap: "HTC Vive" },
    { src: encodeAssetPath("assets/images/Visual Resume/GLOBE/Group Phoro.jpeg"), cap: "CAPRI" },
    { src: encodeAssetPath("assets/images/Visual Resume/GLOBE/group photo 2.jpeg"), cap: "HTC" },
    { src: encodeAssetPath("assets/images/Visual Resume/GLOBE/group photo 3.jpeg"), cap: "TMU Hospital" },
  ],
};

/** Film archive album covers: updated when film-archive.json loads (fallback for first paint). */
const FILM_ALBUM_COVER_SRC = {
  "album-yosemite": "assets/images/Yosemite/1.jpg",
  "album-istanbul": encodeAssetPath("assets/images/Film Photos/Istanbul/1.jpeg"),
  "album-roll-05": "assets/film-rolls/roll-05/cover.svg",
};

const FILM_ARCHIVE_URL = "film-archive.json";
const FILM_ARCHIVE_STORAGE_KEY = "portfolio-film-archive-v1";
const FILM_EDIT_SESSION_KEY = "portfolio-film-edit-ok";
const PROJECT_GRID_STORAGE_PREFIX = "portfolio-project-grid-curator-v1:";

/**
 * Change before deploy. This is not secure on a public static site (passcode is in the file): 
 * it only blocks casual visitors from turning on drag/remove UI.
 */
const FILM_EDIT_PASSCODE = "changeme";

/** @type {null | (slideIndex: number, patch: { href?: string; image?: string; title?: string; cta?: string }) => void} */
let heroFilmSlidePatch = null;

function filmPhotoUrl(folder, file) {
  const base = (folder || "").replace(/\/?$/, "/");
  return `${base}${file}`;
}

/** Dedicated roll page URL: optional `page` in film-archive.json, else film-{slug}.html from id album-{slug}. */
function filmRollPageHref(album) {
  if (album.page) return String(album.page);
  const slug = String(album.id || "").replace(/^album-/, "");
  return slug ? `film-${slug}.html` : "photography.html";
}

function cloneFilmArchive(data) {
  return JSON.parse(JSON.stringify(data));
}

function normalizeFilmArchive(raw) {
  if (!raw || typeof raw !== "object" || !Array.isArray(raw.albums)) return null;
  const albums = raw.albums
    .filter((a) => a && a.id && a.folder && Array.isArray(a.photos))
    .map((a) => ({
      id: String(a.id),
      page: a.page ? String(a.page) : "",
      title: String(a.title || a.id),
      cardLabel: String(a.cardLabel || "Film"),
      blurb: String(a.blurb || ""),
      folder: String(a.folder).replace(/\/?$/, "/"),
      photos: a.photos.map(String).filter(Boolean),
    }));
  return { version: raw.version || 1, albums };
}

async function loadFilmArchivePayload() {
  try {
    const res = await fetch(`${FILM_ARCHIVE_URL}?v=hero143`, { cache: "no-store" });
    if (!res.ok) return null;
    return normalizeFilmArchive(await res.json());
  } catch (_) {
    /* file:// or offline */
    return null;
  }
}

function persistFilmArchiveDraft(data) {
  localStorage.setItem(FILM_ARCHIVE_STORAGE_KEY, JSON.stringify(data));
}

function clearFilmArchiveDraft() {
  localStorage.removeItem(FILM_ARCHIVE_STORAGE_KEY);
}

function renderHomeFilmRail(track, albums) {
  if (!track || !albums.length) return;
  const frag = document.createDocumentFragment();
  albums.forEach((album, i) => {
    const file = album.photos[0];
    if (!file) return;
    const href = filmRollPageHref(album);
    const a = document.createElement("a");
    a.className = "gallery-item gallery-item--thumb rail-tile";
    a.href = href;
    a.setAttribute("aria-label", `Open film roll: ${album.title}`);
    const img = document.createElement("img");
    img.src = filmPhotoUrl(album.folder, file);
    img.alt = "";
    img.width = 400;
    img.height = 300;
    img.loading = "lazy";
    img.decoding = "async";
    a.appendChild(img);
    frag.appendChild(a);
  });
  track.replaceChildren(frag);
}

function renderFilmIndexGrid(grid, albums) {
  if (!grid) return;
  grid.innerHTML = "";
  albums.forEach((album) => {
    const coverFile = album.photos[0];
    const coverSrc = coverFile ? filmPhotoUrl(album.folder, coverFile) : "";
    const a = document.createElement("a");
    a.className = "card card--project";
    a.id = album.id;
    a.href = filmRollPageHref(album);

    const panel = document.createElement("div");
    panel.className = "card-image placeholder";
    if (coverSrc) {
      panel.classList.remove("placeholder");
      panel.classList.add("card-image--photo");
      const img = document.createElement("img");
      img.src = coverSrc;
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      img.addEventListener(
        "error",
        () => {
          img.remove();
          panel.classList.add("placeholder");
          panel.classList.remove("card-image--photo");
          panel.textContent = album.title;
        },
        { once: true }
      );
      panel.appendChild(img);
    } else {
      panel.textContent = album.title;
    }

    const h3 = document.createElement("h3");
    h3.textContent = album.title;
    a.classList.add("film-archive-card");
    a.append(panel, h3);
    grid.appendChild(a);
  });
}

function renderFilmAlbumsMount(mount, albums, editMode, opts) {
  if (!mount) return;
  const omitHeading = Boolean(opts?.omitHeading);
  mount.innerHTML = "";
  albums.forEach((album) => {
    const article = document.createElement("article");
    article.id = album.id;
    article.className = "photo-album photo-album--showcase";
    if (omitHeading) {
      article.setAttribute("aria-label", `${album.title} photo roll`);
    } else {
      article.setAttribute("aria-labelledby", `${album.id}-title`);
    }

    let head = null;
    if (!omitHeading) {
      head = document.createElement("header");
      head.className = "film-album-head";
      const h2 = document.createElement("h2");
      h2.id = `${album.id}-title`;
      h2.textContent = album.title;
      head.appendChild(h2);
    }

    const lb = document.createElement("div");
    lb.setAttribute("data-project-lightbox", "");

    const grid = document.createElement("div");
    grid.className = "film-grid";
    if (editMode) grid.classList.add("film-grid--edit");

    album.photos.forEach((file, i) => {
      const wrap = document.createElement("div");
      wrap.className = "film-tile-shell";
      wrap.dataset.albumId = album.id;
      wrap.dataset.photoIndex = String(i);
      if (editMode) {
        wrap.setAttribute("draggable", "true");
        const handle = document.createElement("span");
        handle.className = "film-edit-drag-hint";
        handle.textContent = "⋮⋮";
        handle.setAttribute("aria-hidden", "true");
        wrap.appendChild(handle);
        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "film-edit-remove";
        removeBtn.setAttribute("aria-label", `Remove frame ${i + 1} from this roll`);
        removeBtn.textContent = "×";
        removeBtn.dataset.albumId = album.id;
        removeBtn.dataset.photoIndex = String(i);
        wrap.appendChild(removeBtn);
      }

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "project-gallery-tile";
      btn.setAttribute("aria-label", `Open ${album.title} photo ${i + 1} full size`);

      const frame = document.createElement("span");
      frame.className = "project-gallery-frame";
      const img = document.createElement("img");
      img.src = filmPhotoUrl(album.folder, file);
      img.alt = `${album.title}: frame ${i + 1}`;
      img.loading = "lazy";
      img.decoding = "async";
      frame.appendChild(img);
      btn.appendChild(frame);
      wrap.appendChild(btn);

      if (editMode) {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
        });
      }

      grid.appendChild(wrap);
    });

    lb.appendChild(grid);
    if (omitHeading) {
      article.appendChild(lb);
    } else {
      article.append(head, lb);
    }
    mount.appendChild(article);
  });
}

function wireFilmEditDragDrop(mount, getAlbums, setAlbums, rerender) {
  if (!mount) return;
  let dragPayload = null;

  mount.querySelectorAll(".film-grid--edit .film-tile-shell").forEach((shell) => {
    shell.addEventListener("dragstart", (e) => {
      dragPayload = {
        albumId: shell.dataset.albumId,
        from: Number(shell.dataset.photoIndex),
      };
      e.dataTransfer.effectAllowed = "move";
      try {
        e.dataTransfer.setData("text/plain", JSON.stringify(dragPayload));
      } catch (_) {
        /* ignore */
      }
      shell.classList.add("is-dragging");
    });
    shell.addEventListener("dragend", () => {
      shell.classList.remove("is-dragging");
      dragPayload = null;
    });
  });

  mount.querySelectorAll(".film-grid--edit").forEach((grid) => {
    grid.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    });
    grid.addEventListener("drop", (e) => {
      e.preventDefault();
      let payload = dragPayload;
      try {
        const t = e.dataTransfer.getData("text/plain");
        if (t) payload = JSON.parse(t);
      } catch (_) {
        /* use dragPayload */
      }
      if (!payload || payload.albumId == null || payload.from == null) return;

      const targetShell = e.target.closest(".film-tile-shell");
      if (!targetShell || targetShell.dataset.albumId !== payload.albumId) return;

      const to = Number(targetShell.dataset.photoIndex);
      const albums = cloneFilmArchive({ version: 1, albums: getAlbums() }).albums;
      const al = albums.find((x) => x.id === payload.albumId);
      if (!al || !al.photos.length) return;
      const from = payload.from;
      if (from === to || Number.isNaN(to)) return;
      const [item] = al.photos.splice(from, 1);
      al.photos.splice(to, 0, item);
      setAlbums(albums);
      persistFilmArchiveDraft({ version: 1, albums });
      rerender();
    });
  });
}

function wireFilmEditRemove(mount, getAlbums, setAlbums, rerender) {
  if (!mount) return;
  mount.querySelectorAll(".film-edit-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.albumId;
      const idx = Number(btn.dataset.photoIndex);
      const albums = cloneFilmArchive({ version: 1, albums: getAlbums() }).albums;
      const al = albums.find((x) => x.id === id);
      if (!al) return;
      al.photos.splice(idx, 1);
      setAlbums(albums);
      persistFilmArchiveDraft({ version: 1, albums });
      rerender();
    });
  });
}

function filmEditSessionActive() {
  return sessionStorage.getItem(FILM_EDIT_SESSION_KEY) === "1";
}

function setFilmEditSession(on) {
  if (on) sessionStorage.setItem(FILM_EDIT_SESSION_KEY, "1");
  else sessionStorage.removeItem(FILM_EDIT_SESSION_KEY);
}

/** @type {null | { getAlbums: () => any[]; setAlbums: (a: any[]) => void; rerender: () => void; mount: HTMLElement }} */
let filmCuratorContext = null;

function setFilmCuratorContext(ctx) {
  filmCuratorContext = ctx;
}

function getFilmCuratorContext() {
  return filmCuratorContext;
}

function getProjectGridStorageKey() {
  return `${PROJECT_GRID_STORAGE_PREFIX}${window.location.pathname}`;
}

function loadProjectGridDraft() {
  try {
    const raw = localStorage.getItem(getProjectGridStorageKey());
    if (!raw) return { order: [], hidden: [] };
    const parsed = JSON.parse(raw);
    return {
      order: Array.isArray(parsed.order) ? parsed.order.map(String) : [],
      hidden: Array.isArray(parsed.hidden) ? parsed.hidden.map(String) : [],
    };
  } catch (_) {
    return { order: [], hidden: [] };
  }
}

function saveProjectGridDraft(state) {
  localStorage.setItem(getProjectGridStorageKey(), JSON.stringify(state));
}

function clearProjectGridDraft() {
  localStorage.removeItem(getProjectGridStorageKey());
}

function ensureProjectTileIds(grid) {
  const seen = new Set();
  [...grid.querySelectorAll(".project-gallery-tile")].forEach((tile, i) => {
    if (!tile.dataset.curatorId) {
      const src = tile.querySelector("img")?.getAttribute("src") || `tile-${i}`;
      const base = src.split("/").pop() || `tile-${i}`;
      tile.dataset.curatorId = `${base}-${i}`;
    }
    while (seen.has(tile.dataset.curatorId)) {
      tile.dataset.curatorId = `${tile.dataset.curatorId}-x`;
    }
    seen.add(tile.dataset.curatorId);
  });
}

function applyProjectGridDraft(grid, state) {
  ensureProjectTileIds(grid);
  const tiles = [...grid.querySelectorAll(".project-gallery-tile")];
  const byId = new Map(tiles.map((t) => [t.dataset.curatorId, t]));
  const ordered = [];
  state.order.forEach((id) => {
    const t = byId.get(id);
    if (t) ordered.push(t);
  });
  tiles.forEach((t) => {
    if (!ordered.includes(t)) ordered.push(t);
  });
  ordered.forEach((t) => grid.appendChild(t));

  const hidden = new Set(state.hidden);
  ordered.forEach((tile) => {
    const isHidden = hidden.has(tile.dataset.curatorId);
    tile.style.display = isHidden ? "none" : "";
    tile.dataset.curatorHidden = isHidden ? "1" : "0";
  });
}

function currentProjectGridState(grid) {
  ensureProjectTileIds(grid);
  const tiles = [...grid.querySelectorAll(".project-gallery-tile")];
  return {
    order: tiles.map((t) => t.dataset.curatorId),
    hidden: tiles.filter((t) => t.dataset.curatorHidden === "1").map((t) => t.dataset.curatorId),
  };
}

let projectGridCuratorCtx = null;

function initProjectGridCuratorMode() {
  if (projectGridCuratorCtx) return projectGridCuratorCtx;
  const grid = document.querySelector(".project-gallery-grid");
  if (!grid) return null;
  if (grid.dataset.curatorInit === "1") return projectGridCuratorCtx;
  grid.dataset.curatorInit = "1";
  ensureProjectTileIds(grid);

  const draft = loadProjectGridDraft();
  applyProjectGridDraft(grid, draft);

  function rerender() {
    applyProjectGridDraft(grid, loadProjectGridDraft());
  }

  function saveNow() {
    saveProjectGridDraft(currentProjectGridState(grid));
  }

  function setEditUi(active) {
    grid.classList.toggle("is-curator", active);
    [...grid.querySelectorAll(".project-gallery-tile")].forEach((tile) => {
      tile.setAttribute("draggable", active ? "true" : "false");

      let rm = tile.querySelector(".project-edit-remove");
      if (active) {
        if (!rm) {
          rm = document.createElement("button");
          rm.type = "button";
          rm.className = "project-edit-remove film-edit-remove";
          rm.setAttribute("aria-label", "Hide photo from this grid");
          rm.textContent = "×";
          rm.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            tile.dataset.curatorHidden = "1";
            tile.style.display = "none";
            saveNow();
          });
          tile.appendChild(rm);
        }
      } else if (rm) {
        rm.remove();
      }
    });
  }

  grid.addEventListener("dragstart", (e) => {
    if (!grid.classList.contains("is-curator")) return;
    const tile = e.target.closest(".project-gallery-tile");
    if (!tile || tile.dataset.curatorHidden === "1") return;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", tile.dataset.curatorId || "");
    tile.classList.add("is-dragging");
  });
  grid.addEventListener("dragend", (e) => {
    const tile = e.target.closest(".project-gallery-tile");
    tile?.classList.remove("is-dragging");
    saveNow();
  });
  grid.addEventListener("dragover", (e) => {
    if (!grid.classList.contains("is-curator")) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  });
  grid.addEventListener("drop", (e) => {
    if (!grid.classList.contains("is-curator")) return;
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (!id) return;
    const moving = [...grid.querySelectorAll(".project-gallery-tile")].find(
      (t) => t.dataset.curatorId === id
    );
    const target = e.target.closest(".project-gallery-tile");
    if (!moving || !target || moving === target) return;
    grid.insertBefore(moving, target);
    saveNow();
  });

  projectGridCuratorCtx = {
    rerender,
    setEditUi,
    clear() {
      clearProjectGridDraft();
      rerender();
    },
  };
  return projectGridCuratorCtx;
}

let filmToolbarDomBound = false;

function applyFilmEditChrome(active) {
  const toolbar = document.getElementById("filmEditToolbar");
  document.body.classList.toggle("film-edit-mode", active);
  if (toolbar) {
    toolbar.hidden = !active;
    toolbar.setAttribute("aria-hidden", active ? "false" : "true");
  }
}

function ensureFilmEditToolbar() {
  let el = document.getElementById("filmEditToolbar");
  if (!el) {
    el = document.createElement("div");
    el.id = "filmEditToolbar";
    el.className = "film-edit-toolbar";
    el.hidden = true;
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = `
    <div class="film-edit-toolbar-inner">
      <span class="film-edit-toolbar-title">Curator</span>
      <button type="button" class="film-edit-btn" id="filmEditDownload">Download film-archive.json</button>
      <button type="button" class="film-edit-btn" id="filmEditCopy">Copy JSON</button>
      <button type="button" class="film-edit-btn film-edit-btn--ghost" id="filmEditClearLocal">Use site JSON only</button>
      <button type="button" class="film-edit-btn film-edit-btn--danger" id="filmEditExit">Exit curator</button>
    </div>
  `;
    document.body.appendChild(el);
  }

  if (!filmToolbarDomBound) {
    filmToolbarDomBound = true;
    document.getElementById("filmEditExit")?.addEventListener("click", () => {
      setFilmEditSession(false);
      applyFilmEditChrome(false);
      getFilmCuratorContext()?.rerender();
      initProjectGridCuratorMode()?.setEditUi(false);
    });
    document.getElementById("filmEditDownload")?.addEventListener("click", () => {
      const albums = getFilmCuratorContext()?.getAlbums();
      if (!albums) return;
      const json = JSON.stringify({ version: 1, albums }, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "film-archive.json";
      a.click();
      URL.revokeObjectURL(a.href);
    });
    document.getElementById("filmEditCopy")?.addEventListener("click", async () => {
      const albums = getFilmCuratorContext()?.getAlbums();
      if (!albums) return;
      const json = JSON.stringify({ version: 1, albums }, null, 2);
      try {
        await navigator.clipboard.writeText(json);
        window.alert("Copied film-archive.json to clipboard.");
      } catch (_) {
        window.prompt("Copy this JSON:", json);
      }
    });
    document.getElementById("filmEditClearLocal")?.addEventListener("click", () => {
      if (!window.confirm("Discard local curator edits on this page and reload?")) return;
      clearFilmArchiveDraft();
      clearProjectGridDraft();
      window.location.reload();
    });
  }
  return el;
}

function initMuniCuratorEgg() {
  document.querySelectorAll(".site-footer-note").forEach((p) => {
    if (p.dataset.muniCuratorInit) return;
    const text = p.textContent || "";
    if (!text.includes("Muni")) return;
    p.dataset.muniCuratorInit = "1";
    const parts = text.split("Muni");
    p.replaceChildren();
    p.append(document.createTextNode(parts[0]));
    const hit = document.createElement("button");
    hit.type = "button";
    hit.className = "muni-curator-hit";
    hit.textContent = "Muni";
    hit.setAttribute("aria-label", "San Francisco Muni: design reference");
    hit.addEventListener("click", async (e) => {
      e.preventDefault();

      if (document.body.classList.contains("film-edit-mode")) {
        setFilmEditSession(false);
        applyFilmEditChrome(false);
        getFilmCuratorContext()?.rerender();
        initProjectGridCuratorMode()?.setEditUi(false);
        return;
      }

      if (!filmEditSessionActive()) {
        const entered = window.prompt("Passcode:");
        if (entered == null) return;
        if (entered !== FILM_EDIT_PASSCODE) {
          window.alert("Passcode did not match.");
          return;
        }
        setFilmEditSession(true);
      }

      const ctx = getFilmCuratorContext();
      if (ctx) {
        ensureFilmEditToolbar();
        applyFilmEditChrome(true);
        ctx.rerender();
        return;
      }

      const projectCurator = initProjectGridCuratorMode();
      if (projectCurator) {
        ensureFilmEditToolbar();
        applyFilmEditChrome(true);
        projectCurator.setEditUi(true);
        projectCurator.rerender();
        return;
      }

      const data = await loadFilmArchivePayload();
      const first = data?.albums?.[0];
      const target = first ? filmRollPageHref(first) : "photography.html";
      window.location.href = target;
    });
    p.appendChild(hit);
    p.append(document.createTextNode(parts.slice(1).join("Muni")));
  });
}

async function initFilmArchiveRuntime() {
  const indexGrid = document.getElementById("filmAlbumIndex");
  const singleMount = document.getElementById("filmSingleMount");
  const singleId =
    document.body?.dataset?.filmAlbum || singleMount?.dataset?.filmAlbumId || "";
  const photosTrack = document.getElementById("photosTrack");
  const needs = Boolean(
    indexGrid || singleMount || singleId || photosTrack || document.getElementById("heroSlideshow")
  );
  if (!needs) return;

  const data = await loadFilmArchivePayload();
  if (!data || !data.albums.length) return;

  let albumsState = data.albums;
  const getAlbums = () => albumsState;
  const setAlbums = (next) => {
    albumsState = next;
  };

  albumsState.slice(0, 2).forEach((album, i) => {
    if (!album?.photos?.[0]) return;
    FILM_ALBUM_COVER_SRC[album.id] = filmPhotoUrl(album.folder, album.photos[0]);
    heroFilmSlidePatch?.(5 + i, {
      href: filmRollPageHref(album),
      image: filmPhotoUrl(album.folder, album.photos[0]),
      title: `${album.title}: film`,
      cta: "Open gallery →",
    });
  });

  renderHomeFilmRail(photosTrack, albumsState);
  renderFilmIndexGrid(indexGrid, albumsState);

  if (singleId && singleMount) {
    function rerenderSingle() {
      const al = albumsState.find((a) => a.id === singleId);
      if (!al) return;
      renderFilmAlbumsMount(singleMount, [al], false, { omitHeading: true });
      initProjectGalleryLightbox();
      window.dispatchEvent(new Event("resize"));
    }

    rerenderSingle();
  }

  window.dispatchEvent(new Event("resize"));
}

function initProjectGridCuratorBoot() {
  const projectCurator = initProjectGridCuratorMode();
  if (!projectCurator) return;
  if (filmEditSessionActive()) {
    ensureFilmEditToolbar();
    applyFilmEditChrome(true);
    projectCurator.setEditUi(true);
  } else {
    projectCurator.setEditUi(false);
  }
}

/** Resolve a site-relative asset path the same way the browser does for `<img src>`. */
function resolveDocRelativeUrl(src) {
  if (!src) return "";
  try {
    return new URL(src, document.baseURI).href;
  } catch {
    return src;
  }
}

function hydrateProjectCardThumb(card, projectId) {
  const src = PROJECT_HERO_SRC[projectId];
  if (!src) return;

  const panel = card.querySelector(".card-image");
  if (!panel) return;

  const wantHref = resolveDocRelativeUrl(src);
  const existing = panel.querySelector("img");
  if (existing) {
    const haveHref = resolveDocRelativeUrl(existing.getAttribute("src") || "");
    if (haveHref && haveHref === wantHref) {
      panel.classList.remove("placeholder");
      panel.classList.add("card-image--photo");
      return;
    }
  }

  panel.classList.remove("placeholder");
  panel.classList.add("card-image--photo");
  panel.textContent = "";

  const img = document.createElement("img");
  img.src = wantHref;
  img.alt = "";
  img.loading = "lazy";
  img.decoding = "async";

  img.addEventListener(
    "error",
    () => {
      img.remove();
      panel.classList.remove("card-image--photo");
      panel.classList.add("placeholder");
      const title = card.querySelector("h3")?.textContent?.trim() || "Project";
      panel.textContent = title.length > 28 ? `${title.slice(0, 25)}…` : title;
    },
    { once: true }
  );

  panel.appendChild(img);
}

function initDesignArchiveThumbs() {
  const grid = document.querySelector(".archive-grid");
  if (!grid) return;

  grid.querySelectorAll("a.card--project[id]").forEach((card) => {
    hydrateProjectCardThumb(card, card.id);
  });
}

function initHomeProjectPreviews() {
  const track = document.getElementById("projectsTrack");
  if (!track) return;

  track.querySelectorAll("a.card--project").forEach((card) => {
    const id = card.getAttribute("data-project-id") || card.id;
    if (id && id.startsWith("project-")) hydrateProjectCardThumb(card, id);
  });
}

function initPhotoAlbumCovers() {
  document.querySelectorAll("article.photo-album[id] .photo-album-cover").forEach((cover) => {
    const article = cover.closest("article");
    if (!article) return;
    const src = FILM_ALBUM_COVER_SRC[article.id];
    if (!src) {
      cover.classList.add("is-empty");
      return;
    }

    const img = document.createElement("img");
    img.src = src;
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";

    img.addEventListener(
      "error",
      () => {
        img.remove();
        cover.classList.add("is-empty");
      },
      { once: true }
    );

    cover.appendChild(img);
  });
}

/** Kamron name peek: one image in assets/images/peek/ */
const HERO_PEEK_IMAGES = [encodeAssetPath("assets/images/peek/65041-1-0036.jpeg")];

/**
 * Hobby carousel: folders under assets/images/ (Legos, Sourdough, Sacramento Kings, Van Hool, Transit Nerd).
 * encodeAssetPath handles spaces in folder names.
 */
const HOBBY_SLIDES = {
  sourdough: {
    label: "Sourdough baker",
    photos: [
      encodeAssetPath("assets/images/Sourdough/IMG_0756.jpeg"),
      encodeAssetPath("assets/images/Sourdough/IMG_3805.jpeg"),
      encodeAssetPath("assets/images/Sourdough/IMG_3815.jpeg"),
      encodeAssetPath("assets/images/Sourdough/IMG_5864.jpeg"),
      encodeAssetPath("assets/images/Sourdough/IMG_5906.jpeg"),
      encodeAssetPath("assets/images/Sourdough/IMG_6196.jpeg"),
      encodeAssetPath("assets/images/Sourdough/IMG_6512.jpeg"),
      encodeAssetPath("assets/images/Sourdough/IMG_6520.jpeg"),
      encodeAssetPath("assets/images/Sourdough/IMG_6526.jpeg"),
      encodeAssetPath("assets/images/Sourdough/IMG_6850.jpeg"),
      encodeAssetPath("assets/images/Sourdough/IMG_6860.jpeg"),
      encodeAssetPath("assets/images/Sourdough/IMG_7287.jpeg"),
    ],
  },
  lego: {
    label: "Lego builder",
    photos: [
      encodeAssetPath("assets/images/Legos/IMG_0878.jpeg"),
      encodeAssetPath("assets/images/Legos/IMG_0880.jpeg"),
      encodeAssetPath("assets/images/Legos/IMG_4542.jpeg"),
      encodeAssetPath("assets/images/Legos/IMG_5990.jpeg"),
      encodeAssetPath("assets/images/Legos/IMG_7205.jpeg"),
      encodeAssetPath("assets/images/Legos/img20231026_18350381.jpeg"),
    ],
  },
  kings: {
    label: "Sacramento Kings fan",
    photos: [
      encodeAssetPath("assets/images/Sacramento Kings/IMG_4073.jpeg"),
      encodeAssetPath("assets/images/Sacramento Kings/IMG_4550.jpeg"),
      encodeAssetPath("assets/images/Sacramento Kings/IMG_7555.jpeg"),
      encodeAssetPath("assets/images/Sacramento Kings/IMG_8826.jpeg"),
    ],
  },
  ag300: {
    label: "Van Hool AG300 enthusiast",
    photos: [encodeAssetPath("assets/images/Van Hool/hq720.jpg")],
  },
  transit: {
    label: "Transit nerd",
    photos: [
      encodeAssetPath("assets/images/Transit Nerd/000015100013.jpeg"),
      encodeAssetPath("assets/images/Transit Nerd/IMG_6089.jpeg"),
      encodeAssetPath("assets/images/Transit Nerd/IMG_6693.jpeg"),
      encodeAssetPath("assets/images/Transit Nerd/IMG_8193.jpeg"),
      encodeAssetPath("assets/images/Transit Nerd/IMG_8202.jpeg"),
      encodeAssetPath("assets/images/Transit Nerd/IMG_8378.jpeg"),
      encodeAssetPath("assets/images/Transit Nerd/img20231026_18294278.jpeg"),
      encodeAssetPath("assets/images/Transit Nerd/img20231026_18320794.jpeg"),
    ],
  },
};

function initHeroNamePeek() {
  const hit = document.getElementById("heroNameHit");
  const peek = document.getElementById("heroPeek");
  const img = document.getElementById("heroPeekImg");
  if (!hit) return;

  const hasPeek = Boolean(peek && img && HERO_PEEK_IMAGES.length);

  const FLASH_MS = 500;
  let hideTimer = null;

  function clearHideTimer() {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
  }

  function hidePeek() {
    clearHideTimer();
    peek?.classList.remove("is-flash");
  }

  function pickSrc() {
    return HERO_PEEK_IMAGES[Math.floor(Math.random() * HERO_PEEK_IMAGES.length)];
  }

  function flashPeek(forceSrc = "") {
    if (!hasPeek) return;
    img.src = forceSrc || pickSrc();
    peek.classList.add("is-flash");
    clearHideTimer();
    hideTimer = setTimeout(hidePeek, FLASH_MS);
  }

  if (hasPeek) {
    img.addEventListener("error", () => {
      hidePeek();
    });
  }

  hit.addEventListener("click", (e) => {
    e.preventDefault();
    flashPeek();
  });

  hit.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    flashPeek();
  });
}

function initHobbyHeroSlideshow() {
  const panel = document.getElementById("heroCopyPanel");
  const hobbyRoot = document.getElementById("heroHobbyFill");
  const backBtn = document.getElementById("hobbySlideshowBack");
  const slideMedia = document.getElementById("hobbyHeroSlideMedia");
  const slideImg = document.getElementById("hobbyHeroSlideImg");
  const slidePlaceholder = document.getElementById("hobbyHeroSlidePlaceholder");
  const slideTitle = document.getElementById("hobbyHeroSlideTitle");
  const slideCta = document.getElementById("hobbyHeroSlideCta");
  const dotsContainer = document.getElementById("hobbyHeroSlideshowDots");
  const prevBtn = document.querySelector(".hobby-hero-prev");
  const nextBtn = document.querySelector(".hobby-hero-next");
  const triggers = [...document.querySelectorAll(".hobby-trigger[data-hobby-key]")];

  if (!panel || !hobbyRoot || !backBtn || !slideMedia || !slideImg || !slidePlaceholder || !slideTitle || !slideCta || !dotsContainer || !triggers.length) {
    return;
  }

  let activeKey = "";
  let photos = [];
  let index = 0;

  function shortLabel(key) {
    const map = {
      sourdough: "Sourdough",
      lego: "Lego",
      kings: "Kings",
      ag300: "AG300",
      transit: "Transit",
    };
    return map[key] || "Hobby";
  }

  /** Same pattern as `initProjectGalleryLightbox` / resume lightbox: drive a real <img> with .src */
  function setSlideImage(src, fallbackLabel) {
    slideMedia.style.backgroundImage = "none";
    if (!src || typeof src !== "string") {
      slideImg.removeAttribute("src");
      slideImg.hidden = true;
      slideImg.alt = "";
      slideMedia.classList.remove("has-photo");
      slidePlaceholder.textContent = fallbackLabel;
      return;
    }
    slideImg.alt = fallbackLabel;
    slideImg.decoding = "async";
    slideImg.onerror = () => {
      slideImg.removeAttribute("src");
      slideImg.hidden = true;
      slideMedia.classList.remove("has-photo");
      slidePlaceholder.textContent = fallbackLabel;
    };
    slideImg.hidden = false;
    slideImg.src = src;
    slideMedia.classList.add("has-photo");
  }

  function renderDots() {
    if (!photos.length) {
      dotsContainer.replaceChildren();
      delete dotsContainer.dataset.hobbyDotsFor;
      return;
    }
    const needRebuild =
      dotsContainer.children.length !== photos.length ||
      dotsContainer.dataset.hobbyDotsFor !== activeKey;

    if (needRebuild) {
      dotsContainer.replaceChildren();
      dotsContainer.dataset.hobbyDotsFor = activeKey;
      photos.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "hero-slideshow-dot";
        dot.setAttribute("aria-label", `Hobby photo ${i + 1}`);
        dot.addEventListener("click", (e) => {
          e.preventDefault();
          index = i;
          applySlide();
        });
        dotsContainer.appendChild(dot);
      });
    }

    dotsContainer.querySelectorAll(".hero-slideshow-dot").forEach((dot, i) => {
      dot.classList.toggle("is-active", i === index);
      dot.setAttribute("aria-current", i === index ? "true" : "false");
    });
  }

  function applySlide() {
    const config = HOBBY_SLIDES[activeKey];
    const label = config?.label || "Hobby";

    if (!photos.length) {
      slideTitle.textContent = label;
      slideCta.textContent = "Add photos in HOBBY_SLIDES";
      slideCta.hidden = false;
      setSlideImage("", shortLabel(activeKey));
      slidePlaceholder.textContent = "Photos";
      if (prevBtn) prevBtn.disabled = true;
      if (nextBtn) nextBtn.disabled = true;
      renderDots();
      return;
    }

    slideTitle.textContent = label;
    if (photos.length > 1) {
      slideCta.textContent = `${index + 1} / ${photos.length}`;
      slideCta.hidden = false;
    } else {
      slideCta.textContent = "";
      slideCta.hidden = true;
    }

    const src = photos[index];
    const resolved = resolveDocRelativeUrl(src);
    setSlideImage(resolved, shortLabel(activeKey));
    slidePlaceholder.textContent = shortLabel(activeKey);

    if (prevBtn) prevBtn.disabled = photos.length <= 1;
    if (nextBtn) nextBtn.disabled = photos.length <= 1;

    renderDots();
  }

  function openHobby(key) {
    const config = HOBBY_SLIDES[key];
    if (!config) return;
    activeKey = key;
    photos = (config.photos || []).filter(Boolean);
    index = 0;
    panel.classList.add("is-hobby-mode");
    hobbyRoot.setAttribute("aria-hidden", "false");
    applySlide();
    hobbyRoot.focus();
  }

  function closeHobby() {
    panel.classList.remove("is-hobby-mode");
    hobbyRoot.setAttribute("aria-hidden", "true");
    activeKey = "";
    photos = [];
    index = 0;
    slideMedia.style.backgroundImage = "none";
    slideImg.removeAttribute("src");
    slideImg.hidden = true;
    slideImg.alt = "";
    slideMedia.classList.remove("has-photo");
    slideTitle.textContent = "";
    slideCta.textContent = "";
    slideCta.hidden = false;
    dotsContainer.replaceChildren();
    delete dotsContainer.dataset.hobbyDotsFor;
  }

  triggers.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openHobby(btn.dataset.hobbyKey || "");
    });
  });

  backBtn.addEventListener("click", () => closeHobby());

  prevBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    if (photos.length <= 1) return;
    index = (index - 1 + photos.length) % photos.length;
    applySlide();
  });

  nextBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    if (photos.length <= 1) return;
    index = (index + 1) % photos.length;
    applySlide();
  });

  hobbyRoot.setAttribute("tabindex", "0");
  hobbyRoot.addEventListener("keydown", (e) => {
    if (!panel.classList.contains("is-hobby-mode")) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prevBtn?.click();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      nextBtn?.click();
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeHobby();
    }
  });
}

function initHeroSlideshow() {
  const root = document.getElementById("heroSlideshow");
  if (!root) return;

  const slideLink = document.getElementById("heroSlideLink");
  const slideMedia = document.getElementById("heroSlideMedia");
  const slideTitle = document.getElementById("heroSlideTitle");
  const slideCta = document.getElementById("heroSlideCta");
  const slidePlaceholder = document.getElementById("heroSlidePlaceholder");
  const dotsContainer = root.querySelector(".hero-slideshow-dots");
  const prevBtn = root.querySelector(".hero-slideshow-prev");
  const nextBtn = root.querySelector(".hero-slideshow-next");

  if (!slideLink || !slideMedia || !slideTitle || !slidePlaceholder || !dotsContainer) return;

  /** Slides 0–4: engineering. Slides 5–6: two most recent film rolls (patched from film-archive.json). */
  const slides = [
    { title: "Mangrove Water", short: "Mangrove", href: "project-mangrove-water.html", image: PROJECT_HERO_SRC["project-mangrove-water"], cta: "Open project →" },
    { title: "FormaFlow Morphing Dress", short: "FormaFlow", href: "project-morphing-dress.html", image: PROJECT_HERO_SRC["project-morphing-dress"], cta: "Open project →" },
    { title: "LMKS V1 light meter", short: "LMKS", href: "project-lmks-v1.html", image: PROJECT_HERO_SRC["project-lmks-v1"], cta: "Open project →" },
    { title: "CAL Aerospace SAE: RC plane", short: "Cal Aero", href: "project-cal-aerospace-sae.html", image: PROJECT_HERO_SRC["project-cal-aerospace-sae"], cta: "Open project →" },
    { title: "Smart Goniometer", short: "Goniometer", href: "project-smart-goniometer.html", image: PROJECT_HERO_SRC["project-smart-goniometer"], cta: "Open project →" },
    {
      title: "Yosemite: film",
      short: "Film",
      href: "film-yosemite.html",
      image: FILM_ALBUM_COVER_SRC["album-yosemite"],
      cta: "Open gallery →",
    },
    {
      title: "Istanbul: film",
      short: "Film",
      href: "film-istanbul.html",
      image: FILM_ALBUM_COVER_SRC["album-istanbul"] || "",
      cta: "Open gallery →",
    },
  ];

  let index = 0;
  let timer = null;

  function setSlideImage(src, fallbackLabel) {
    if (!src || typeof src !== "string") {
      slideMedia.style.backgroundImage = "none";
      slideMedia.classList.remove("has-photo", "hero-slide-media--asset-toned");
      slideMedia.classList.add("no-photo");
      slidePlaceholder.textContent = fallbackLabel;
      return;
    }
    slideMedia.style.backgroundImage = `url(${JSON.stringify(src)})`;
    slideMedia.classList.add("has-photo");
    slideMedia.classList.remove("no-photo");
    slideMedia.classList.toggle(
      "hero-slide-media--asset-toned",
      src.includes("Smart-Goniometer") && src.includes("1.jpeg")
    );
    const probe = new Image();
    probe.decoding = "async";
    probe.onload = () => {};
    probe.onerror = () => {
      slideMedia.style.backgroundImage = "none";
      slideMedia.classList.remove("has-photo", "hero-slide-media--asset-toned");
      slideMedia.classList.add("no-photo");
      slidePlaceholder.textContent = fallbackLabel;
    };
    probe.src = src;
  }

  function prefetchHeroNeighbors() {
    if (slides.length < 2) return;
    const nextIdx = (index + 1) % slides.length;
    const prevIdx = (index - 1 + slides.length) % slides.length;
    [nextIdx, prevIdx].forEach((i) => {
      const url = resolveDocRelativeUrl(slides[i].image);
      if (!url) return;
      const im = new Image();
      im.decoding = "async";
      im.src = url;
    });
  }

  function applySlide(i) {
    index = (i + slides.length) % slides.length;
    const current = slides[index];
    slideLink.setAttribute("href", current.href);
    slideTitle.textContent = current.title;
    slidePlaceholder.textContent = current.short;
    if (slideCta) slideCta.textContent = current.cta || "Open →";
    const resolved = resolveDocRelativeUrl(current.image);
    setSlideImage(resolved, current.short);

    [...dotsContainer.querySelectorAll(".hero-slideshow-dot")].forEach((dot, j) => {
      dot.classList.toggle("is-active", j === index);
      dot.setAttribute("aria-current", j === index ? "true" : "false");
    });

    prefetchHeroNeighbors();
  }

  slides.forEach((item, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "hero-slideshow-dot";
    dot.setAttribute("aria-label", `Show ${item.title}`);
    dot.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      applySlide(i);
      resetTimer();
    });
    dotsContainer.appendChild(dot);
  });

  function next() {
    applySlide(index + 1);
  }
  function prev() {
    applySlide(index - 1);
  }

  function resetTimer() {
    if (timer) clearInterval(timer);
    timer = window.setInterval(next, 6000);
  }

  prevBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    prev();
    resetTimer();
  });
  nextBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    next();
    resetTimer();
  });

  root.addEventListener("mouseenter", () => {
    if (timer) clearInterval(timer);
    timer = null;
  });
  root.addEventListener("mouseleave", () => resetTimer());

  root.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
      resetTimer();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
      resetTimer();
    }
  });

  applySlide(0);
  resetTimer();

  heroFilmSlidePatch = (slideIndex, patch) => {
    if (patch == null || slideIndex < 0 || slideIndex >= slides.length) return;
    const s = slides[slideIndex];
    if (!s) return;
    if (patch.title != null) s.title = patch.title;
    if (patch.href != null) s.href = patch.href;
    if (patch.image != null) s.image = patch.image;
    if (patch.cta != null) s.cta = patch.cta;
    if (index === slideIndex) applySlide(slideIndex);
  };
}

initDesignArchiveThumbs();
initHomeProjectPreviews();
initPhotoAlbumCovers();
initHeroNamePeek();
initHobbyHeroSlideshow();
initHeroSlideshow();

function initPreviewRails() {
  const rails = document.querySelectorAll(".preview-rail");
  if (!rails.length) return;
  const DRAG_MULTIPLIER = 0.92;
  const MIN_VELOCITY_FOR_INERTIA = 0.12;
  const INERTIA_FRICTION = 0.94;
  /** Snap / sub-pixel scroll leaves small non-zero scrollLeft; treat as “home” inside this band. */
  const SCROLL_EDGE = 8;

  rails.forEach((rail) => {
    const track = rail.querySelector(".preview-track");
    const prevBtn = rail.querySelector(".preview-prev[data-track]");
    const nextBtn = rail.querySelector(".preview-next[data-track]");
    if (!track) return;

    let isDragging = false;
    let dragMoved = false;
    let startX = 0;
    let startScrollLeft = 0;
    let rafId = null;
    let velocityX = 0;
    let lastPointerX = 0;
    let lastMoveAt = 0;
    let inertiaRaf = 0;

    function updateButtons() {
      const sl = Math.max(0, track.scrollLeft);
      const maxScrollLeft = Math.max(0, track.scrollWidth - track.clientWidth);
      const atStart = sl <= SCROLL_EDGE;
      const atEnd = maxScrollLeft <= SCROLL_EDGE || sl >= maxScrollLeft - SCROLL_EDGE;

      if (prevBtn) {
        prevBtn.disabled = atStart;
      }
      if (nextBtn) {
        nextBtn.disabled = atEnd;
      }
    }

    function scheduleButtonUpdate() {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        updateButtons();
      });
    }

    function nudge(direction) {
      const firstPanel = track.querySelector(".card, .gallery-item");
      const styles = window.getComputedStyle(track);
      const gap =
        Number.parseFloat(styles.columnGap) ||
        Number.parseFloat(styles.gap) ||
        0;
      const panelWidth = firstPanel
        ? firstPanel.getBoundingClientRect().width + gap
        : Math.max(180, Math.round(track.clientWidth * 0.56));
      const currentIndex = Math.round(track.scrollLeft / panelWidth);
      const targetIndex = currentIndex + direction;
      const target = Math.max(
        0,
        Math.min(
          track.scrollWidth - track.clientWidth,
          Math.round(targetIndex * panelWidth)
        )
      );
      const start = track.scrollLeft;
      const distance = target - start;
      if (Math.abs(distance) < 1) return;
      const duration = 320;
      const t0 = performance.now();

      function animate(now) {
        const t = Math.min(1, (now - t0) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        track.scrollLeft = start + distance * eased;
        scheduleButtonUpdate();
        if (t < 1) requestAnimationFrame(animate);
      }

      animate(t0);
    }

    function bindNavButton(button, direction) {
      if (!button) return;
      let handledPointerDown = false;

      button.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        handledPointerDown = true;
        nudge(direction);
        window.setTimeout(updateButtons, 220);
      });

      button.addEventListener("click", () => {
        if (handledPointerDown) {
          handledPointerDown = false;
          return;
        }
        nudge(direction);
        window.setTimeout(updateButtons, 220);
      });
    }

    bindNavButton(prevBtn, -1);
    bindNavButton(nextBtn, 1);

    function startDrag(clientX) {
      if (inertiaRaf) {
        cancelAnimationFrame(inertiaRaf);
        inertiaRaf = 0;
      }
      isDragging = true;
      dragMoved = false;
      startX = clientX;
      startScrollLeft = track.scrollLeft;
      velocityX = 0;
      lastPointerX = clientX;
      lastMoveAt = performance.now();
      track.classList.add("is-dragging");
    }

    function moveDrag(clientX) {
      if (!isDragging) return;
      const deltaX = clientX - startX;
      if (Math.abs(deltaX) > 3) dragMoved = true;
      track.scrollLeft = startScrollLeft - deltaX * DRAG_MULTIPLIER;
      const now = performance.now();
      const dt = Math.max(1, now - lastMoveAt);
      const dx = clientX - lastPointerX;
      velocityX = -(dx / dt) * DRAG_MULTIPLIER;
      lastPointerX = clientX;
      lastMoveAt = now;
      scheduleButtonUpdate();
    }

    function stopDrag() {
      if (!isDragging) return;
      isDragging = false;
      track.classList.remove("is-dragging");
      if (Math.abs(velocityX) < MIN_VELOCITY_FOR_INERTIA) {
        requestAnimationFrame(updateButtons);
    return;
  }

      function glide() {
        velocityX *= INERTIA_FRICTION;
        if (Math.abs(velocityX) < 0.02) {
          inertiaRaf = 0;
          updateButtons();
          return;
        }
        const maxLeft = Math.max(0, track.scrollWidth - track.clientWidth);
        const next = Math.max(0, Math.min(maxLeft, track.scrollLeft + velocityX * 16));
        track.scrollLeft = next;
        scheduleButtonUpdate();
        inertiaRaf = requestAnimationFrame(glide);
      }

      inertiaRaf = requestAnimationFrame(glide);
    }

    track.addEventListener("mousedown", (event) => {
      event.preventDefault();
      startDrag(event.clientX);
    });
    window.addEventListener("mousemove", (event) => {
      moveDrag(event.clientX);
    });
    window.addEventListener("mouseup", stopDrag);

    track.addEventListener(
      "touchstart",
      (event) => {
        if (!event.touches.length) return;
        startDrag(event.touches[0].clientX);
      },
      { passive: true }
    );
    track.addEventListener(
      "touchmove",
      (event) => {
        if (!event.touches.length) return;
        moveDrag(event.touches[0].clientX);
      },
      { passive: true }
    );
    track.addEventListener("touchend", stopDrag);
    track.addEventListener("touchcancel", stopDrag);
    track.addEventListener(
      "click",
      (event) => {
        if (dragMoved) {
          event.preventDefault();
          event.stopPropagation();
          dragMoved = false;
        }
      },
      true
    );
    track.addEventListener("scroll", scheduleButtonUpdate, { passive: true });
    track.addEventListener("scrollend", updateButtons, { passive: true });
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(() => {
        requestAnimationFrame(updateButtons);
      });
      ro.observe(track);
    }
    requestAnimationFrame(() => {
      updateButtons();
      requestAnimationFrame(updateButtons);
    });
    window.setTimeout(updateButtons, 120);
    window.setTimeout(updateButtons, 400);
  });

  window.addEventListener("resize", () => {
    document.querySelectorAll(".preview-rail").forEach((rail) => {
      const track = rail.querySelector(".preview-track");
      const prevBtn = rail.querySelector(".preview-prev");
      const nextBtn = rail.querySelector(".preview-next");
      if (!track) return;
      const sl = Math.max(0, track.scrollLeft);
      const maxScrollLeft = Math.max(0, track.scrollWidth - track.clientWidth);
      const atStart = sl <= SCROLL_EDGE;
      const atEnd = maxScrollLeft <= SCROLL_EDGE || sl >= maxScrollLeft - SCROLL_EDGE;
      if (prevBtn) {
        prevBtn.disabled = atStart;
      }
      if (nextBtn) nextBtn.disabled = atEnd;
    });
  });
}

initPreviewRails();

const resumeShell = document.getElementById("resumeShell");
const resumeToggle = document.getElementById("resumeToggle");
const resumeTimeline = document.getElementById("resumeTimeline");

/** All resume cards, captured once before any rebuild so collapse/expand never drops nodes. */
let resumeEventsMaster = null;

function parseResumeYear(event) {
  const start = event?.dataset?.start || "";
  const [yearText] = start.split("-");
  const year = Number(yearText);
  return Number.isFinite(year) ? year : null;
}

function parseResumeYearMonthWeight(event) {
  const start = event?.dataset?.start || "";
  const [yearText, monthText] = start.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  if (!Number.isFinite(year) || !Number.isFinite(month)) return 0;
  return year * 12 + (month - 1);
}

/**
 * Fill visual resume photo strips from `RESUME_PHOTO_SETS`. Must run against **all** timeline
 * cards in `resumeEventsMaster`, including nodes not currently attached (collapsed year filter),
 * or Siemens / GLOBE strips never hydrate.
 */
function hydrateResumePhotos() {
  const wraps =
    resumeEventsMaster && resumeEventsMaster.length
      ? resumeEventsMaster.flatMap((ev) => [...ev.querySelectorAll(".resume-event-photos[data-photo-set]")])
      : [...document.querySelectorAll("#resumeTimeline .resume-event-photos[data-photo-set]")];

  wraps.forEach((wrap) => {
    if (wrap.dataset.resumePhotosHydrated === "1") return;
    const key = wrap.getAttribute("data-photo-set");
    const items = key ? RESUME_PHOTO_SETS[key] : null;
    if (!items?.length) return;

    items.forEach(({ src, cap }) => {
      const fig = document.createElement("figure");
      fig.className = "resume-event-photo";
      const frame = document.createElement("button");
      frame.type = "button";
      frame.className = "resume-event-photo-frame";
      frame.setAttribute("aria-label", cap ? `View larger: ${cap}` : "View larger photo");
      const img = document.createElement("img");
      img.src = src;
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      img.draggable = false;
      img.addEventListener(
        "error",
        () => {
          fig.remove();
        },
        { once: true }
      );
      frame.appendChild(img);
      fig.appendChild(frame);
      if (cap) {
        const fc = document.createElement("figcaption");
        fc.className = "resume-event-photo-cap";
        fc.textContent = cap;
        fig.appendChild(fc);
      }
      wrap.appendChild(fig);
    });

    wrap.dataset.resumePhotosHydrated = "1";

    window.setTimeout(() => {
      if (wrap.querySelector(".resume-event-photo")) return;
      const p = document.createElement("p");
      p.className = "resume-event-photos-hint";
      if (key === "ntu" || key === "siemens" || key === "globe") {
        p.innerHTML = `Add JPG or PNG files under <code>assets/images/Visual Resume/</code> (see <code>RESUME_PHOTO_SETS</code> in <code>script.js</code> for filenames), or update that list to match your files.`;
      } else {
        p.textContent = "Photos could not be loaded.";
      }
      wrap.appendChild(p);
    }, 400);
  });
}

let resumePhotoLightboxDelegationDone = false;
function ensureResumePhotoLightboxDelegation() {
  if (resumePhotoLightboxDelegationDone) return;
  const timeline = document.getElementById("resumeTimeline");
  if (!timeline) return;
  resumePhotoLightboxDelegationDone = true;
  timeline.addEventListener("click", (e) => {
    const frame = e.target.closest(".resume-event-photo-frame");
    if (!frame || !timeline.contains(frame)) return;
    const wrap = frame.closest(".resume-event-photos[data-photo-set]");
    if (!wrap) return;
    e.stopPropagation();
    const figures = [...wrap.querySelectorAll(".resume-event-photo")];
    const list = figures
      .map((fig) => {
        const img = fig.querySelector("img");
        const cap = fig.querySelector(".resume-event-photo-cap")?.textContent?.trim() || "";
        return { src: img?.getAttribute("src") || "", alt: img?.getAttribute("alt") || "", caption: cap };
      })
      .filter((s) => s.src);
    const idx = figures.findIndex((fig) => fig.contains(frame));
    if (idx < 0 || !list.length) return;
    openResumePhotoLightbox(list, idx);
  });
}

/**
 * Visual resume: newest year at top. Each year label is centered on the center line,
 * with that year’s events listed below (two columns). Collapsed shows 2026 + 2025 only.
 */
function buildResumeTimeline() {
  if (!resumeTimeline) return;

  if (!resumeEventsMaster) {
    resumeEventsMaster = [...resumeTimeline.querySelectorAll(".resume-event")];
  }
  if (!resumeEventsMaster.length) return;

  resumeEventsMaster.forEach((el) => {
    el.classList.remove("resume-event--expanded");
    el.setAttribute("aria-expanded", "false");
    const det = el.querySelector(".resume-event-detail");
    if (det) det.hidden = true;
  });

  const sorted = [...resumeEventsMaster].sort(
    (a, b) => parseResumeYearMonthWeight(b) - parseResumeYearMonthWeight(a)
  );

  const collapsed = resumeShell?.classList.contains("is-collapsed");
  const minYearVisible = collapsed ? 2025 : 2021;
  const visible = sorted.filter((el) => {
    const y = parseResumeYear(el);
    return y !== null && y >= minYearVisible;
  });

  const byYear = new Map();
  visible.forEach((el) => {
    const y = parseResumeYear(el);
    if (y === null) return;
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y).push(el);
  });

  const yearsDesc = [...byYear.keys()].sort((a, b) => b - a);

  const fragment = document.createDocumentFragment();
  yearsDesc.forEach((year) => {
    const group = document.createElement("div");
    group.className = "resume-year-group";

    const header = document.createElement("div");
    header.className = "resume-year-header";
    const label = document.createElement("span");
    label.textContent = String(year);
    header.appendChild(label);

    const row = document.createElement("div");
    row.className = "resume-year-events";

    const yearEvents = byYear.get(year) || [];
    yearEvents.sort((a, b) => parseResumeYearMonthWeight(b) - parseResumeYearMonthWeight(a));
    yearEvents.forEach((ev, index) => {
      ev.classList.remove("side-left", "side-right");
      ev.classList.add(index % 2 === 0 ? "side-left" : "side-right");
      ev.style.marginBottom = "";
      row.appendChild(ev);
    });

    group.appendChild(header);
    group.appendChild(row);
    fragment.appendChild(group);
  });

  resumeTimeline.replaceChildren(fragment);
  hydrateResumePhotos();
}

function refreshResumeTimeline() {
  buildResumeTimeline();
}

if (resumeToggle && resumeShell && resumeTimeline) {
  const toggleLabel = resumeToggle.querySelector("span[aria-hidden='true']");

  function syncResumeToggle() {
    const expanded = !resumeShell.classList.contains("is-collapsed");
    resumeToggle.setAttribute("aria-expanded", String(expanded));
    resumeToggle.setAttribute("aria-label", expanded ? "Collapse timeline" : "Expand timeline");
    if (toggleLabel) {
      toggleLabel.textContent = expanded ? "⌃" : "⌄";
    }
  }

  resumeToggle.addEventListener("click", () => {
    resumeShell.classList.toggle("is-collapsed");
    syncResumeToggle();
    refreshResumeTimeline();
  });

  syncResumeToggle();
  refreshResumeTimeline();
}

window.addEventListener("resize", () => {
  refreshResumeTimeline();
});

function initResumeEventExpansion() {
  if (!resumeTimeline) return;

  function collapseAll() {
    resumeTimeline.querySelectorAll(".resume-event--expanded").forEach((el) => {
      el.classList.remove("resume-event--expanded");
      el.setAttribute("aria-expanded", "false");
      const det = el.querySelector(".resume-event-detail");
      if (det) det.hidden = true;
    });
  }

  resumeTimeline.addEventListener("click", (e) => {
    const card = e.target.closest(".resume-event");
    if (!card || !resumeTimeline.contains(card)) return;
    if (e.target.closest("a")) return;
    /* Expanded body and photos: do not collapse when clicking inside (only header toggles closed). */
    if (e.target.closest(".resume-event-detail")) return;
    const wasExpanded = card.classList.contains("resume-event--expanded");
    collapseAll();
    if (!wasExpanded) {
      card.classList.add("resume-event--expanded");
      card.setAttribute("aria-expanded", "true");
      const det = card.querySelector(".resume-event-detail");
      if (det) det.hidden = false;
      card.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  });

  resumeTimeline.addEventListener("keydown", (e) => {
    const card = e.target.closest(".resume-event");
    if (!card || !resumeTimeline.contains(card)) return;
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    card.click();
  });
}

initResumeEventExpansion();

function openResumePhotoLightbox(slides, startAt) {
  installProjectLightboxGlobalKeys();
  document.querySelectorAll(".project-lightbox.resume-timeline-lightbox").forEach((n) => n.remove());

  const list = slides.filter((s) => s && s.src);
  if (!list.length) return;

  let index = 0;

  const overlay = document.createElement("div");
  overlay.className = "project-lightbox resume-timeline-lightbox";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = `
    <button type="button" class="project-lightbox-backdrop" aria-label="Close gallery"></button>
    <button type="button" class="project-lightbox-close" aria-label="Close gallery">×</button>
    <div class="project-lightbox-row">
      <button type="button" class="project-lightbox-nav project-lightbox-prev" aria-label="Previous image">‹</button>
      <div class="project-lightbox-stage">
        <div class="project-lightbox-caption-block is-empty" aria-live="polite">
          <p class="project-lightbox-caption"></p>
        </div>
        <div class="project-lightbox-img-wrap">
          <img class="project-lightbox-img" alt="" />
        </div>
      </div>
      <button type="button" class="project-lightbox-nav project-lightbox-next" aria-label="Next image">›</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const backdrop = overlay.querySelector(".project-lightbox-backdrop");
  const closeBtn = overlay.querySelector(".project-lightbox-close");
  const prevBtn = overlay.querySelector(".project-lightbox-prev");
  const nextBtn = overlay.querySelector(".project-lightbox-next");
  const imgEl = overlay.querySelector(".project-lightbox-img");
  const capEl = overlay.querySelector(".project-lightbox-caption");
  const capBlock = overlay.querySelector(".project-lightbox-caption-block");

  function applySlide() {
    const s = list[index];
    if (!s) return;
    imgEl.src = s.src;
    imgEl.alt = s.alt || "";
    const cap = s.caption || "";
    capEl.textContent = cap;
    const hasCap = Boolean(cap);
    capBlock.classList.toggle("is-empty", !hasCap);
    capBlock.setAttribute("aria-hidden", hasCap ? "false" : "true");
    const single = list.length <= 1;
    prevBtn.disabled = single;
    nextBtn.disabled = single;
  }

  function go(at) {
    index = ((at % list.length) + list.length) % list.length;
    applySlide();
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function close() {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    overlay.remove();
  }

  backdrop.addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", () => go(index - 1));
  nextBtn.addEventListener("click", () => go(index + 1));

  overlay._lightboxApi = {
    close,
    prev: () => go(index - 1),
    next: () => go(index + 1),
  };

  go(startAt);
}

ensureResumePhotoLightboxDelegation();

function initProjectGalleryAsideHeight() {
  const split = document.querySelector(".project-content-split");
  if (!split) return;
  const primary = split.querySelector(".project-content-primary");
  const aside = split.querySelector(".project-gallery-aside");
  const head = split.querySelector(".project-gallery-head");
  if (!primary || !aside) return;

  const mq = window.matchMedia("(max-width: 900px)");

  function sync() {
    if (aside.classList.contains("project-gallery-aside--free")) {
      aside.style.removeProperty("max-height");
      aside.style.removeProperty("min-height");
      aside.style.removeProperty("height");
      return;
    }
    if (mq.matches) {
      aside.style.removeProperty("max-height");
      aside.style.removeProperty("min-height");
      aside.style.removeProperty("height");
      return;
    }
    const gap = 16;
    const overhead = (head?.offsetHeight ?? 0) + (head ? gap : 0);
    const cap = Math.max(120, primary.offsetHeight - overhead);
    aside.style.maxHeight = `${cap}px`;
    aside.style.removeProperty("height");
    aside.style.removeProperty("min-height");
  }

  sync();
  window.addEventListener("resize", sync);
  mq.addEventListener("change", sync);

  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(() => {
      window.requestAnimationFrame(sync);
    });
    ro.observe(primary);
    if (head) ro.observe(head);
  }

  aside.querySelectorAll(".project-gallery-grid img").forEach((img) => {
    if (img.complete) return;
    img.addEventListener("load", sync, { once: true });
  });
}

initProjectGalleryAsideHeight();

function installProjectLightboxGlobalKeys() {
  if (installProjectLightboxGlobalKeys.done) return;
  installProjectLightboxGlobalKeys.done = true;
  document.addEventListener("keydown", (e) => {
    const open = document.querySelector(".project-lightbox.is-open");
    if (!open || !open._lightboxApi) return;
    const api = open._lightboxApi;
    if (e.key === "Escape") {
      e.preventDefault();
      api.close();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      api.prev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      api.next();
    }
  });
}

function initProjectGalleryLightbox() {
  document.querySelectorAll(".project-lightbox").forEach((n) => n.remove());
  installProjectLightboxGlobalKeys();

  document.querySelectorAll("[data-project-lightbox]").forEach((root) => {
    const heroTrigger = root.querySelector(".project-hero-lightbox-trigger");
    const tiles = [...root.querySelectorAll(".project-gallery-tile")];
    const vimeoTiles = [...root.querySelectorAll(".project-vimeo-tile")];

    function vimeoUrlWithParams(url, extra) {
      try {
        const u = new URL(url, window.location.origin);
        for (const [k, v] of Object.entries(extra)) {
          if (v === false || v == null) u.searchParams.delete(k);
          else u.searchParams.set(k, String(v));
        }
        return u.toString();
      } catch {
        return url;
      }
    }

    const heroSlides = [];
    if (heroTrigger) {
      const img = heroTrigger.querySelector("img");
      heroSlides.push({
        type: "image",
        src: img?.getAttribute("data-full-src") || img?.getAttribute("src") || "",
        alt: img?.getAttribute("alt") || "",
        caption: (heroTrigger.getAttribute("data-caption") || "").trim(),
      });
    }

    const vimeoSlides = [];
    vimeoTiles.forEach((wrap) => {
      const iframe = wrap.querySelector("iframe");
      const src = iframe?.getAttribute("src") || "";
      if (!src) return;
      const rawAspect = (wrap.getAttribute("data-aspect") || "").trim();
      let aspect = "land";
      if (rawAspect === "portrait") aspect = "portrait";
      else if (rawAspect === "four-three") aspect = "four-three";
      vimeoSlides.push({
        type: "vimeo",
        src,
        alt: (iframe?.getAttribute("title") || "").trim(),
        caption: (wrap.getAttribute("data-caption") || "").trim(),
        aspect,
      });
    });

    const tileSlides = [];
    tiles.forEach((tile, idx) => {
      const img = tile.querySelector("img");
      const video = tile.querySelector("video");
      const videoSrc =
        video?.querySelector("source")?.getAttribute("src") || video?.getAttribute("src") || "";
      tileSlides.push({
        originalIndex: idx,
        type: videoSrc ? "video" : "image",
        src:
          videoSrc ||
          img?.getAttribute("data-full-src") ||
          img?.getAttribute("src") ||
          "",
        alt: img?.getAttribute("alt") || "",
        caption:
          (img?.getAttribute("data-caption") || tile.getAttribute("data-caption") || "").trim(),
      });
    });

    const tilePhotos = tileSlides.filter((s) => s.type === "image");
    const tileVideos = tileSlides.filter((s) => s.type === "video");
    const slides = [...heroSlides, ...vimeoSlides, ...tilePhotos, ...tileVideos];
    const list = slides.filter((s) => s.src);
    if (!list.length) return;

    /** Index in `list` (what open() uses), not raw `slides`: fixes gallery clicks when any slide omits src. */
    function slideIndexToListIndex(si) {
      if (si < 0 || si >= slides.length || !slides[si].src) return 0;
      return slides.slice(0, si).filter((s) => s.src).length;
    }

    const afterHeroVimeo = heroSlides.length + vimeoSlides.length;
    const tileToListIndex = new Map();
    [...tilePhotos, ...tileVideos].forEach((s, idx) => {
      const slideIdx = afterHeroVimeo + idx;
      tileToListIndex.set(s.originalIndex, slideIndexToListIndex(slideIdx));
    });

    const overlay = document.createElement("div");
    overlay.className = "project-lightbox";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
    <button type="button" class="project-lightbox-backdrop" aria-label="Close gallery"></button>
    <button type="button" class="project-lightbox-close" aria-label="Close gallery">×</button>
    <div class="project-lightbox-row">
      <button type="button" class="project-lightbox-nav project-lightbox-prev" aria-label="Previous image">‹</button>
      <div class="project-lightbox-stage">
        <div class="project-lightbox-caption-block is-empty" aria-live="polite">
          <p class="project-lightbox-caption"></p>
    </div>
        <div class="project-lightbox-img-wrap">
          <img class="project-lightbox-img" alt="" />
          <video class="project-lightbox-video" controls playsinline preload="metadata" hidden></video>
          <div class="project-lightbox-vimeo project-lightbox-vimeo--land" hidden>
            <iframe class="project-lightbox-vimeo-iframe" title="" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" referrerpolicy="strict-origin-when-cross-origin"></iframe>
          </div>
        </div>
      </div>
      <button type="button" class="project-lightbox-nav project-lightbox-next" aria-label="Next image">›</button>
    </div>
  `;
    document.body.appendChild(overlay);

    const backdrop = overlay.querySelector(".project-lightbox-backdrop");
    const closeBtn = overlay.querySelector(".project-lightbox-close");
    const prevBtn = overlay.querySelector(".project-lightbox-prev");
    const nextBtn = overlay.querySelector(".project-lightbox-next");
    const imgEl = overlay.querySelector(".project-lightbox-img");
    const videoEl = overlay.querySelector(".project-lightbox-video");
    const vimeoWrap = overlay.querySelector(".project-lightbox-vimeo");
    const vimeoIframe = overlay.querySelector(".project-lightbox-vimeo-iframe");
    const capEl = overlay.querySelector(".project-lightbox-caption");
    const capBlock = overlay.querySelector(".project-lightbox-caption-block");

    let index = 0;

    function clearVimeo() {
      if (vimeoIframe) {
        vimeoIframe.removeAttribute("src");
        vimeoIframe.removeAttribute("title");
      }
      if (vimeoWrap) vimeoWrap.hidden = true;
    }

    function applySlide() {
      const s = list[index];
      if (!s) return;
      if (s.type === "vimeo") {
        imgEl.hidden = true;
        imgEl.removeAttribute("src");
        videoEl.pause();
        videoEl.hidden = true;
        videoEl.removeAttribute("src");
        vimeoWrap.hidden = false;
        vimeoWrap.classList.remove(
          "project-lightbox-vimeo--land",
          "project-lightbox-vimeo--portrait",
          "project-lightbox-vimeo--four-three"
        );
        if (s.aspect === "portrait") vimeoWrap.classList.add("project-lightbox-vimeo--portrait");
        else if (s.aspect === "four-three") vimeoWrap.classList.add("project-lightbox-vimeo--four-three");
        else vimeoWrap.classList.add("project-lightbox-vimeo--land");
        vimeoIframe.title = s.alt || "Vimeo video";
        /* Tiles stay chromeless (background=1 in page HTML). Lightbox uses full player UI after explicit click. */
        vimeoIframe.src = vimeoUrlWithParams(s.src, {
          background: "0",
          autopause: "0",
        });
      } else if (s.type === "video") {
        clearVimeo();
        imgEl.hidden = true;
        imgEl.removeAttribute("src");
        videoEl.hidden = false;
        videoEl.src = s.src;
      } else {
        clearVimeo();
        videoEl.pause();
        videoEl.hidden = true;
        videoEl.removeAttribute("src");
        imgEl.hidden = false;
        imgEl.src = s.src;
        imgEl.alt = s.alt;
      }
      const cap = s.caption || "";
      capEl.textContent = cap;
      const hasCap = Boolean(cap);
      capBlock.classList.toggle("is-empty", !hasCap);
      capBlock.setAttribute("aria-hidden", hasCap ? "false" : "true");
      const single = list.length <= 1;
      prevBtn.disabled = single;
      nextBtn.disabled = single;
    }

    function open(at) {
      index = ((at % list.length) + list.length) % list.length;
      applySlide();
      overlay.classList.add("is-open");
      overlay.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    }

    function close() {
      videoEl.pause();
      clearVimeo();
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    heroTrigger?.addEventListener("click", () => open(slideIndexToListIndex(0)));
    tiles.forEach((tile, i) => {
      tile.addEventListener("click", () => open(tileToListIndex.get(i) ?? 0));
    });
    vimeoTiles.forEach((wrap, vi) => {
      const go = () => open(slideIndexToListIndex(heroSlides.length + vi));
      wrap.addEventListener("click", go);
      wrap.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          go();
        }
    });
  });

    backdrop.addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    closeBtn.addEventListener("click", close);

    prevBtn.addEventListener("click", () => open(index - 1));
    nextBtn.addEventListener("click", () => open(index + 1));

    overlay._lightboxApi = {
      close,
      prev: () => open(index - 1),
      next: () => open(index + 1),
    };
  });
}

initProjectGalleryLightbox();

/** Type muni (bus) or bart (train) on the keyboard for a one-off roll-by; skips inputs. */
function initTransitTypingEggs() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let buf = "";
  let lastTs = 0;
  const maxGapMs = 1800;

  function transitEggBusy() {
    return document.body.dataset.transitEggLock === "1";
  }

  function setTransitEggLock(on) {
    document.body.dataset.transitEggLock = on ? "1" : "";
  }

  function playTransitRoll(kind) {
    if (transitEggBusy()) return;
    setTransitEggLock(true);
    const layer = document.createElement("div");
    layer.className = "transit-egg-layer";
    layer.setAttribute("role", "presentation");
    layer.setAttribute("aria-hidden", "true");
    const vehicle = document.createElement("div");
    vehicle.className =
      kind === "train"
        ? "transit-egg-vehicle transit-egg-vehicle--train"
        : "transit-egg-vehicle transit-egg-vehicle--bus";
    layer.appendChild(vehicle);
    document.body.appendChild(layer);

    const cleanup = () => {
      layer.remove();
      setTransitEggLock(false);
    };
    vehicle.addEventListener("animationend", cleanup, { once: true });
    window.setTimeout(cleanup, 4200);
  }

  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const el = e.target;
    if (el instanceof HTMLElement) {
      const tag = el.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable) return;
    }
    const now = Date.now();
    if (now - lastTs > maxGapMs) buf = "";
    lastTs = now;
    if (e.key.length !== 1) return;
    buf = (buf + e.key.toLowerCase()).slice(-12);
    if (buf.endsWith("muni")) {
      buf = "";
      playTransitRoll("bus");
    } else if (buf.endsWith("bart")) {
      buf = "";
      playTransitRoll("train");
    }
  });
}

function initQuirkyMotion() {
}

initFilmArchiveRuntime()
  .catch((err) => {
    console.warn("Film archive:", err);
  })
  .finally(() => {
    window.dispatchEvent(new Event("resize"));
  });

initQuirkyMotion();

initMuniCuratorEgg();
initTransitTypingEggs();

window.addEventListener("mousedown", (event) => {
  const burst = document.createElement("span");
  burst.className = "cursor-click";
  burst.style.left = `${event.clientX}px`;
  burst.style.top = `${event.clientY}px`;
  document.body.appendChild(burst);
  setTimeout(() => burst.remove(), 280);
});

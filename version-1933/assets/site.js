const SiteUI = (() => {
  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const syncImageFallback = () => {
    qsa("img").forEach((image) => {
      image.addEventListener("error", () => {
        image.classList.add("image-missing");
      });
    });
  };

  const initMenu = () => {
    const button = qs(".menu-toggle");
    const panel = qs(".mobile-panel");
    if (!button || !panel) return;
    button.addEventListener("click", () => {
      const opened = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!opened));
      panel.hidden = opened;
    });
  };

  const initHero = () => {
    const hero = qs("[data-hero]");
    const slides = qsa(".hero-slide");
    const dots = qsa(".hero-dot");
    if (!hero || slides.length === 0) return;
    let index = 0;
    const show = (next) => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle("active", i === index));
      dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
    };
    dots.forEach((dot, i) => dot.addEventListener("click", () => show(i)));
    window.setInterval(() => show(index + 1), 5200);
  };

  const initFilters = () => {
    const grids = qsa(".searchable-grid");
    if (grids.length === 0) return;
    const input = qs(".page-filter");
    const year = qs(".year-filter");
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || "";
    if (input && query) input.value = query;
    const apply = () => {
      const term = (input?.value || "").trim().toLowerCase();
      const selectedYear = year?.value || "";
      grids.forEach((grid) => {
        const cards = qsa(".movie-card", grid);
        let visible = 0;
        cards.forEach((card) => {
          const haystack = [card.dataset.title, card.dataset.region, card.dataset.genre, card.dataset.keywords, card.dataset.year]
            .join(" ")
            .toLowerCase();
          const okTerm = !term || haystack.includes(term);
          const okYear = !selectedYear || card.dataset.year === selectedYear;
          const matched = okTerm && okYear;
          card.hidden = !matched;
          if (matched) visible += 1;
        });
        let empty = grid.querySelector(".no-results");
        if (!visible) {
          if (!empty) {
            empty = document.createElement("div");
            empty.className = "no-results";
            empty.textContent = "没有找到匹配影片";
            grid.appendChild(empty);
          }
        } else if (empty) {
          empty.remove();
        }
      });
    };
    input?.addEventListener("input", apply);
    year?.addEventListener("change", apply);
    apply();
  };

  const init = () => {
    syncImageFallback();
    initMenu();
    initHero();
    initFilters();
  };

  return { init };
})();

const CinemaPlayer = (() => {
  const start = (videoId, buttonId, source) => {
    const video = document.getElementById(videoId);
    const button = document.getElementById(buttonId);
    if (!video || !button || !source) return;
    let attached = false;
    let hls = null;
    const attach = () => {
      if (attached) return Promise.resolve();
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return Promise.resolve();
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        return new Promise((resolve) => {
          hls.on(window.Hls.Events.MANIFEST_PARSED, resolve);
          hls.on(window.Hls.Events.ERROR, resolve);
        });
      }
      video.src = source;
      return Promise.resolve();
    };
    const play = () => {
      button.classList.add("is-hidden");
      attach().then(() => {
        const promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(() => button.classList.remove("is-hidden"));
        }
      });
    };
    button.addEventListener("click", play);
    video.addEventListener("click", () => {
      if (video.paused) play();
    });
  };
  return { start };
})();

document.addEventListener("DOMContentLoaded", SiteUI.init);

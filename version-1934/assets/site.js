(function() {
  var toggle = document.querySelector(".nav-toggle");
  var panel = document.querySelector(".mobile-panel");

  if (toggle && panel) {
    toggle.addEventListener("click", function() {
      var open = panel.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var prev = document.querySelector(".hero-prev");
  var next = document.querySelector(".hero-next");
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function(slide, idx) {
      slide.classList.toggle("active", idx === current);
    });
    dots.forEach(function(dot, idx) {
      dot.classList.toggle("active", idx === current);
    });
  }

  function restartSlider() {
    if (timer) {
      window.clearInterval(timer);
    }
    if (slides.length > 1) {
      timer = window.setInterval(function() {
        showSlide(current + 1);
      }, 5200);
    }
  }

  if (slides.length) {
    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        showSlide(Number(dot.getAttribute("data-slide")) || 0);
        restartSlider();
      });
    });
    if (prev) {
      prev.addEventListener("click", function() {
        showSlide(current - 1);
        restartSlider();
      });
    }
    if (next) {
      next.addEventListener("click", function() {
        showSlide(current + 1);
        restartSlider();
      });
    }
    restartSlider();
  }

  var liveInput = document.querySelector("[data-live-search]");
  var grids = Array.prototype.slice.call(document.querySelectorAll(".searchable-grid"));
  var empty = document.querySelector(".empty-state");

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function filterCards(value) {
    var term = normalize(value);
    var visible = 0;
    grids.forEach(function(grid) {
      Array.prototype.slice.call(grid.querySelectorAll(".movie-card")).forEach(function(card) {
        var text = normalize(card.getAttribute("data-search"));
        var matched = !term || text.indexOf(term) !== -1;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });
    });
    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  if (liveInput) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (query) {
      liveInput.value = query;
    }
    filterCards(liveInput.value);
    liveInput.addEventListener("input", function() {
      filterCards(liveInput.value);
    });
  }

  var sorter = document.querySelector("[data-sort-cards]");
  if (sorter) {
    sorter.addEventListener("change", function() {
      var grid = document.querySelector(".sortable-grid");
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
      var mode = sorter.value;
      cards.sort(function(a, b) {
        var ta = normalize(a.querySelector("h2") ? a.querySelector("h2").textContent : "");
        var tb = normalize(b.querySelector("h2") ? b.querySelector("h2").textContent : "");
        var ya = normalize(a.querySelector(".movie-meta-line span") ? a.querySelector(".movie-meta-line span").textContent : "");
        var yb = normalize(b.querySelector(".movie-meta-line span") ? b.querySelector(".movie-meta-line span").textContent : "");
        if (mode === "title") {
          return ta.localeCompare(tb, "zh-Hans-CN");
        }
        if (mode === "year") {
          return yb.localeCompare(ya, "zh-Hans-CN");
        }
        return 0;
      });
      cards.forEach(function(card) {
        grid.appendChild(card);
      });
    });
  }
}());

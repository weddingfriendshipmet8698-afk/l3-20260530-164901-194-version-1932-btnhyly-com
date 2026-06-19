(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var nav = document.querySelector(".site-nav");
    var toggle = document.querySelector(".site-nav-toggle");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll(".site-search").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = "./search.html";
        }
      });
    });

    var carousel = document.querySelector("[data-hero-carousel]");
    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
      var active = 0;
      var timer = null;
      var setActive = function (index) {
        if (!slides.length) {
          return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === active);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === active);
        });
      };
      var start = function () {
        timer = window.setInterval(function () {
          setActive(active + 1);
        }, 5200);
      };
      var stop = function () {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      };
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          stop();
          setActive(index);
          start();
        });
      });
      carousel.addEventListener("mouseenter", stop);
      carousel.addEventListener("mouseleave", start);
      setActive(0);
      start();
    }

    var filterInput = document.querySelector(".movie-filter-input");
    var filterSelects = Array.prototype.slice.call(document.querySelectorAll(".movie-filter-select"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-target .movie-card, .filter-target .movie-list-card"));
    var empty = document.querySelector(".filter-empty");
    if (filterInput && cards.length) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query) {
        filterInput.value = query;
      }
      var applyFilter = function () {
        var text = filterInput.value.trim().toLowerCase();
        var activeFilters = {};
        filterSelects.forEach(function (select) {
          if (select.value) {
            activeFilters[select.getAttribute("data-filter-field")] = select.value;
          }
        });
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-search") || "").toLowerCase();
          var ok = !text || haystack.indexOf(text) !== -1;
          Object.keys(activeFilters).forEach(function (field) {
            if ((card.getAttribute("data-" + field) || "") !== activeFilters[field]) {
              ok = false;
            }
          });
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      };
      filterInput.addEventListener("input", applyFilter);
      filterSelects.forEach(function (select) {
        select.addEventListener("change", applyFilter);
      });
      applyFilter();
    }
  });
})();

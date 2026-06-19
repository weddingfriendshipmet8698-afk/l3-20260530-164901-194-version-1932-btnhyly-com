(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var navLinks = document.querySelector('[data-nav-links]');
  var quickSearch = document.querySelector('.quick-search');

  if (menuButton && navLinks) {
    menuButton.addEventListener('click', function () {
      navLinks.classList.toggle('is-open');
      if (quickSearch) {
        quickSearch.classList.toggle('is-open');
      }
    });
  }

  var backTop = document.querySelector('[data-back-top]');
  if (backTop) {
    window.addEventListener('scroll', function () {
      backTop.classList.toggle('is-visible', window.scrollY > 420);
    });
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === activeSlide);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === activeSlide);
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var typeSelect = document.querySelector('[data-filter-type]');
  var yearSelect = document.querySelector('[data-filter-year]');
  var regionSelect = document.querySelector('[data-filter-region]');
  var filterCards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var resultCount = document.querySelector('[data-result-count]');
  var emptyState = document.querySelector('[data-empty-state]');

  function applyCardFilter() {
    if (!filterCards.length) {
      return;
    }
    var keyword = normalize(filterInput && filterInput.value);
    var type = normalize(typeSelect && typeSelect.value);
    var year = normalize(yearSelect && yearSelect.value);
    var region = normalize(regionSelect && regionSelect.value);
    var visible = 0;

    filterCards.forEach(function (card) {
      var haystack = normalize([
        card.dataset.title,
        card.dataset.year,
        card.dataset.type,
        card.dataset.region,
        card.dataset.genre,
        card.dataset.tags
      ].join(' '));
      var ok = true;

      if (keyword && haystack.indexOf(keyword) === -1) {
        ok = false;
      }
      if (type && normalize(card.dataset.type).indexOf(type) === -1) {
        ok = false;
      }
      if (year && normalize(card.dataset.year) !== year) {
        ok = false;
      }
      if (region && normalize(card.dataset.region).indexOf(region) === -1) {
        ok = false;
      }

      card.classList.toggle('hidden-by-filter', !ok);
      if (ok) {
        visible += 1;
      }
    });

    if (resultCount) {
      resultCount.textContent = String(visible);
    }
    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  }

  [filterInput, typeSelect, yearSelect, regionSelect].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyCardFilter);
      control.addEventListener('change', applyCardFilter);
    }
  });

  applyCardFilter();

  var searchMount = document.querySelector('[data-search-results]');
  if (searchMount && window.MOVIE_SEARCH_DATA) {
    var params = new URLSearchParams(window.location.search);
    var initialKeyword = params.get('q') || '';
    var searchInput = document.querySelector('[data-live-search]');
    var searchType = document.querySelector('[data-live-type]');
    var searchYear = document.querySelector('[data-live-year]');
    var searchCount = document.querySelector('[data-live-count]');

    if (searchInput) {
      searchInput.value = initialKeyword;
    }

    function createResultCard(movie) {
      return [
        '<article class="movie-card" data-movie-card>',
        '  <a class="poster-link" href="./movie/' + movie.id + '.html">',
        '    <img src="./' + movie.poster + '.jpg" alt="' + movie.safeTitle + '" loading="lazy">',
        '    <span class="poster-mask"></span>',
        '    <span class="play-badge">▶</span>',
        '    <span class="type-badge">' + movie.safeType + '</span>',
        '    <span class="score-badge">' + movie.score + '</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <a class="movie-title" href="./movie/' + movie.id + '.html">' + movie.safeTitle + '</a>',
        '    <p>' + movie.safeOneLine + '</p>',
        '    <div class="card-meta">',
        '      <span>' + movie.safeYear + '</span>',
        '      <span>' + movie.safeRegion + '</span>',
        '      <span>' + movie.safeGenre + '</span>',
        '    </div>',
        '  </div>',
        '</article>'
      ].join('');
    }

    function applyLiveSearch() {
      var keyword = normalize(searchInput && searchInput.value);
      var type = normalize(searchType && searchType.value);
      var year = normalize(searchYear && searchYear.value);
      var results = window.MOVIE_SEARCH_DATA.filter(function (movie) {
        var haystack = normalize(movie.title + ' ' + movie.region + ' ' + movie.type + ' ' + movie.year + ' ' + movie.genre + ' ' + movie.tags + ' ' + movie.oneLine);
        if (keyword && haystack.indexOf(keyword) === -1) {
          return false;
        }
        if (type && normalize(movie.type).indexOf(type) === -1) {
          return false;
        }
        if (year && String(movie.year) !== year) {
          return false;
        }
        return true;
      });

      if (searchCount) {
        searchCount.textContent = String(results.length);
      }

      searchMount.innerHTML = results.slice(0, 240).map(createResultCard).join('');
      var searchEmpty = document.querySelector('[data-search-empty]');
      if (searchEmpty) {
        searchEmpty.hidden = results.length !== 0;
      }
    }

    [searchInput, searchType, searchYear].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyLiveSearch);
        control.addEventListener('change', applyLiveSearch);
      }
    });

    applyLiveSearch();
  }
})();

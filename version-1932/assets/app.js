(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  ready(function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-main-nav]');

    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        nav.classList.toggle('is-open');
      });
    }

    var searchInput = document.getElementById('searchInput');
    var searchGrid = document.getElementById('searchGrid');
    var searchCount = document.getElementById('searchCount');

    if (searchInput && searchGrid) {
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get('q') || '';
      searchInput.value = initialQuery;

      function applyFilter() {
        var query = normalize(searchInput.value);
        var cards = Array.prototype.slice.call(searchGrid.querySelectorAll('.movie-card'));
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-year'),
            card.textContent
          ].join(' '));
          var matched = !query || haystack.indexOf(query) !== -1;

          card.classList.toggle('is-filtered-out', !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (searchCount) {
          searchCount.textContent = '匹配 ' + visible + ' 部';
        }
      }

      searchInput.addEventListener('input', applyFilter);
      applyFilter();
    }
  });
})();

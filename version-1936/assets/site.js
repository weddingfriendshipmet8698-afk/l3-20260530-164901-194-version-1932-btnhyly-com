(function () {
  const searchToggle = document.querySelector('[data-search-toggle]');
  const searchPanel = document.querySelector('[data-header-search]');
  const mobileToggle = document.querySelector('[data-mobile-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');
  const backTop = document.querySelector('[data-back-top]');

  if (searchToggle && searchPanel) {
    searchToggle.addEventListener('click', function () {
      searchPanel.classList.toggle('is-open');
      const input = searchPanel.querySelector('input');
      if (searchPanel.classList.contains('is-open') && input) {
        input.focus();
      }
    });
  }

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  if (backTop) {
    const updateBackTop = function () {
      backTop.classList.toggle('is-visible', window.scrollY > 320);
    };
    updateBackTop();
    window.addEventListener('scroll', updateBackTop, { passive: true });
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    if (slides.length < 2) {
      return;
    }
    let current = 0;
    const activate = function (index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        activate(index);
      });
    });
    window.setInterval(function () {
      activate((current + 1) % slides.length);
    }, 5200);
  });

  document.querySelectorAll('[data-filter-group]').forEach(function (group) {
    const buttons = Array.from(group.querySelectorAll('[data-filter]'));
    const cards = Array.from(document.querySelectorAll('[data-filter-card]'));
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        const value = button.getAttribute('data-filter') || 'all';
        buttons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        cards.forEach(function (card) {
          const type = card.getAttribute('data-type') || '';
          const year = card.getAttribute('data-year') || '';
          const region = card.getAttribute('data-region') || '';
          const show = value === 'all' || type === value || year === value || region === value;
          card.style.display = show ? '' : 'none';
        });
      });
    });
  });

  const searchForm = document.querySelector('[data-live-search]');
  if (searchForm && window.SEARCH_MOVIES) {
    const input = searchForm.querySelector('input');
    const results = document.querySelector('[data-search-results]');
    const render = function () {
      const keyword = (input.value || '').trim().toLowerCase();
      const items = window.SEARCH_MOVIES.filter(function (movie) {
        const haystack = [movie.title, movie.year, movie.region, movie.type, movie.category, movie.tags].join(' ').toLowerCase();
        return !keyword || haystack.indexOf(keyword) !== -1;
      }).slice(0, 80);
      if (!results) {
        return;
      }
      if (!items.length) {
        results.innerHTML = '<div class="empty-state">没有找到相关影片，请更换关键词再试。</div>';
        return;
      }
      results.innerHTML = items.map(function (movie) {
        return [
          '<a class="movie-card" href="' + movie.href + '">',
          '<div class="card-cover">',
          '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
          '<span class="play-badge">▶</span>',
          '<span class="card-label">' + escapeHtml(movie.type) + '</span>',
          '</div>',
          '<div class="card-body">',
          '<h2 class="card-title">' + escapeHtml(movie.title) + '</h2>',
          '<p class="card-text">' + escapeHtml(movie.oneLine) + '</p>',
          '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.category) + '</span></div>',
          '</div>',
          '</a>'
        ].join('');
      }).join('');
    };
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      input.value = q;
    }
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      render();
    });
    input.addEventListener('input', render);
    render();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();

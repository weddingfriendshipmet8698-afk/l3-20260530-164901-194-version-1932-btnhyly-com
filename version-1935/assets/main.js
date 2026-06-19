(function() {
  var menuButton = document.querySelector('.mobile-menu-button');
  var panel = document.querySelector('.mobile-panel');
  if (menuButton && panel) {
    menuButton.addEventListener('click', function() {
      var open = panel.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var index = 0;
    function show(next) {
      if (!slides.length) {
        return;
      }
      slides[index].classList.remove('active');
      if (dots[index]) {
        dots[index].classList.remove('active');
      }
      index = (next + slides.length) % slides.length;
      slides[index].classList.add('active');
      if (dots[index]) {
        dots[index].classList.add('active');
      }
    }
    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener('click', function() {
        show(dotIndex);
      });
    });
    window.setInterval(function() {
      show(index + 1);
    }, 5200);
  }

  var controls = document.querySelector('[data-filter-controls]');
  var area = document.querySelector('[data-filter-area]');
  if (controls && area) {
    var input = controls.querySelector('[data-filter-input]');
    var typeSelect = controls.querySelector('[data-filter-type]');
    var regionSelect = controls.querySelector('[data-filter-region]');
    var cards = Array.prototype.slice.call(area.querySelectorAll('.movie-card'));
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (input && initial) {
      input.value = initial;
    }
    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }
    function applyFilter() {
      var query = normalize(input && input.value);
      var type = normalize(typeSelect && typeSelect.value);
      var region = normalize(regionSelect && regionSelect.value);
      cards.forEach(function(card) {
        var text = normalize(card.getAttribute('data-card-text'));
        var cardType = normalize(card.getAttribute('data-type'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var matched = true;
        if (query && text.indexOf(query) === -1) {
          matched = false;
        }
        if (type && cardType.indexOf(type) === -1) {
          matched = false;
        }
        if (region && cardRegion.indexOf(region) === -1) {
          matched = false;
        }
        card.classList.toggle('hidden-by-filter', !matched);
      });
    }
    [input, typeSelect, regionSelect].forEach(function(control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
    applyFilter();
  }
}());

(function () {
    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function setupMobileNavigation() {
        const button = document.querySelector('[data-mobile-toggle]');
        const panel = document.querySelector('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
            button.textContent = panel.classList.contains('is-open') ? '×' : '☰';
        });
    }

    function setupGlobalSearch() {
        document.querySelectorAll('[data-global-search]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                const input = form.querySelector('input[name="q"]');
                const query = input ? input.value.trim() : '';
                const target = query ? './movies.html?q=' + encodeURIComponent(query) : './movies.html';
                window.location.href = target;
            });
        });
    }

    function setupPageFilters() {
        const scope = document.querySelector('[data-filter-scope]');
        if (!scope) {
            return;
        }
        const container = scope.querySelector('[data-card-container]');
        if (!container) {
            return;
        }
        const cards = Array.from(container.querySelectorAll('.movie-card'));
        const searchInput = scope.querySelector('[data-search-input]');
        const regionSelect = scope.querySelector('[data-filter-region]');
        const typeSelect = scope.querySelector('[data-filter-type]');
        const yearSelect = scope.querySelector('[data-filter-year]');
        const sortSelect = scope.querySelector('[data-sort-select]');
        const countNode = scope.querySelector('[data-result-count]');
        const emptyNode = scope.querySelector('[data-empty-state]');
        const params = new URLSearchParams(window.location.search);
        const query = params.get('q') || '';
        const sort = params.get('sort') || '';
        if (searchInput && query) {
            searchInput.value = query;
        }
        if (sortSelect && sort) {
            sortSelect.value = sort === 'year' ? 'year' : sort;
        }
        cards.forEach(function (card, index) {
            card.dataset.originalOrder = String(index);
        });
        function matches(card) {
            const term = normalize(searchInput ? searchInput.value : '');
            const region = normalize(regionSelect ? regionSelect.value : '');
            const type = normalize(typeSelect ? typeSelect.value : '');
            const year = normalize(yearSelect ? yearSelect.value : '');
            const haystack = normalize([
                card.dataset.title,
                card.dataset.genre,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year,
                card.dataset.tags
            ].join(' '));
            if (term && haystack.indexOf(term) === -1) {
                return false;
            }
            if (region && normalize(card.dataset.region).indexOf(region) === -1) {
                return false;
            }
            if (type && normalize(card.dataset.type) !== type) {
                return false;
            }
            if (year && normalize(card.dataset.year) !== year) {
                return false;
            }
            return true;
        }
        function sortCards(list) {
            const mode = sortSelect ? sortSelect.value : 'default';
            return list.slice().sort(function (a, b) {
                if (mode === 'heat') {
                    return Number(b.dataset.heat || 0) - Number(a.dataset.heat || 0);
                }
                if (mode === 'year') {
                    return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                }
                if (mode === 'title') {
                    return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN');
                }
                return Number(a.dataset.originalOrder || 0) - Number(b.dataset.originalOrder || 0);
            });
        }
        function render() {
            const visible = sortCards(cards.filter(matches));
            cards.forEach(function (card) {
                card.hidden = true;
            });
            visible.forEach(function (card) {
                card.hidden = false;
                container.appendChild(card);
            });
            if (countNode) {
                countNode.textContent = String(visible.length);
            }
            if (emptyNode) {
                emptyNode.hidden = visible.length !== 0;
            }
        }
        [searchInput, regionSelect, typeSelect, yearSelect, sortSelect].forEach(function (node) {
            if (node) {
                node.addEventListener('input', render);
                node.addEventListener('change', render);
            }
        });
        render();
    }

    function setupHeroSlider() {
        const root = document.querySelector('[data-hero-slider]');
        if (!root) {
            return;
        }
        const slides = Array.from(root.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(root.querySelectorAll('[data-hero-dot]'));
        const prev = root.querySelector('[data-hero-prev]');
        const next = root.querySelector('[data-hero-next]');
        if (slides.length < 2) {
            return;
        }
        let index = 0;
        let timer = null;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileNavigation();
        setupGlobalSearch();
        setupPageFilters();
        setupHeroSlider();
    });
})();

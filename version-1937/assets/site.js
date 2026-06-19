const $all = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function initMenu() {
  const button = document.querySelector('[data-menu-button]');
  const menu = document.querySelector('[data-menu]');
  if (!button || !menu) return;
  button.addEventListener('click', () => {
    menu.classList.toggle('is-open');
  });
}

function initHero() {
  const slides = $all('[data-hero-slide]');
  const dots = $all('[data-hero-dot]');
  if (!slides.length) return;
  let active = 0;
  const show = index => {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === active));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === active));
  };
  dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));
  setInterval(() => show(active + 1), 5200);
}

function initFilters() {
  const inputs = $all('[data-search-input]');
  const cards = $all('[data-title]');
  const empty = document.querySelector('[data-empty]');
  const buttons = $all('[data-filter]');
  if (!cards.length) return;
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';
  let query = initialQuery.trim().toLowerCase();
  let filter = '';
  inputs.forEach(input => {
    input.value = initialQuery;
    input.addEventListener('input', () => {
      query = input.value.trim().toLowerCase();
      apply();
    });
  });
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      filter = (button.dataset.filter || '').toLowerCase();
      buttons.forEach(item => item.classList.toggle('is-active', item === button));
      apply();
    });
  });
  function apply() {
    let visible = 0;
    cards.forEach(card => {
      const haystack = `${card.dataset.title || ''} ${card.dataset.region || ''} ${card.dataset.genre || ''} ${card.dataset.tags || ''}`.toLowerCase();
      const okQuery = !query || haystack.includes(query);
      const okFilter = !filter || haystack.includes(filter);
      const ok = okQuery && okFilter;
      card.style.display = ok ? '' : 'none';
      if (ok) visible += 1;
    });
    if (empty) empty.style.display = visible ? 'none' : 'block';
  }
  apply();
}

async function prepareVideo(video, source) {
  if (!source) return;
  if (video.dataset.ready === '1') return;
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
  } else {
    try {
      const module = await import('./hls-dru42stk.js');
      const Hls = module.H;
      if (Hls && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video.hlsInstance = hls;
      } else {
        video.src = source;
      }
    } catch (error) {
      video.src = source;
    }
  }
  video.dataset.ready = '1';
}

function initPlayers() {
  $all('[data-video-url]').forEach(shell => {
    const video = shell.querySelector('video');
    const button = shell.querySelector('[data-play-button]');
    const source = shell.dataset.videoUrl;
    if (!video || !button || !source) return;
    const start = async () => {
      await prepareVideo(video, source);
      button.hidden = true;
      try {
        await video.play();
      } catch (error) {
        button.hidden = false;
      }
    };
    button.addEventListener('click', start);
    video.addEventListener('play', () => {
      button.hidden = true;
    });
    video.addEventListener('pause', () => {
      if (!video.ended) button.hidden = false;
    });
  });
}

initMenu();
initHero();
initFilters();
initPlayers();

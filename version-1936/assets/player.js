(function () {
  function getHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    try {
      return import('./hls.js').then(function (module) {
        return module.H;
      }).catch(function () {
        return null;
      });
    } catch (error) {
      return Promise.resolve(null);
    }
  }

  window.initMoviePlayer = function (videoId, buttonId, sourceUrl) {
    const video = document.getElementById(videoId);
    const button = document.getElementById(buttonId);
    if (!video || !button || !sourceUrl) {
      return;
    }

    let ready = false;
    let hlsInstance = null;

    const start = function () {
      button.classList.add('is-hidden');
      const playVideo = function () {
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            button.classList.remove('is-hidden');
          });
        }
      };

      if (ready) {
        playVideo();
        return;
      }

      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
        video.load();
        return;
      }

      getHls().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          hlsInstance = new Hls();
          hlsInstance.loadSource(sourceUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(Hls.Events.MANIFEST_PARSED, playVideo);
        } else {
          video.src = sourceUrl;
          video.addEventListener('loadedmetadata', playVideo, { once: true });
          video.load();
        }
      });
    };

    button.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  };
})();

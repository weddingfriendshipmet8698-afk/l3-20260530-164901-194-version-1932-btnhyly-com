(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var videos = document.querySelectorAll('video[data-hls-src]');

    videos.forEach(function (video) {
      var source = video.getAttribute('data-hls-src');
      var shell = video.closest('.player-shell');
      var button = shell ? shell.querySelector('.player-start') : null;
      var loaded = false;
      var hlsInstance = null;

      function bindSource() {
        if (loaded || !source) {
          return;
        }

        loaded = true;

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);

          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }

            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
              return;
            }

            if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
              return;
            }

            hlsInstance.destroy();
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          video.src = source;
        }
      }

      function startPlayback() {
        bindSource();
        if (button) {
          button.classList.add('is-hidden');
        }
        var playAttempt = video.play();
        if (playAttempt && typeof playAttempt.catch === 'function') {
          playAttempt.catch(function () {
            if (button) {
              button.classList.remove('is-hidden');
            }
          });
        }
      }

      if (button) {
        button.addEventListener('click', startPlayback);
      }

      video.addEventListener('play', bindSource, { once: true });
      video.addEventListener('playing', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
    });
  });
})();

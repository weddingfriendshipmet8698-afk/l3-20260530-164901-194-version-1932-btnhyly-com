(function () {
  function setupMoviePlayer(source) {
    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-player-overlay]");
    if (!video || !source) {
      return;
    }

    var loaded = false;
    var hlsInstance = null;

    function attachSource() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        return;
      }
      video.src = source;
    }

    function startPlayback() {
      attachSource();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var playResult = video.play();
      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", startPlayback);
    }

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });

    video.addEventListener("click", function () {
      if (!loaded) {
        startPlayback();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;
})();

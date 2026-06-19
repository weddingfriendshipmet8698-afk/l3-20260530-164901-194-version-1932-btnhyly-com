import { H as Hls } from './hls.js';

function initializePlayer(shell) {
    const video = shell.querySelector('video');
    const button = shell.querySelector('[data-play-button]');
    if (!video || !button) {
        return;
    }
    const sourceNode = video.querySelector('source');
    const source = video.dataset.source || (sourceNode ? sourceNode.src : '');
    let hls = null;
    let attached = false;

    function attachSource() {
        if (attached || !source) {
            return Promise.resolve();
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.load();
            attached = true;
            return Promise.resolve();
        }
        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            attached = true;
            return new Promise(function (resolve) {
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    resolve();
                });
                hls.on(Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal && hls) {
                        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                        }
                    }
                });
            });
        }
        video.src = source;
        video.load();
        attached = true;
        return Promise.resolve();
    }

    async function startPlayback() {
        button.hidden = true;
        try {
            await attachSource();
            await video.play();
        } catch (error) {
            button.hidden = false;
        }
    }

    button.addEventListener('click', function (event) {
        event.preventDefault();
        startPlayback();
    });

    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        }
    });

    video.addEventListener('play', function () {
        button.hidden = true;
    });

    video.addEventListener('ended', function () {
        button.hidden = false;
    });

    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-player]').forEach(initializePlayer);
});

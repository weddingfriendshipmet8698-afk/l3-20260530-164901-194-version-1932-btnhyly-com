import { H as Hls } from './video-vendor-dru42stk.js';

function updateStatus(box, message) {
  if (box) {
    box.textContent = message || '';
  }
}

function initPlayer(panel) {
  var video = panel.querySelector('video');
  var playButton = panel.querySelector('[data-play-source]');
  var status = panel.querySelector('[data-player-status]');

  if (!video || !playButton) {
    return;
  }

  var source = playButton.getAttribute('data-play-source') || video.getAttribute('data-src');
  var hlsInstance = null;

  playButton.addEventListener('click', function () {
    if (!source) {
      updateStatus(status, '当前页面未绑定播放源。');
      return;
    }

    updateStatus(status, '正在初始化播放器...');
    playButton.style.display = 'none';

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.play().catch(function () {
        updateStatus(status, '播放器已加载，请再次点击视频播放。');
      });
      return;
    }

    if (Hls && Hls.isSupported()) {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        updateStatus(status, '播放源已加载。');
        video.play().catch(function () {
          updateStatus(status, '播放源已加载，请点击视频控件开始播放。');
        });
      });
      hlsInstance.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          updateStatus(status, '播放源连接失败，请检查 m3u8 文件路径或网络权限。');
        }
      });
      return;
    }

    updateStatus(status, '当前浏览器不支持 HLS 播放。');
  });
}

document.querySelectorAll('[data-player]').forEach(initPlayer);

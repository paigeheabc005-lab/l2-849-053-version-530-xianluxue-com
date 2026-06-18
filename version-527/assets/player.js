function initPlayer(container) {
  var Hls = window.Hls;
  var video = container.querySelector('video[data-src]');
  var overlay = container.querySelector('[data-play-overlay]');
  var message = container.querySelector('[data-player-message]');
  var source = video ? video.getAttribute('data-src') : '';
  var hls = null;
  var prepared = false;

  if (!video || !source || !overlay) {
    return;
  }

  function showMessage(text) {
    if (!message) {
      return;
    }
    message.textContent = text;
    message.classList.add('is-visible');
  }

  function prepare() {
    if (prepared) {
      return true;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      prepared = true;
      return true;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          showMessage('当前浏览器暂时无法播放此影片');
        }
      });
      prepared = true;
      return true;
    }

    showMessage('当前浏览器暂时无法播放此影片');
    return false;
  }

  function start(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!prepare()) {
      return;
    }

    video.setAttribute('controls', 'controls');
    overlay.classList.add('is-hidden');

    var playResult = video.play();
    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(function () {
        overlay.classList.remove('is-hidden');
      });
    }
  }

  overlay.addEventListener('click', start);
  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    } else {
      video.pause();
    }
  });
  video.addEventListener('play', function () {
    overlay.classList.add('is-hidden');
  });
  video.addEventListener('ended', function () {
    overlay.classList.remove('is-hidden');
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}

document.querySelectorAll('[data-player]').forEach(initPlayer);

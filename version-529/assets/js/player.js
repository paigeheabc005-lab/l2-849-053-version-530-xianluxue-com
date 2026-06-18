(function () {
  function setupMoviePlayer(playerId, videoUrl) {
    var root = document.getElementById(playerId);
    if (!root) {
      return;
    }
    var video = root.querySelector("video");
    var overlay = root.querySelector("[data-player-toggle]");
    var message = root.querySelector("[data-player-message]");
    var attached = false;
    var attaching = false;
    var hls = null;

    function showMessage(text) {
      if (!message) {
        return;
      }
      message.textContent = text;
      message.classList.add("is-visible");
    }

    function attach() {
      if (attached) {
        return Promise.resolve();
      }
      if (attaching) {
        return new Promise(function (resolve) {
          var wait = window.setInterval(function () {
            if (attached) {
              window.clearInterval(wait);
              resolve();
            }
          }, 60);
        });
      }
      attaching = true;
      return new Promise(function (resolve, reject) {
        if (!videoUrl) {
          reject(new Error("empty"));
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = videoUrl;
          attached = true;
          resolve();
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(videoUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            attached = true;
            resolve();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              reject(new Error("load"));
            }
          });
          return;
        }
        video.src = videoUrl;
        attached = true;
        resolve();
      }).finally(function () {
        attaching = false;
      });
    }

    function play() {
      attach().then(function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        return video.play();
      }).catch(function () {
        showMessage("视频加载失败，请稍后重试");
      });
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    video.addEventListener("pause", function () {
      if (overlay && video.currentTime === 0) {
        overlay.classList.remove("is-hidden");
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;
})();

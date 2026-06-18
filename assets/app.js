(function () {
  'use strict';

  function setupHeader() {
    var header = document.querySelector('[data-header]');
    var button = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    function updateHeader() {
      if (!header) {
        return;
      }
      header.classList.toggle('is-scrolled', window.scrollY > 12);
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    if (button && mobileNav) {
      button.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }
  }

  function setupImageFallbacks() {
    var images = document.querySelectorAll('[data-fallback-image]');
    images.forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-hidden');
      });
    });
  }

  function setupHeroCarousel() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    if (slides.length <= 1) {
      return;
    }

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    startTimer();
  }

  function setupFiltering() {
    var inputs = document.querySelectorAll('.filter-input');

    inputs.forEach(function (input) {
      var section = input.closest('section') || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll('.filter-card'));
      var countNode = section.querySelector('[data-filter-count]');

      function applyFilter() {
        var keyword = input.value.trim().toLowerCase();
        var visibleCount = 0;

        cards.forEach(function (card) {
          var text = card.getAttribute('data-filter') || card.textContent.toLowerCase();
          var matched = !keyword || text.indexOf(keyword) !== -1;
          card.classList.toggle('is-hidden', !matched);
          if (matched) {
            visibleCount += 1;
          }
        });

        if (countNode) {
          countNode.textContent = visibleCount + ' 部内容';
        }
      }

      input.addEventListener('input', applyFilter);

      var params = new URLSearchParams(window.location.search);
      var initialKeyword = params.get('q');
      if (initialKeyword) {
        input.value = initialKeyword;
        applyFilter();
      }
    });
  }

  function setupPlayers() {
    var players = document.querySelectorAll('[data-video-player]');

    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play-button]');
      var message = player.querySelector('[data-player-message]');
      var source = player.getAttribute('data-src');
      var initialized = false;
      var hlsInstance = null;

      function setMessage(text) {
        if (message) {
          message.textContent = text || '';
        }
      }

      function initializeSource() {
        if (initialized || !video || !source) {
          return Promise.resolve();
        }
        initialized = true;

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setMessage('视频加载失败，请刷新页面或稍后重试。');
            }
          });
          return Promise.resolve();
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          return Promise.resolve();
        }

        setMessage('当前浏览器不支持 HLS 播放，请使用最新版 Chrome、Edge、Firefox 或 Safari。');
        return Promise.reject(new Error('HLS is not supported'));
      }

      function playVideo() {
        initializeSource()
          .then(function () {
            return video.play();
          })
          .then(function () {
            player.classList.add('is-playing');
          })
          .catch(function () {
            if (!message || !message.textContent) {
              setMessage('浏览器阻止了自动播放，请再次点击播放按钮。');
            }
          });
      }

      if (button) {
        button.addEventListener('click', playVideo);
      }

      if (video) {
        video.addEventListener('play', function () {
          player.classList.add('is-playing');
          setMessage('');
        });
        video.addEventListener('pause', function () {
          player.classList.remove('is-playing');
        });
        video.addEventListener('ended', function () {
          player.classList.remove('is-playing');
        });
      }

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupHeader();
    setupImageFallbacks();
    setupHeroCarousel();
    setupFiltering();
    setupPlayers();
  });
})();

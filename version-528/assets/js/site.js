(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHeroCarousel() {
    var root = document.querySelector('[data-hero]');

    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function activate(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        activate(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        activate(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        activate(index);
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    activate(0);
    start();
  }

  function setupImageFallback() {
    document.addEventListener('error', function (event) {
      var target = event.target;

      if (!target || target.tagName !== 'IMG') {
        return;
      }

      var frame = target.closest('.poster-frame, .detail-poster, .rank-cover');
      if (frame) {
        frame.classList.add('poster-missing');
      }
    }, true);
  }

  function setupFilters() {
    var panel = document.querySelector('[data-filter-panel]');

    if (!panel) {
      return;
    }

    var input = panel.querySelector('[data-filter-search]');
    var year = panel.querySelector('[data-filter-year]');
    var type = panel.querySelector('[data-filter-type]');
    var region = panel.querySelector('[data-filter-region]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
    var status = document.querySelector('[data-filter-status]');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function refresh() {
      var keyword = normalize(input && input.value);
      var yearValue = normalize(year && year.value);
      var typeValue = normalize(type && type.value);
      var regionValue = normalize(region && region.value);
      var count = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-region'),
          card.getAttribute('data-keywords')
        ].join(' '));

        var matched = true;
        matched = matched && (!keyword || haystack.indexOf(keyword) !== -1);
        matched = matched && (!yearValue || normalize(card.getAttribute('data-year')) === yearValue);
        matched = matched && (!typeValue || normalize(card.getAttribute('data-type')) === typeValue);
        matched = matched && (!regionValue || normalize(card.getAttribute('data-region')) === regionValue);

        card.style.display = matched ? '' : 'none';
        if (matched) {
          count += 1;
        }
      });

      if (status) {
        status.textContent = '当前显示 ' + count + ' 部影片';
      }
    }

    [input, year, type, region].forEach(function (control) {
      if (control) {
        control.addEventListener('input', refresh);
        control.addEventListener('change', refresh);
      }
    });

    refresh();
  }

  function cardTemplate(item) {
    return [
      '<article class="movie-card movie-card-compact">',
      '  <a href="' + item.url + '" class="card-link" aria-label="观看 ' + escapeHtml(item.title) + '">',
      '    <figure class="poster-frame">',
      '      <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '封面" loading="lazy">',
      '      <span class="rating-badge">★ ' + escapeHtml(item.rating) + '</span>',
      '      <span class="play-float">▶</span>',
      '    </figure>',
      '    <div class="card-body">',
      '      <span class="type-pill">' + escapeHtml(item.type) + '</span>',
      '      <h3>' + escapeHtml(item.title) + '</h3>',
      '      <p>' + escapeHtml(item.oneLine) + '</p>',
      '      <div class="card-meta">',
      '        <span>' + escapeHtml(item.year) + '</span>',
      '        <span>' + escapeHtml(item.duration) + '</span>',
      '        <span>' + escapeHtml(item.region) + '</span>',
      '      </div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupSiteSearch() {
    var input = document.querySelector('[data-site-search]');
    var results = document.querySelector('[data-search-results]');
    var empty = document.querySelector('[data-search-empty]');

    if (!input || !results || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function render() {
      var keyword = normalize(input.value);
      var pool = window.MOVIE_SEARCH_DATA;
      var matched = keyword
        ? pool.filter(function (item) {
            return normalize([
              item.title,
              item.region,
              item.type,
              item.year,
              item.genre,
              item.tags,
              item.oneLine
            ].join(' ')).indexOf(keyword) !== -1;
          }).slice(0, 80)
        : pool.slice(0, 24);

      results.innerHTML = matched.map(cardTemplate).join('');

      if (empty) {
        empty.classList.toggle('is-visible', matched.length === 0);
      }
    }

    input.addEventListener('input', render);
    render();
  }

  window.initMoviePlayer = function initMoviePlayer(options) {
    var video = document.querySelector(options.selector);
    var source = options.source;
    var button = document.querySelector(options.buttonSelector || '[data-play-button]');
    var overlay = document.querySelector(options.overlaySelector || '[data-player-overlay]');
    var message = document.querySelector(options.messageSelector || '[data-player-message]');
    var hls = null;

    if (!video || !source) {
      return;
    }

    function setMessage(text) {
      if (message) {
        message.textContent = text;
      }
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    function attachSource() {
      if (video.dataset.sourceReady === 'true') {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.dataset.sourceReady = 'true';
        setMessage('播放源已加载，可使用播放器控制栏观看。');
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video.dataset.sourceReady = 'true';
        setMessage('HLS 播放源已初始化，可使用播放器控制栏观看。');
        return;
      }

      video.src = source;
      video.dataset.sourceReady = 'true';
      setMessage('已尝试直接加载播放源，如无法播放请使用支持 HLS 的浏览器。');
    }

    function startPlayback() {
      attachSource();
      hideOverlay();
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          setMessage('浏览器阻止了自动播放，请再次点击播放器上的播放按钮。');
        });
      }
    }

    if (button) {
      button.addEventListener('click', startPlayback);
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }

    video.addEventListener('play', hideOverlay);
    video.addEventListener('error', function () {
      setMessage('播放源加载失败，请稍后重试或切换网络环境。');
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupImageFallback();
    setupFilters();
    setupSiteSearch();
  });
})();

(function () {
  var body = document.body;
  var navToggle = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      body.classList.toggle('nav-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
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

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        restart();
      });
    });

    showSlide(0);
    restart();
  }

  function getYearMatch(value, mode) {
    var year = parseInt(value, 10);
    if (!mode) {
      return true;
    }
    if (!Number.isFinite(year)) {
      return false;
    }
    if (mode === '2020') {
      return year >= 2020;
    }
    if (mode === '2010') {
      return year >= 2010 && year <= 2019;
    }
    if (mode === '2000') {
      return year >= 2000 && year <= 2009;
    }
    if (mode === 'older') {
      return year < 2000;
    }
    return true;
  }

  function applyFilter(root) {
    var queryInput = root.querySelector('[data-filter-input]');
    var regionSelect = root.querySelector('[data-region-filter]');
    var typeSelect = root.querySelector('[data-type-filter]');
    var yearSelect = root.querySelector('[data-year-filter]');
    var empty = root.querySelector('[data-filter-empty]');
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-card]'));
    var query = queryInput ? queryInput.value.trim().toLowerCase() : '';
    var region = regionSelect ? regionSelect.value : '';
    var type = typeSelect ? typeSelect.value : '';
    var yearMode = yearSelect ? yearSelect.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = card.getAttribute('data-haystack') || '';
      var cardRegion = card.getAttribute('data-region') || '';
      var cardType = card.getAttribute('data-type') || '';
      var cardYear = card.getAttribute('data-year') || '';
      var matched = true;

      if (query && haystack.indexOf(query) === -1) {
        matched = false;
      }
      if (region && cardRegion !== region) {
        matched = false;
      }
      if (type && cardType !== type) {
        matched = false;
      }
      if (!getYearMatch(cardYear, yearMode)) {
        matched = false;
      }

      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  document.querySelectorAll('[data-filter-root]').forEach(function (root) {
    var controls = root.querySelectorAll('[data-filter-input], [data-region-filter], [data-type-filter], [data-year-filter]');
    controls.forEach(function (control) {
      control.addEventListener('input', function () {
        applyFilter(root);
      });
      control.addEventListener('change', function () {
        applyFilter(root);
      });
    });

    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get('q');
    var input = root.querySelector('[data-filter-input]');
    if (input && queryValue) {
      input.value = queryValue;
    }
    applyFilter(root);
  });
})();

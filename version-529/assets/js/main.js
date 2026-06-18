(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initHeader() {
    var header = document.querySelector("[data-header]");
    var button = document.querySelector("[data-menu-button]");
    function updateHeader() {
      if (!header) {
        return;
      }
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    }
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    if (button) {
      button.addEventListener("click", function () {
        document.body.classList.toggle("menu-open");
      });
    }
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("is-active", position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("is-active", position === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }
    dots.forEach(function (dot, position) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(position);
        start();
      });
    });
    start();
  }

  function initCategoryFilter() {
    var input = document.querySelector("[data-filter-input]");
    var list = document.querySelector("[data-filter-list]");
    if (!input || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = card.getAttribute("data-search") || "";
        card.style.display = !query || haystack.indexOf(query) !== -1 ? "" : "none";
      });
    });
  }

  function renderSearchCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\">" +
      "<a class=\"poster-link\" href=\"movie/" + escapeHtml(item.file) + "\" aria-label=\"" + escapeHtml(item.title) + "\">" +
      "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "海报\" loading=\"lazy\">" +
      "<span class=\"poster-shade\"></span><span class=\"play-badge\">▶</span></a>" +
      "<div class=\"card-body\"><a class=\"card-title\" href=\"movie/" + escapeHtml(item.file) + "\">" + escapeHtml(item.title) + "</a>" +
      "<p class=\"card-meta\">" + escapeHtml(item.region) + " · " + escapeHtml(item.year) + " · " + escapeHtml(item.type) + "</p>" +
      "<p class=\"card-line\">" + escapeHtml(item.oneLine) + "</p>" +
      "<div class=\"tag-row\">" + tags + "</div></div></article>";
  }

  function initSearch() {
    var movies = window.SITE_MOVIES || [];
    var input = document.querySelector("[data-search-input]");
    var category = document.querySelector("[data-search-category]");
    var year = document.querySelector("[data-search-year]");
    var results = document.querySelector("[data-search-results]");
    var status = document.querySelector("[data-search-status]");
    if (!input || !category || !year || !results || !status) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var preset = params.get("q") || "";
    if (preset) {
      input.value = preset;
    }
    function update() {
      var query = input.value.trim().toLowerCase();
      var cat = category.value;
      var selectedYear = year.value;
      var matched = movies.filter(function (item) {
        var text = [item.title, item.region, item.type, item.year, item.genre, item.categoryName, (item.tags || []).join(" ")].join(" ").toLowerCase();
        if (query && text.indexOf(query) === -1) {
          return false;
        }
        if (cat && item.categorySlug !== cat) {
          return false;
        }
        if (selectedYear && String(item.year) !== selectedYear) {
          return false;
        }
        return true;
      }).slice(0, 96);
      if (!query && !cat && !selectedYear) {
        matched = movies.slice(0, 48);
      }
      results.innerHTML = matched.map(renderSearchCard).join("");
      status.textContent = matched.length ? "已匹配到相关剧目" : "没有匹配内容";
    }
    input.addEventListener("input", update);
    category.addEventListener("change", update);
    year.addEventListener("change", update);
    update();
  }

  ready(function () {
    initHeader();
    initHero();
    initCategoryFilter();
    initSearch();
  });
})();

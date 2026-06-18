(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector('[data-menu-button]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
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

        function show(index) {
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
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot') || 0));
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function setupLocalFilter() {
        var input = document.querySelector('[data-filter-input]');
        var list = document.querySelector('[data-filter-list]');
        if (!input || !list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-search]'));
        input.addEventListener('input', function () {
            var keyword = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                card.classList.toggle('hidden-by-filter', keyword && text.indexOf(keyword) === -1);
            });
        });
    }

    function cardTemplate(movie) {
        return [
            '<a class="movie-card" href="./' + escapeHtml(movie.file) + '">',
            '    <span class="poster-frame">',
            '        <img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '        <span class="year-pill">' + escapeHtml(movie.year) + '</span>',
            '    </span>',
            '    <span class="card-body">',
            '        <span class="badge-row"><span class="badge badge-soft">' + escapeHtml(movie.category) + '</span></span>',
            '        <strong>' + escapeHtml(movie.title) + '</strong>',
            '        <span class="card-desc">' + escapeHtml(movie.oneLine) + '</span>',
            '        <span class="card-meta"><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.region) + '</span></span>',
            '    </span>',
            '</a>'
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

    function setupSearchPage() {
        var input = document.querySelector('[data-search-input]');
        var results = document.querySelector('[data-search-results]');
        var summary = document.querySelector('[data-search-summary]');
        if (!input || !results || !window.SEARCH_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        input.value = initial;

        function render(query) {
            var keyword = query.trim().toLowerCase();
            if (!keyword) {
                results.innerHTML = '';
                if (summary) {
                    summary.textContent = '输入关键词后显示相关影片。';
                }
                return;
            }
            var matches = window.SEARCH_INDEX.filter(function (movie) {
                return movie.search.indexOf(keyword) !== -1;
            }).slice(0, 120);
            results.innerHTML = matches.map(cardTemplate).join('');
            if (summary) {
                summary.textContent = matches.length ? '以下为相关影片。' : '未找到相关影片。';
            }
        }

        render(initial);
        input.addEventListener('input', function () {
            render(input.value);
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupLocalFilter();
        setupSearchPage();
    });
}());

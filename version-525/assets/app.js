(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        initNavigation();
        initHero();
        initFilters();
        initPlayers();
        initHeaderSearch();
    });

    function initNavigation() {
        var toggle = document.querySelector(".nav-toggle");
        var nav = document.querySelector(".site-nav");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHeaderSearch() {
        var forms = document.querySelectorAll("[data-site-search]");
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input");
                var query = input ? input.value.trim() : "";
                var target = "./search.html";
                if (query) {
                    target += "?q=" + encodeURIComponent(query);
                }
                window.location.href = target;
            });
        });
    }

    function initHero() {
        var hero = document.querySelector(".hero");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
        var prev = hero.querySelector(".hero-arrow.prev");
        var next = hero.querySelector(".hero-arrow.next");
        var current = 0;
        var timer;
        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }
        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        var roots = document.querySelectorAll("[data-filter-root]");
        roots.forEach(function (root) {
            var input = root.querySelector("[data-search-input]");
            var yearSelect = root.querySelector("[data-year-select]");
            var regionSelect = root.querySelector("[data-region-select]");
            var cards = Array.prototype.slice.call(root.querySelectorAll("[data-filter-card]"));
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");
            if (query && input) {
                input.value = query;
            }
            function update() {
                var text = input ? input.value.trim().toLowerCase() : "";
                var year = yearSelect ? yearSelect.value : "";
                var region = regionSelect ? regionSelect.value : "";
                cards.forEach(function (card) {
                    var haystack = (card.getAttribute("data-search") || "").toLowerCase();
                    var cardYear = card.getAttribute("data-year") || "";
                    var cardRegion = card.getAttribute("data-region") || "";
                    var visible = true;
                    if (text && haystack.indexOf(text) === -1) {
                        visible = false;
                    }
                    if (year && cardYear !== year) {
                        visible = false;
                    }
                    if (region && cardRegion.indexOf(region) === -1) {
                        visible = false;
                    }
                    card.hidden = !visible;
                });
            }
            if (input) {
                input.addEventListener("input", update);
            }
            if (yearSelect) {
                yearSelect.addEventListener("change", update);
            }
            if (regionSelect) {
                regionSelect.addEventListener("change", update);
            }
            update();
        });
    }

    function initPlayers() {
        var shells = document.querySelectorAll(".player-shell[data-url]");
        shells.forEach(function (shell) {
            var video = shell.querySelector("video");
            var cover = shell.querySelector(".play-cover");
            var source = shell.getAttribute("data-url");
            if (!video || !source) {
                return;
            }
            bindStream(video, source);
            function start() {
                shell.classList.add("is-playing");
                if (cover) {
                    cover.setAttribute("hidden", "hidden");
                }
                var play = video.play();
                if (play && typeof play.catch === "function") {
                    play.catch(function () {});
                }
            }
            if (cover) {
                cover.addEventListener("click", start);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener("play", function () {
                shell.classList.add("is-playing");
                if (cover) {
                    cover.setAttribute("hidden", "hidden");
                }
            });
        });
    }

    function bindStream(video, source) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return;
        }
        var Hls = window.Hls;
        if (Hls && Hls.isSupported()) {
            var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video._hls = hls;
        } else {
            video.src = source;
        }
    }
})();

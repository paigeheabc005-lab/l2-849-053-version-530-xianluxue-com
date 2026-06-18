import { H as Hls } from "./hls-vendor-dru42stk.js";

const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

const carousel = document.querySelector("[data-hero-carousel]");

if (carousel) {
  const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
  const dots = Array.from(carousel.querySelectorAll(".hero-dot"));
  const previous = carousel.querySelector(".hero-prev");
  const next = carousel.querySelector(".hero-next");
  let active = 0;
  let timer = 0;

  const showSlide = (index) => {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === active);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === active);
    });
  };

  const restart = () => {
    window.clearInterval(timer);
    timer = window.setInterval(() => showSlide(active + 1), 5800);
  };

  previous?.addEventListener("click", () => {
    showSlide(active - 1);
    restart();
  });

  next?.addEventListener("click", () => {
    showSlide(active + 1);
    restart();
  });

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      showSlide(index);
      restart();
    });
  });

  restart();
}

const searchInputs = document.querySelectorAll("[data-movie-search]");

searchInputs.forEach((input) => {
  const scope = input.closest("main")?.querySelector("[data-search-scope]");
  const emptyState = input.closest("main")?.querySelector("[data-empty-state]");

  input.addEventListener("input", () => {
    const value = input.value.trim().toLowerCase();
    const items = Array.from(scope?.children || []);
    let visible = 0;

    items.forEach((item) => {
      const text =
        `${item.dataset.title || ""} ${item.dataset.keywords || ""}`.toLowerCase();
      const matched = !value || text.includes(value);
      item.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  });
});

const players = document.querySelectorAll(".video-player");

players.forEach((player) => {
  const video = player.querySelector("video");
  const overlay = player.querySelector(".play-overlay");
  const stream = player.dataset.stream;
  let hls = null;

  const start = () => {
    if (!video || !stream) {
      return;
    }

    if (video.dataset.ready !== "true") {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
        });
      } else {
        video.src = stream;
      }

      video.dataset.ready = "true";
    }

    player.classList.add("is-playing");
    video.play().catch(() => {});
  };

  overlay?.addEventListener("click", start);

  player.addEventListener("click", (event) => {
    if (event.target === video && video.paused) {
      start();
    }
  });

  video?.addEventListener("play", () => {
    player.classList.add("is-playing");
  });

  video?.addEventListener("pause", () => {
    if (video.currentTime === 0) {
      player.classList.remove("is-playing");
    }
  });

  window.addEventListener("pagehide", () => {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
});

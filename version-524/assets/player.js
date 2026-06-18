(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupPlayer() {
        var root = document.querySelector('[data-player]');
        if (!root) {
            return;
        }
        var video = root.querySelector('video');
        var button = root.querySelector('[data-play-button]');
        var streamUrl = root.getAttribute('data-stream');
        var hls = null;

        if (!video || !streamUrl) {
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                    return;
                }
                hls.destroy();
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        }

        function playVideo() {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', playVideo);
        }

        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('is-hidden');
            }
        });

        video.addEventListener('pause', function () {
            if (button && video.currentTime === 0) {
                button.classList.remove('is-hidden');
            }
        });
    }

    ready(setupPlayer);
}());

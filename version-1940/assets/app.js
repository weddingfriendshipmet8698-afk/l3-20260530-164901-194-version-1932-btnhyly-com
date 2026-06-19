(function () {
    var body = document.body;
    var mobileToggle = document.querySelector(".mobile-toggle");
    var mobileMenu = document.querySelector(".mobile-menu");

    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener("click", function () {
            var open = mobileMenu.classList.toggle("open");
            body.classList.toggle("menu-open", open);
            mobileToggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    document.querySelectorAll("form.search-form").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var input = form.querySelector("input[type='search'], input[type='text']");
            var value = input ? input.value.trim() : "";
            var target = "search.html";
            if (value) {
                target += "?q=" + encodeURIComponent(value);
            }
            window.location.href = target;
        });
    });

    var backToTop = document.querySelector(".back-to-top");
    if (backToTop) {
        window.addEventListener("scroll", function () {
            backToTop.classList.toggle("show", window.scrollY > 460);
        });
        backToTop.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    var carousel = document.querySelector(".hero-carousel");
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
        var index = 0;
        var timer = null;

        function setSlide(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                setSlide(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                setSlide(dotIndex);
                start();
            });
        });

        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        setSlide(0);
        start();
    }

    function norm(value) {
        return (value || "").toString().toLowerCase().replace(/\s+/g, "");
    }

    function applyFilter(input, cards, empty) {
        var keyword = norm(input.value);
        var visible = 0;

        cards.forEach(function (card) {
            var text = norm(card.getAttribute("data-search") || card.textContent);
            var matched = !keyword || text.indexOf(keyword) !== -1;
            card.style.display = matched ? "" : "none";
            if (matched) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle("show", visible === 0);
        }
    }

    document.querySelectorAll("[data-filter-input]").forEach(function (input) {
        var scopeId = input.getAttribute("data-filter-input");
        var scope = scopeId ? document.getElementById(scopeId) : document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-search]"));
        var empty = document.querySelector("[data-empty-for='" + scopeId + "']");

        input.addEventListener("input", function () {
            applyFilter(input, cards, empty);
        });
    });

    var searchPage = document.querySelector("[data-search-page]");
    if (searchPage) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";
        var input = document.querySelector("[data-filter-input='search-results']");
        if (input) {
            input.value = q;
            input.dispatchEvent(new Event("input"));
            if (q) {
                input.focus();
            }
        }
    }

    document.querySelectorAll(".player-shell").forEach(function (player) {
        var stream = player.getAttribute("data-stream");
        var video = player.querySelector("video");
        var startButton = player.querySelector(".player-start");
        var cover = player.querySelector(".player-cover");
        var hlsPlayer = null;
        var attached = false;

        if (!stream || !video) {
            return;
        }

        function attachVideo() {
            if (attached) {
                return Promise.resolve();
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                attached = true;
                return Promise.resolve();
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsPlayer = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });

                hlsPlayer.loadSource(stream);
                hlsPlayer.attachMedia(video);
                player.hlsPlayer = hlsPlayer;
                attached = true;

                return new Promise(function (resolve) {
                    var settled = false;

                    function done() {
                        if (!settled) {
                            settled = true;
                            resolve();
                        }
                    }

                    hlsPlayer.on(window.Hls.Events.MANIFEST_PARSED, done);
                    window.setTimeout(done, 1200);
                });
            }

            video.src = stream;
            attached = true;
            return Promise.resolve();
        }

        function playVideo() {
            player.classList.add("is-playing");
            attachVideo().then(function () {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {
                        player.classList.remove("is-playing");
                    });
                }
            });
        }

        function toggleVideo(event) {
            if (event) {
                event.preventDefault();
            }
            if (video.paused) {
                playVideo();
            } else {
                video.pause();
            }
        }

        if (startButton) {
            startButton.addEventListener("click", playVideo);
        }

        if (cover) {
            cover.addEventListener("click", playVideo);
        }

        video.addEventListener("click", toggleVideo);
        video.addEventListener("play", function () {
            player.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
            if (video.currentTime <= 0 || video.ended) {
                player.classList.remove("is-playing");
            }
        });
        video.addEventListener("ended", function () {
            player.classList.remove("is-playing");
        });
    });
})();

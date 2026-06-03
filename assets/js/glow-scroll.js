/* ==========================================================================
   GLOW — scroll interactions: reveal, parallax, hero fade, progress bar
   Vanilla JS, no dependencies. No-ops gracefully on pages without the hero.
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    /* ---- Scroll progress bar (all pages) ---- */
    var bar = document.createElement("div");
    bar.className = "glow-progress";
    document.body.appendChild(bar);

    /* ---- Scroll-reveal via IntersectionObserver ---- */
    var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    if (revealEls.length) {
      if (reduceMotion || !("IntersectionObserver" in window)) {
        revealEls.forEach(function (el) { el.classList.add("in"); });
      } else {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("in");
              io.unobserve(entry.target);
            }
          });
        }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
        revealEls.forEach(function (el) { io.observe(el); });
      }
    }

    /* ---- Portfolio "Read more" toggles ---- */
    var pcards = Array.prototype.slice.call(document.querySelectorAll(".glow-pcard"));
    pcards.forEach(function (card) {
      var desc = card.querySelector(".glow-pcard__desc");
      var btn = card.querySelector(".glow-pcard__more");
      if (!desc || !btn) return;
      // Only show the toggle if the text is actually clamped/overflowing.
      if (desc.scrollHeight - desc.clientHeight > 4) {
        btn.hidden = false;
        btn.addEventListener("click", function () {
          var open = card.classList.toggle("is-open");
          btn.textContent = open ? "Show less" : "Read more";
        });
      }
    });

    var heroFade = document.querySelector("[data-hero-fade]");
    var hero = document.getElementById("hero");
    var mouseEls = Array.prototype.slice.call(document.querySelectorAll("[data-mouse]"));

    /* ---- Scroll-driven: progress bar + hero fade (cheap, rAF-throttled) ---- */
    var scrollTicking = false;
    function onScroll() {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (docH > 0 ? Math.min(y / docH, 1) : 0) + ")";
      if (!reduceMotion && heroFade && hero) {
        var vh = hero.offsetHeight || window.innerHeight;
        var p = Math.min(Math.max(y / (vh * 0.9), 0), 1);
        heroFade.style.opacity = String(1 - p * 0.92);
      }
      scrollTicking = false;
    }
    function requestScroll() {
      if (!scrollTicking) { scrollTicking = true; window.requestAnimationFrame(onScroll); }
    }
    window.addEventListener("scroll", requestScroll, { passive: true });
    window.addEventListener("resize", requestScroll);
    onScroll();

    /* ---- Mouse parallax: continuous eased loop so it's always buttery, never
            "only moves when the mouse stops". Targets are light elements only. ---- */
    if (!reduceMotion && mouseEls.length && window.matchMedia("(pointer: fine)").matches) {
      var tx = 0, ty = 0, cx = 0, cy = 0, running = false;

      function loop() {
        cx += (tx - cx) * 0.075;   // ease current toward target
        cy += (ty - cy) * 0.075;
        for (var i = 0; i < mouseEls.length; i++) {
          var el = mouseEls[i];
          var m = parseFloat(el.getAttribute("data-mouse")) || 0;
          el.style.transform =
            "translate3d(" + (cx * m * 1600).toFixed(2) + "px," + (cy * m * 1600).toFixed(2) + "px,0)";
        }
        if (Math.abs(tx - cx) > 0.0004 || Math.abs(ty - cy) > 0.0004) {
          window.requestAnimationFrame(loop);
        } else {
          running = false;
        }
      }

      window.addEventListener("mousemove", function (e) {
        tx = (e.clientX / window.innerWidth) - 0.5;
        ty = (e.clientY / window.innerHeight) - 0.5;
        if (!running) { running = true; window.requestAnimationFrame(loop); }
      }, { passive: true });
    }
  });
})();

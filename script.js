/* =========================
   CLB Robot & Technology JS
   Responsive + Stats JSON
========================= */

function $(s, p) { return (p || document).querySelector(s); }
function $$(s, p) { return Array.prototype.slice.call((p || document).querySelectorAll(s)); }

// ===== Mobile nav =====
(function mobileNav() {
  var navToggle = $("#navToggle");
  var navList = $("#navList");
  if (!navToggle || !navList) return;

  navToggle.addEventListener("click", function () {
    var open = navList.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });

  $$(".nav__link", navList).forEach(function (a) {
    a.addEventListener("click", function () {
      navList.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("click", function (e) {
    if (!navList.classList.contains("open")) return;
    var isInside = navList.contains(e.target) || navToggle.contains(e.target);
    if (!isInside) {
      navList.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
})();

// ===== Typing effect =====
(function typingEffect() {
  var typingEl = $("#typing");
  if (!typingEl) return;

  var motto = "“Dám nghĩ, dám làm, dám chịu trách nhiệm.”";
  var i = 0;

  function tick() {
    typingEl.textContent = motto.slice(0, i);
    i += 1;
    if (i <= motto.length) requestAnimationFrame(tick);
  }
  tick();
})();

// ===== Reveal on scroll =====
(function revealOnScroll() {
  var revealEls = $$(".reveal");
  if (!revealEls.length) return;

  if (!("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
    });
  }, { threshold: 0.14 });

  revealEls.forEach(function (el) { io.observe(el); });
})();

// ===== Active nav link (scroll spy) =====
(function scrollSpy() {
  var ids = ["gioi-thieu", "tam-nhin", "hoat-dong", "san-choi", "tham-gia", "lien-he"];
  var sections = ids.map(function (id) { return document.getElementById(id); }).filter(Boolean);
  var navLinks = $$(".nav__link");
  if (!sections.length || !navLinks.length) return;

  function setActive(id) {
    navLinks.forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("href") === ("#" + id));
    });
  }

  if (!("IntersectionObserver" in window)) {
    window.addEventListener("scroll", function () {
      var best = null, bestDist = Infinity;
      sections.forEach(function (sec) {
        var r = sec.getBoundingClientRect();
        var d = Math.abs(r.top - 120);
        if (d < bestDist) { bestDist = d; best = sec; }
      });
      if (best) setActive(best.id);
    });
    return;
  }

  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      setActive(entry.target.id);
    });
  }, { threshold: 0.35 });

  sections.forEach(function (sec) { spy.observe(sec); });
})();

// ===== Copy buttons =====
(function copyButtons() {
  var toast = $("#copyToast");
  var buttons = $$("[data-copy]");
  if (!buttons.length) return;

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    setTimeout(function () { toast.textContent = ""; }, 1200);
  }

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy") || "";
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
          .then(function () { showToast("Đã copy ✅"); })
          .catch(function () { fallbackCopy(text); showToast("Đã copy ✅"); });
      } else {
        fallbackCopy(text);
        showToast("Đã copy ✅");
      }
    });
  });
})();

// ===== Back to top (FIX) + Anchor #top =====
(function backToTop() {
  var toTop = $("#toTop");

  function goTop(e) {
    if (e) e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  window.addEventListener("scroll", function () {
    if (!toTop) return;
    if (window.scrollY > 500) toTop.classList.add("show");
    else toTop.classList.remove("show");
  });

  if (toTop) toTop.addEventListener("click", goTop);

  $$('a[href="#top"]').forEach(function (a) {
    a.addEventListener("click", goTop);
  });
})();

// ===== Footer year =====
(function footerYear() {
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();

// ===== 3D Tilt effect (no lib) =====
(function tiltCards() {
  var tiltEls = $$("[data-tilt]");
  if (!tiltEls.length) return;

  function attachTilt(el) {
    var max = 10;

    function onEnter() { el.style.transition = "transform .12s ease"; }
    function onLeave() {
      el.style.transition = "transform .25s ease";
      el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)";
    }
    function onMove(ev) {
      var r = el.getBoundingClientRect();
      var px = (ev.clientX - r.left) / r.width;
      var py = (ev.clientY - r.top) / r.height;
      var ry = (px - 0.5) * (max * 2);
      var rx = (0.5 - py) * (max * 2);

      el.style.transform =
        "perspective(900px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg) translateZ(6px)";
    }

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("touchstart", function () {}, { passive: true });
  }

  tiltEls.forEach(attachTilt);
})();

// ===== Stats from JSON (label + value) + render + animate =====
(function statsFromJsonLabels() {
  var box = document.getElementById("stats");
  if (!box) return;

  function formatNumber(n) {
    try { return new Intl.NumberFormat("vi-VN").format(n); }
    catch (e) { return String(n); }
  }

  function animateCount(el, to, duration) {
    duration = duration || 900;
    var start = performance.now();
    var from = 0;

    function step(t) {
      var p = Math.min((t - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(from + (to - from) * eased);
      el.textContent = formatNumber(val);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function renderStats(items) {
    box.innerHTML = "";

    items.forEach(function (it) {
      var stat = document.createElement("div");
      stat.className = "stat";

      var num = document.createElement("div");
      num.className = "stat__num";
      num.setAttribute("data-count", String(Number(it.value || 0)));
      num.textContent = "0";

      var label = document.createElement("div");
      label.className = "stat__label";
      label.textContent = String(it.label || "");

      stat.appendChild(num);
      stat.appendChild(label);
      box.appendChild(stat);
    });
  }

  function animateWhenVisible() {
    var nums = box.querySelectorAll(".stat__num[data-count]");
    if (!nums.length) return;

    function startOnce() {
      nums.forEach(function (el) {
        var to = Number(el.getAttribute("data-count") || "0");
        animateCount(el, to, 950);
      });
    }

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          startOnce();
          io.disconnect();
        });
      }, { threshold: 0.35 });
      io.observe(box);
    } else {
      startOnce();
    }
  }

  fetch("stats.json", { cache: "no-store" })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var items = (data && data.stats) ? data.stats : [];
      if (!Array.isArray(items) || !items.length) return;

      renderStats(items);
      animateWhenVisible();
    })
    .catch(function () {
      // Nếu mở file bằng file:/// có thể fetch bị chặn
    });
})();

// ===== Stars canvas (lightweight) =====
(function starsCanvas() {
  var canvas = document.getElementById("stars");
  if (!canvas) return;

  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var w = 0, h = 0;
  var stars = [];

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function resize() {
    var dpr = window.devicePixelRatio || 1;
    w = canvas.width = Math.floor(window.innerWidth * dpr);
    h = canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = "100%";
    canvas.style.height = "100%";

    var count = Math.min(240, Math.floor((w * h) / 250000));
    stars = new Array(count).fill(0).map(function () {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        r: rand(0.3, 1.5) * dpr,
        v: rand(0.05, 0.30) * dpr,
        a: rand(0.2, 0.8)
      };
    });
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();

  function tick() {
    ctx.clearRect(0, 0, w, h);

    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      s.y += s.v;
      if (s.y > h) { s.y = -10; s.x = Math.random() * w; }

      ctx.globalAlpha = s.a;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(tick);
  }

  tick();
})();

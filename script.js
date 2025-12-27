/* =========================
   CLB Robot & Technology JS
   - Responsive nav
   - Reveal / scrollspy
   - Copy buttons
   - Back-to-top
   - Footer year
   - Tilt (no lib)
   - Stars canvas
   - ✅ Stats from stats.json (value OR auto-compute from other JSON)
   - ✅ Lightbox modal for images (click thumb => popup + prev/next)
========================= */

(function () {
  "use strict";

  // -------------------------
  // Utils
  // -------------------------
  function $(s, p) { return (p || document).querySelector(s); }
  function $$(s, p) { return Array.prototype.slice.call((p || document).querySelectorAll(s)); }

  function escHTML(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function norm(s) { return String(s || "").toLowerCase().trim(); }

  // Lấy base URL theo vị trí file script.js (để fetch đúng cả khi trang nằm trong /Members/...)
  function getScriptBaseURL() {
    var cs = document.currentScript;
    if (!cs) {
      var scripts = document.getElementsByTagName("script");
      cs = scripts[scripts.length - 1];
    }
    try {
      return new URL(".", cs && cs.src ? cs.src : window.location.href);
    } catch (e) {
      return new URL(".", window.location.href);
    }
  }
  var SCRIPT_BASE = getScriptBaseURL();

  function resolveFromScriptBase(path) {
    try { return new URL(String(path || ""), SCRIPT_BASE).toString(); }
    catch (e) { return String(path || ""); }
  }

  function fetchJSON(url) {
    return fetch(url, { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error(url); return r.json(); })
      .catch(function () { return null; });
  }

  // -------------------------
  // Mobile nav
  // -------------------------
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

  // -------------------------
  // Typing effect
  // -------------------------
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

  // -------------------------
  // Reveal on scroll
  // -------------------------
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

  // -------------------------
  // Scroll spy (only for same-page #anchors)
  // -------------------------
  (function scrollSpy() {
    var navLinks = $$(".nav__link").filter(function (a) {
      var href = a.getAttribute("href") || "";
      return href.startsWith("#");
    });

    if (!navLinks.length) return;

    var sections = navLinks
      .map(function (a) {
        var id = (a.getAttribute("href") || "").slice(1);
        return document.getElementById(id);
      })
      .filter(Boolean);

    if (!sections.length) return;

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
      }, { passive: true });
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

  // -------------------------
  // Copy buttons
  // -------------------------
  (function copyButtons() {
    var toast = $("#copyToast");
    var buttons = $$("[data-copy]");
    if (!buttons.length) return;

    // nếu trang không có #copyToast => tạo toast mini
    if (!toast) {
      toast = document.createElement("span");
      toast.id = "copyToast";
      toast.className = "copyToast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      toast.style.display = "inline-block";
      toast.style.marginLeft = "10px";
      toast.style.color = "rgba(234,240,255,.85)";
      document.body.appendChild(toast);
      toast.style.position = "fixed";
      toast.style.bottom = "16px";
      toast.style.left = "50%";
      toast.style.transform = "translateX(-50%)";
      toast.style.padding = "10px 12px";
      toast.style.borderRadius = "999px";
      toast.style.border = "1px solid rgba(255,255,255,.14)";
      toast.style.background = "rgba(10,14,28,.75)";
      toast.style.backdropFilter = "blur(8px)";
      toast.style.zIndex = "9999";
      toast.style.pointerEvents = "none";
      toast.style.opacity = "0";
      toast.style.transition = "opacity .15s ease";
    }

    var toastTimer = null;

    function showToast(msg) {
      if (!toast) return;
      toast.textContent = msg;

      // nếu là toast tự tạo
      if (toast.style && toast.style.opacity !== undefined) toast.style.opacity = "1";

      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () {
        toast.textContent = "";
        if (toast.style && toast.style.opacity !== undefined) toast.style.opacity = "0";
      }, 1200);
    }

    function fallbackCopy(text) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta);
    }

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var text = btn.getAttribute("data-copy") || "";
        if (!text) return;

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

  // -------------------------
  // Back to top + #top anchors
  // -------------------------
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
    }, { passive: true });

    if (toTop) toTop.addEventListener("click", goTop);

    $$('a[href="#top"]').forEach(function (a) {
      a.addEventListener("click", goTop);
    });
  })();

  // -------------------------
  // Footer year
  // -------------------------
  (function footerYear() {
    var yearEl = $("#year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  })();

  // -------------------------
  // Tilt effect (no lib)
  // -------------------------
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

  // -------------------------
  // ✅ Stats: from stats.json (value OR auto-compute from other JSON)
  // - stats.json đặt ở ROOT (cùng cấp index.html)
  // - url trong source cũng tính từ ROOT/script.js
  // -------------------------
  (function statsFromConfig() {
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

    function getByPath(obj, path) {
      if (!path) return obj;
      var cur = obj;
      String(path).split(".").forEach(function (k) {
        if (!cur) return;
        cur = cur[k];
      });
      return cur;
    }

    function computeValue(source, data) {
      if (!source || !data) return null;

      // members_total: hỗ trợ {groups:[{members:[]}]} hoặc {members:[]}
      if (source.type === "members_total") {
        if (Array.isArray(data.groups)) {
          return data.groups.reduce(function (sum, g) {
            return sum + (Array.isArray(g.members) ? g.members.length : 0);
          }, 0);
        }
        if (Array.isArray(data.members)) return data.members.length;
        return 0;
      }

      // array_len: đếm độ dài mảng theo path (vd "items")
      if (source.type === "array_len") {
        var arr = getByPath(data, source.path || "");
        return Array.isArray(arr) ? arr.length : 0;
      }

      // count_where: đếm phần tử thỏa field == eq trong mảng path
      if (source.type === "count_where") {
        var list = getByPath(data, source.path || "");
        if (!Array.isArray(list)) return 0;

        var w = source.where || {};
        var field = String(w.field || "");
        var eq = String(w.eq || "");

        return list.filter(function (x) {
          return String(x && x[field]) === eq;
        }).length + 1;
      }

      // count_where_includes: field là array/string và chứa keyword
      if (source.type === "count_where_includes") {
        var list2 = getByPath(data, source.path || "");
        if (!Array.isArray(list2)) return 0;

        var w2 = source.where || {};
        var field2 = String(w2.field || "");
        var kw = String(w2.includes || "");

        return list2.filter(function (x) {
          var v = x && x[field2];
          if (Array.isArray(v)) return v.map(String).indexOf(kw) !== -1;
          return String(v || "").indexOf(kw) !== -1;
        }).length;
      }

      return null;
    }

    function renderStats(items) {
      box.innerHTML = "";

      items.forEach(function (it) {
        var href = it.href ? String(it.href) : "";
        var isLink = !!href;

        var stat = document.createElement(isLink ? "a" : "div");
        stat.className = "stat" + (isLink ? " stat--link" : "");
        if (isLink) {
          stat.setAttribute("href", href);
          stat.setAttribute("aria-label", String(it.label || "Mở liên kết"));
          if (/^https?:\/\//i.test(href)) {
            stat.setAttribute("target", "_blank");
            stat.setAttribute("rel", "noopener");
          }
        }

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

      var started = false;
      function startOnce() {
        if (started) return;
        started = true;
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

    // stats.json luôn lấy từ ROOT dựa theo SCRIPT_BASE
    var statsUrl = resolveFromScriptBase("stats.json");

    fetchJSON(statsUrl).then(function (cfg) {
      var stats = (cfg && Array.isArray(cfg.stats)) ? cfg.stats : [];
      if (!stats.length) return;

      var jobs = stats.map(function (s) {
        var fallback = Number(s.value || 0);

        if (!s.source || !s.source.url) {
          s.value = fallback;
          return Promise.resolve(s);
        }

        var srcUrl = resolveFromScriptBase(String(s.source.url));
        return fetchJSON(srcUrl).then(function (data) {
          var computed = computeValue(s.source, data);
          s.value = (typeof computed === "number" && !isNaN(computed)) ? computed : fallback;
          return s;
        });
      });

      Promise.all(jobs).then(function (finalStats) {
        renderStats(finalStats);
        animateWhenVisible();
      });
    });
  })();

  // -------------------------
  // Stars canvas (lightweight)
  // -------------------------
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

  // -------------------------
  // ✅ Lightbox (Achievements images)
  // - Click on .achThumbBtn[data-img] to open popup
  // - Prev/Next buttons + arrow keys
  // - ESC / backdrop / close => close
  // - Auto inject modal + minimal CSS if not exist
  // -------------------------
  (function lightbox() {
    // kích hoạt nếu trang có thumbnails
    function hasThumbs() {
      return !!document.querySelector(".achThumbBtn[data-img], [data-img][data-lightbox]");
    }
    if (!hasThumbs()) return;

    // inject CSS once
    var cssId = "lightbox_css__clb";
    if (!document.getElementById(cssId)) {
      var st = document.createElement("style");
      st.id = cssId;
      st.textContent = [
        "body.lb-noScroll{overflow:hidden;}",
        ".lb{position:fixed;inset:0;z-index:9999;display:none;}",
        ".lb.is-open{display:block;}",
        ".lb__backdrop{position:absolute;inset:0;background:rgba(0,0,0,.70);backdrop-filter:blur(6px);}",
        ".lb__panel{position:relative;z-index:1;width:min(980px,calc(100% - 24px));margin:6vh auto 0;border-radius:18px;border:1px solid rgba(255,255,255,.14);background:rgba(10,14,28,.78);box-shadow:0 30px 80px rgba(0,0,0,.60);overflow:hidden;}",
        ".lb__img{display:block;width:100%;height:auto;max-height:78vh;object-fit:contain;background:rgba(0,0,0,.25);}",
        ".lb__close{position:absolute;top:10px;right:10px;width:42px;height:42px;border-radius:14px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.08);color:rgba(234,240,255,.92);display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:3;}",
        ".lb__nav{position:absolute;top:50%;transform:translateY(-50%);width:46px;height:46px;border-radius:16px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.08);color:rgba(234,240,255,.92);display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:3;}",
        ".lb__prev{left:10px;}",
        ".lb__next{right:10px;}",
        ".lb__caption{padding:10px 14px;color:rgba(234,240,255,.80);font-size:.95rem;line-height:1.5;border-top:1px solid rgba(255,255,255,.10);}",
        "@media (max-width:740px){.lb__nav{width:42px;height:42px;border-radius:14px;}}"
      ].join("");
      document.head.appendChild(st);
    }

    // inject modal HTML if not exist
    var modal = document.getElementById("lightboxModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "lightboxModal";
      modal.className = "lb";
      modal.setAttribute("aria-hidden", "true");
      modal.innerHTML =
        '<div class="lb__backdrop" data-lb-close="1"></div>' +
        '<div class="lb__panel" role="dialog" aria-modal="true" aria-label="Xem ảnh">' +
          '<button class="lb__close" type="button" aria-label="Đóng" data-lb-close="1">' +
            '<i class="fa-solid fa-xmark"></i>' +
          '</button>' +
          '<button class="lb__nav lb__prev" type="button" aria-label="Ảnh trước" data-lb-prev="1">' +
            '<i class="fa-solid fa-chevron-left"></i>' +
          '</button>' +
          '<button class="lb__nav lb__next" type="button" aria-label="Ảnh sau" data-lb-next="1">' +
            '<i class="fa-solid fa-chevron-right"></i>' +
          '</button>' +
          '<img class="lb__img" id="lightboxImg" src="" alt="Ảnh" />' +
          '<div class="lb__caption" id="lightboxCap"></div>' +
        '</div>';
      document.body.appendChild(modal);
    }

    var imgEl = document.getElementById("lightboxImg");
    var capEl = document.getElementById("lightboxCap");

    var state = {
      list: [],
      index: 0
    };

    function openAt(index) {
      if (!modal || !imgEl) return;
      if (!state.list.length) return;

      state.index = (index + state.list.length) % state.list.length;
      var item = state.list[state.index] || {};
      imgEl.src = item.src || "";
      imgEl.alt = item.alt || "Ảnh";
      if (capEl) capEl.textContent = item.caption || "";

      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("lb-noScroll");
    }

    function close() {
      if (!modal || !imgEl) return;
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      imgEl.src = "";
      if (capEl) capEl.textContent = "";
      document.body.classList.remove("lb-noScroll");
      state.list = [];
      state.index = 0;
    }

    function next() { openAt(state.index + 1); }
    function prev() { openAt(state.index - 1); }

    function collectFromSameCard(clickedBtn) {
      // ưu tiên lấy ảnh trong cùng card (vd: .achCard)
      var card = clickedBtn.closest("article") || clickedBtn.closest(".card") || clickedBtn.parentElement;
      var btns = card ? $$(".achThumbBtn[data-img]", card) : [];
      if (!btns.length) btns = $$("[data-img][data-lightbox]");

      var list = btns.map(function (b) {
        var img = $("img", b);
        return {
          src: b.getAttribute("data-img") || "",
          alt: img ? (img.getAttribute("alt") || "Ảnh") : "Ảnh",
          caption: b.getAttribute("data-caption") || ""
        };
      }).filter(function (x) { return !!x.src; });

      return { list: list, btns: btns };
    }

    // Event delegation
    document.addEventListener("click", function (e) {
      var btn = e.target.closest(".achThumbBtn[data-img], [data-img][data-lightbox]");
      if (btn) {
        e.preventDefault();

        var pack = collectFromSameCard(btn);
        state.list = pack.list;

        // tìm index của ảnh vừa click trong list
        var clickedSrc = btn.getAttribute("data-img") || "";
        var idx = state.list.findIndex(function (x) { return x.src === clickedSrc; });
        if (idx < 0) idx = 0;

        openAt(idx);
        return;
      }

      // close
      if (e.target.closest('[data-lb-close="1"]')) {
        close();
        return;
      }

      // prev/next
      if (e.target.closest('[data-lb-prev="1"]')) {
        prev();
        return;
      }
      if (e.target.closest('[data-lb-next="1"]')) {
        next();
        return;
      }
    });

    document.addEventListener("keydown", function (e) {
      if (!modal || !modal.classList.contains("is-open")) return;

      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    });

    // click image => next (optional, cảm giác như slideshow)
    if (imgEl) {
      imgEl.style.cursor = "pointer";
      imgEl.addEventListener("click", function () {
        if (!modal.classList.contains("is-open")) return;
        next();
      });
    }
  })();

})();

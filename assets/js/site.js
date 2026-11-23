/* Qadam Stroy — сайттың JS-і: тақырып, мәзір, анимация, ДО/ПОСЛЕ, смета сауалнамасы. Фреймворксыз. */
(function () {
  "use strict";
  var root = document.documentElement;

  /* ---------- тақырып ---------- */
  var themeMeta = document.getElementById("theme-color");
  function applyTheme(t, save) {
    root.setAttribute("data-theme", t);
    if (themeMeta) themeMeta.setAttribute("content", t === "dark" ? "#141619" : "#FFFFFF");
    var btn = document.querySelector(".theme-btn");
    if (btn) btn.setAttribute("aria-pressed", t === "dark" ? "true" : "false");
    if (save) { try { localStorage.setItem("qs-theme", t); } catch (e) {} }
  }
  applyTheme(root.getAttribute("data-theme") === "dark" ? "dark" : "light", false);
  var themeBtn = document.querySelector(".theme-btn");
  if (themeBtn) themeBtn.addEventListener("click", function () {
    applyTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark", true);
  });
  // жүйенің тақырыбы ауысса — тек адам өзі таңдамаған болса
  if (window.matchMedia) {
    var mq = matchMedia("(prefers-color-scheme: dark)");
    var onChange = function (e) {
      var saved = null; try { saved = localStorage.getItem("qs-theme"); } catch (er) {}
      if (!saved) applyTheme(e.matches ? "dark" : "light", false);
    };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
  }

  /* ---------- шапка және мобильді мәзір ---------- */
  var hdr = document.querySelector(".hdr");
  var burger = document.querySelector(".burger");
  function setMenu(open) {
    if (!hdr || !burger) return;
    hdr.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? burger.dataset.close : burger.dataset.open);
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (burger) burger.addEventListener("click", function () { setMenu(!hdr.classList.contains("open")); });
  document.querySelectorAll(".nav a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  window.addEventListener("resize", function () { if (window.innerWidth > 960) setMenu(false); });
  var onScroll = function () { if (hdr) hdr.classList.toggle("scrolled", window.scrollY > 8); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ---------- көріну анимациясы ---------- */
  var rv = document.querySelectorAll(".rv");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    rv.forEach(function (el) { io.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add("in"); }); }

  /* ---------- ДО / ПОСЛЕ ---------- */
  document.querySelectorAll(".ba").forEach(function (fig) {
    var range = fig.querySelector(".ba-range");
    if (!range) return;
    var set = function () { fig.style.setProperty("--pos", range.value + "%"); };
    range.addEventListener("input", set); set();
  });

  /* ---------- жыл ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- смета сауалнамасы ---------- */
  var quiz = document.getElementById("quiz");
  if (!quiz) return;
  var M = JSON.parse(quiz.getAttribute("data-msg"));
  var steps = quiz.querySelectorAll(".q-step");
  var bars = quiz.querySelectorAll(".q-progress li");
  var cur = quiz.querySelector("[data-cur]");
  var back = quiz.querySelector("[data-back]");
  var next = quiz.querySelector("[data-next]");
  var send = quiz.querySelector("[data-send]");
  var err = quiz.querySelector(".q-error");
  var preview = quiz.querySelector("[data-preview]");
  var num = document.getElementById("area-num");
  var rng = document.getElementById("area-range");
  var step = 1, LAST = 4;

  function val(name) {
    var el = quiz.querySelector('[name="' + name + '"]:checked') || quiz.querySelector('[name="' + name + '"]:not([type="radio"])');
    return el ? String(el.value).trim() : "";
  }
  function message() {
    var lines = [M.hello, ""];
    lines.push(M.object + ": " + val("object"));
    lines.push(M.area + ": " + val("area") + " " + M.unit);
    lines.push(M.type + ": " + val("type"));
    lines.push(M.design + ": " + val("design"));
    lines.push(M.start + ": " + val("start"));
    if (val("name")) lines.push(M.name + ": " + val("name"));
    if (val("comment")) lines.push(M.comment + ": " + val("comment"));
    return lines.join("\n");
  }
  function valid(n) {
    if (n === 1) return !!val("object");
    if (n === 3) return !!val("type");
    if (n === 2) { var a = parseInt(num.value, 10); return a >= 1; }
    return true;
  }
  function show(n, focus) {
    step = n;
    steps.forEach(function (s) { s.hidden = Number(s.dataset.step) !== n; });
    bars.forEach(function (b, i) { b.classList.toggle("done", i < Math.min(n, LAST)); });
    if (cur) cur.textContent = Math.min(n, LAST);
    back.hidden = n === 1;
    next.hidden = n > LAST;
    send.hidden = n <= LAST;
    err.hidden = true;
    if (n > LAST) {
      var text = message();
      preview.textContent = text;
      // ориентир только для «Под ключ»: площадь × цена за м²
      var est = quiz.querySelector("[data-est]");
      var area = parseInt(val("area"), 10);
      if (est) {
        var show = val("type") === M.turnkey && area > 0 && M.price_m2;
        est.hidden = !show;
        if (show) {
          quiz.querySelector("[data-est-sum]").textContent = (area * M.price_m2).toLocaleString("ru-RU");
          quiz.querySelector("[data-est-note]").textContent = M.est_note.replace("{area}", area);
        }
      }
      send.href = quiz.dataset.wa + "?text=" + encodeURIComponent(text);
    }
    if (focus) {
      var target = quiz.querySelector('.q-step[data-step="' + n + '"]');
      var first = n === 2 ? num : target && target.querySelector("input:checked, input, textarea");
      if (first) first.focus({ preventScroll: true });
      requestAnimationFrame(function () {
        // сұрақ шапканың астында қалмасын: сауалнаманың басына қайта апарамыз
        var r = quiz.getBoundingClientRect();
        if (r.top < 70 || r.top > window.innerHeight * 0.5) {
          var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
          quiz.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
        }
      });
    }
  }
  next.addEventListener("click", function () {
    if (!valid(step)) { err.hidden = false; return; }
    show(step + 1, true);
  });
  back.addEventListener("click", function () { show(step - 1, true); });
  // 1 және 3-қадамда нұсқаны басқанда өзі әрі қарай өтеді
  quiz.querySelectorAll('input[name="object"], input[name="type"]').forEach(function (r) {
    r.addEventListener("change", function () {
      err.hidden = true;
      setTimeout(function () { if (step === 1 || step === 3) show(step + 1, true); }, 260);
    });
  });
  // аудан: сан мен жүгірткі бірге
  if (num && rng) {
    rng.addEventListener("input", function () { num.value = rng.value; });
    num.addEventListener("input", function () {
      var v = parseInt(num.value, 10);
      if (!isNaN(v)) rng.value = Math.max(10, Math.min(300, v));
    });
  }
  quiz.addEventListener("submit", function (e) { e.preventDefault(); next.click(); });
  quiz.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA" && step <= LAST) { e.preventDefault(); next.click(); }
  });
  show(1, false);
})();

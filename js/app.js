/* ================== ZeusCode landing ================== */
(function () {
  "use strict";

  /* ---------- model registry ---------- */
  var MODELS = [
    { n: "claude-opus-4-6", i: "i-claude" },
    { n: "claude-sonnet-5", i: "i-claude" },
    { n: "claude-haiku-4-5", i: "i-claude" },
    { n: "gpt-5.4", i: "i-openai" },
    { n: "gpt-5.6-terra", i: "i-openai" },
    { n: "gpt-5.3-codex", i: "i-openai" },
    { n: "gemini-3-pro", i: "i-gemini" },
    { n: "gemini-3.6-flash", i: "i-gemini" },
    { n: "gemini-2.5-flash", i: "i-gemini" },
    { n: "deepseek-v4-pro", i: "i-deepseek" },
    { n: "deepseek-v4-flash", i: "i-deepseek" },
    { n: "grok-4.5", i: "i-grok" },
    { n: "grok-4.3", i: "i-grok" },
    { n: "glm-5.2", i: "i-glm" },
    { n: "glm-5.1", i: "i-glm" },
    { n: "qwen3.7-max", i: "i-qwen" },
    { n: "qwen3.7-plus", i: "i-qwen" },
    { n: "kimi-k2.7-code", i: "i-kimi" },
    { n: "kimi-k2.5", i: "i-kimi" },
    { n: "minimax-m3", i: "i-qwen" }
  ];

  function chip(m) {
    return '<span class="chip"><svg><use href="#' + m.i + '"/></svg>' + m.n + "</span>";
  }

  function fillTrack(el, list) {
    if (!el) return;
    var html = list.map(chip).join("");
    el.innerHTML = html + html; /* дубль для бесшовного цикла */
  }

  fillTrack(document.getElementById("track1"), MODELS.slice(0, 10));
  fillTrack(document.getElementById("track2"), MODELS.slice(10));

  /* ---------- sticky header ---------- */
  var header = document.getElementById("header");
  function onScroll() {
    header.classList.toggle("is-stuck", window.scrollY > 12);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- mobile nav ---------- */
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");
  burger.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(open));
  });
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      nav.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- scroll reveal ---------- */
  var revealables = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- animated counters ---------- */
  function animateCount(el) {
    var target = parseFloat(el.dataset.count);
    var suffix = el.dataset.suffix || "";
    var dur = 1400;
    var t0 = performance.now();
    function tick(now) {
      var p = Math.min((now - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCount(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = el.dataset.count + (el.dataset.suffix || ""); });
  }
  /* ---------- FAQ accordion ---------- */
  var faqList = document.getElementById("faqList");
  if (faqList) {
    var items = faqList.querySelectorAll(".faq__item");
    items.forEach(function (item, i) {
      var q = item.querySelector(".faq__q");
      var a = item.querySelector(".faq__a");
      q.id = "faq-q-" + i;
      a.id = "faq-a-" + i;
      q.setAttribute("aria-expanded", "false");
      q.setAttribute("aria-controls", a.id);
      a.setAttribute("role", "region");
      a.setAttribute("aria-labelledby", q.id);
    });

    function closeAll() {
      faqList.querySelectorAll(".faq__item.is-open").forEach(function (x) {
        x.classList.remove("is-open");
        x.querySelector(".faq__a").style.maxHeight = "0px";
        x.querySelector(".faq__q").setAttribute("aria-expanded", "false");
      });
    }

    faqList.addEventListener("click", function (e) {
      var btn = e.target.closest(".faq__q");
      if (!btn) return;
      var item = btn.parentElement;
      var body = item.querySelector(".faq__a");
      var open = item.classList.contains("is-open");

      closeAll();

      if (!open) {
        item.classList.add("is-open");
        body.style.maxHeight = body.scrollHeight + "px";
        btn.setAttribute("aria-expanded", "true");
      }
    });

    window.addEventListener("resize", function () {
      var open = faqList.querySelector(".faq__item.is-open .faq__a");
      if (open) open.style.maxHeight = open.scrollHeight + "px";
    });
  }

  /* ---------- copy code snippet ---------- */
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    var label = btn.querySelector("span");
    var pre = btn.closest(".codewin").querySelector("pre");
    btn.addEventListener("click", function () {
      navigator.clipboard.writeText(pre.innerText).then(function () {
        btn.classList.add("is-done");
        label.textContent = "Скопировано";
        setTimeout(function () {
          btn.classList.remove("is-done");
          label.textContent = "Копировать";
        }, 1800);
      });
    });
  });

  /* ---------- active nav section ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav a[href^='#']"));
  var targets = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);
  if (targets.length && "IntersectionObserver" in window) {
    var visible = {};
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { visible[en.target.id] = en.isIntersecting; });
      var current = "";
      targets.forEach(function (t) { if (visible[t.id]) current = current || t.id; });
      navLinks.forEach(function (a) {
        a.classList.toggle("is-active", a.getAttribute("href") === "#" + current);
      });
    }, { rootMargin: "-25% 0px -60% 0px" });
    targets.forEach(function (t) { sio.observe(t); });
  }

  /* ---------- savings calculator ---------- */
  var calcTokens = document.getElementById("calcTokens");
  if (calcTokens) {
    var calcModel = document.getElementById("calcModel");
    var out = document.getElementById("calcTokensOut");
    var cOther = document.getElementById("calcOther");
    var cZeus = document.getElementById("calcZeus");
    var cSave = document.getElementById("calcSave");
    var COMPRESSION = 0.65; /* сжатие контекста −35% */

    function rub(v) {
      return Math.round(v).toLocaleString("ru-RU") + " ₽";
    }
    function recalc() {
      var mln = parseInt(calcTokens.value, 10);
      var parts = calcModel.value.split("|");
      var other = mln * parseFloat(parts[0]);
      var zeus = mln * parseFloat(parts[1]) * COMPRESSION;
      out.textContent = mln + " млн";
      cOther.innerHTML = rub(other) + '<i>/ мес</i>';
      cZeus.innerHTML = rub(zeus) + '<i>/ мес</i>';
      cSave.textContent = rub(Math.max(0, other - zeus) * 12);
    }
    calcTokens.addEventListener("input", recalc);
    calcModel.addEventListener("change", recalc);
    recalc();
  }

  /* ---------- card cursor glow ---------- */
  document.querySelectorAll(".card").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });
})();

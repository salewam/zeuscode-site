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

  /* ---------- hero orbit ---------- */
  function buildOrbit(el, list, offset) {
    if (!el) return;
    list.forEach(function (m, idx) {
      var a = (idx / list.length) * 2 * Math.PI - Math.PI / 2 + offset;
      var node = document.createElement("div");
      node.className = "orbit__node";
      node.style.left = (50 + Math.cos(a) * 50) + "%";
      node.style.top = (50 + Math.sin(a) * 50) + "%";
      node.innerHTML = '<svg><use href="#' + m.i + '"/></svg>';
      node.title = m.n || "";
      el.appendChild(node);
    });
  }

  buildOrbit(document.getElementById("orbit1"), [
    { i: "i-claude", n: "Claude" }, { i: "i-openai", n: "GPT" },
    { i: "i-gemini", n: "Gemini" }, { i: "i-deepseek", n: "DeepSeek" },
    { i: "i-grok", n: "Grok" }, { i: "i-glm", n: "GLM" }
  ], 0);
  buildOrbit(document.getElementById("orbit2"), [
    { i: "i-qwen", n: "Qwen" }, { i: "i-kimi", n: "Kimi" },
    { i: "i-openai", n: "Codex" }, { i: "i-claude", n: "Haiku" }
  ], 0.6);
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
    nav.classList.toggle("is-open");
  });
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") nav.classList.remove("is-open");
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
    faqList.addEventListener("click", function (e) {
      var btn = e.target.closest(".faq__q");
      if (!btn) return;
      var item = btn.parentElement;
      var body = item.querySelector(".faq__a");
      var open = item.classList.contains("is-open");

      faqList.querySelectorAll(".faq__item.is-open").forEach(function (x) {
        x.classList.remove("is-open");
        x.querySelector(".faq__a").style.maxHeight = "0px";
      });

      if (!open) {
        item.classList.add("is-open");
        body.style.maxHeight = body.scrollHeight + "px";
      }
    });
  }

  /* ---------- card cursor glow ---------- */
  document.querySelectorAll(".card").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });
  /* ---------- smooth anchor offset for fixed header ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 82, behavior: "smooth" });
    });
  });
})();

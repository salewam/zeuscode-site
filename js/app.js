/* ================== ZeusCode landing ================== */
(function () {
  "use strict";

  /* ---------- model registry ---------- */
  var MODELS = [
    { n: "claude-opus-5", i: "i-claude" },
    { n: "claude-sonnet-5", i: "i-claude" },
    { n: "claude-sonnet-4-6", i: "i-claude" },
    { n: "claude-opus-4-6", i: "i-claude" },
    { n: "claude-fable-5", i: "i-claude" },
    { n: "gpt-5.6-sol", i: "i-openai" },
    { n: "gpt-5.6-luna", i: "i-openai" },
    { n: "gpt-5.6-terra", i: "i-openai" },
    { n: "gpt-5.5", i: "i-openai" },
    { n: "gpt-4o-mini", i: "i-openai" },
    { n: "grok-4.6", i: "i-grok" },
    { n: "grok-4.5", i: "i-grok" },
    { n: "gemini-3.7-flash", i: "i-gemini" },
    { n: "gemini-3.6-flash", i: "i-gemini" },
    { n: "gemini-3.5-flash", i: "i-gemini" },
    { n: "glm-5.2", i: "i-glm" },
    { n: "deepseek-v4-pro-0813", i: "i-deepseek" },
    { n: "kimi-k3", i: "i-kimi" }
  ];

  var PRICE_ROWS = [
    { id: "claude-opus-5", icon: "i-claude", input: 66.25, output: 331.26, ready: true },
    { id: "claude-sonnet-5", icon: "i-claude", input: 24.84, output: 124.22, ready: true },
    { id: "claude-sonnet-4-6", icon: "i-claude", input: 33.13, output: 165.63, ready: true },
    { id: "claude-opus-4-6", icon: "i-claude", input: 66.25, output: 331.26, ready: true },
    { id: "claude-fable-5", icon: "i-claude", input: 118.29, output: 591.29, ready: true },
    { id: "gpt-5.6-sol", icon: "i-openai", input: 57.97, output: 349.20, ready: true },
    { id: "gpt-5.6-luna", icon: "i-openai", input: 4.55, output: 27.05, ready: true },
    { id: "gpt-5.6-terra", icon: "i-openai", input: 29.26, output: 175.84, ready: true },
    { id: "gpt-5.5", icon: "i-openai", input: 59.63, output: 357.76, ready: true },
    { id: "gpt-4o-mini", icon: "i-openai", input: 33.13, output: 82.81, ready: true },
    { id: "grok-4.6", icon: "i-grok", input: 6.63, output: 19.88, ready: true },
    { id: "grok-4.5", icon: "i-grok", input: 8.28, output: 24.84, ready: true },
    { id: "gemini-3.7-flash", icon: "i-gemini", input: 57.97, output: 289.85, ready: true },
    { id: "gemini-3.6-flash", icon: "i-gemini", input: 57.97, output: 289.85, ready: true },
    { id: "gemini-3.5-flash", icon: "i-gemini", input: 57.97, output: 347.82, ready: true },
    { id: "glm-5.2", icon: "i-glm", input: 16.56, output: 58.11, ready: true },
    { id: "deepseek-v4-pro-0813", icon: "i-deepseek", input: 149.07, output: 298.13, ready: true },
    { id: "kimi-k3", icon: "i-kimi", input: 149.07, output: 745.33, ready: true }
  ];
  PRICE_ROWS.sort(function (a, b) { return b.output - a.output; });

  var priceFormatter = new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function price(value) {
    return priceFormatter.format(value) + " ₽";
  }

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

  /* ---------- public price table ---------- */
  var priceRows = document.getElementById("priceRows");
  if (priceRows) {
    priceRows.innerHTML = PRICE_ROWS.map(function (row, index) {
      var rowClass = row.ready ? "" : " class=\"is-limited\"";
      var label = row.name || row.id;
      var statusClass = row.ready ? "price-status--ready" : "price-status--limited";
      var status = row.ready ? "Доступна" : "Ограничена";
      return "<tr" + rowClass + ">" +
        "<th scope=\"row\" class=\"price-model\"><span class=\"price-rank\">" + String(index + 1).padStart(2, "0") + "</span>" +
        "<svg aria-hidden=\"true\"><use href=\"#" + row.icon + "\"></use></svg>" +
        "<span><strong>" + label + "</strong><small>" + row.id + "</small></span></th>" +
        "<td class=\"price-value\" data-label=\"Ваш текст / 1 млн\">" + price(row.input) + "</td>" +
        "<td class=\"price-value price-value--strong\" data-label=\"Ответ / 1 млн\">" + price(row.output) + "</td>" +
        "<td data-label=\"Статус\"><span class=\"price-status " + statusClass + "\">" + status + "</span></td>" +
        "</tr>";
    }).join("");
  }

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
  function copyText(text) {
    function fallback() {
      var area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      var copied = false;
      try { copied = document.execCommand("copy"); } catch (err) { copied = false; }
      document.body.removeChild(area);
      return copied ? Promise.resolve() : Promise.reject(new Error("Copy unavailable"));
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(fallback);
    }
    return fallback();
  }

  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    var label = btn.querySelector("span");
    var pre = btn.closest(".codewin").querySelector("pre");
    btn.addEventListener("click", function () {
      copyText(pre.innerText).then(function () {
        btn.classList.add("is-done");
        label.textContent = "Скопировано";
        setTimeout(function () {
          btn.classList.remove("is-done");
          label.textContent = "Копировать";
        }, 1800);
      }).catch(function () { label.textContent = "Скопируйте вручную"; });
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
    var COMPRESSION = 0.65;

    calcModel.innerHTML = PRICE_ROWS.map(function (row) {
      var value = row.input + "|" + row.input + "|" + row.id;
      var label = row.id + " — ваш текст " + price(row.input) + " · ответ " + price(row.output);
      return '<option value="' + value + '">' + label + "</option>";
    }).join("");
    var defaultModel = PRICE_ROWS.find(function (row) { return row.id === "claude-sonnet-5"; });
    if (defaultModel) calcModel.value = defaultModel.input + "|" + defaultModel.input + "|" + defaultModel.id;

    function rub(v) {
      return Math.round(v).toLocaleString("ru-RU") + " ₽";
    }
    function recalc() {
      var mln = parseInt(calcTokens.value, 10);
      var parts = calcModel.value.split("|");
      var other = mln * parseFloat(parts[0]);
      var zeus = mln * parseFloat(parts[1]) * COMPRESSION;
      out.textContent = mln + " млн частей";
      cOther.innerHTML = rub(other) + '<i>/ мес</i>';
      cZeus.innerHTML = rub(zeus) + '<i>/ мес</i>';
      cSave.textContent = rub(Math.max(0, other - zeus) * 12);
    }
    calcTokens.addEventListener("input", recalc);
    calcModel.addEventListener("change", recalc);
    recalc();
  }


  /* ---------- live demo playground ---------- */
  var demoForm = document.getElementById("demoForm");
  if (demoForm) {
    var demoPrompt = document.getElementById("demoPrompt");
    var demoResult = document.getElementById("demoResult");
    var demoSubmit = document.getElementById("demoSubmit");
    var demoQuota = document.getElementById("demoQuota");
    var demoLimit = 999000000000;
    var demoUsed = parseInt(localStorage.getItem("zeus-demo-used") || "0", 10);
    var demoApiUrl = window.ZEUS_DEMO_API_URL || "http://127.0.0.1:8080/v1/demo/chat/completions";

    function updateDemoQuota() {
      demoQuota.textContent = Math.max(0, demoLimit - demoUsed);
      demoSubmit.disabled = demoUsed >= demoLimit;
      if (demoUsed >= demoLimit) demoSubmit.setAttribute("aria-label", "Лимит на сегодня исчерпан");
    }
    function scrollDemo() {
      demoResult.scrollTop = demoResult.scrollHeight;
    }
    function appendChatMessage(text) {
      var node = document.createElement("div");
      node.className = "chat-message";
      node.textContent = text;
      demoResult.appendChild(node);
      return node;
    }
    function appendThinking() {
      var node = document.createElement("div");
      node.className = "chat-thinking";
      var status = document.createElement("span");
      status.className = "chat-thinking__text";
      status.textContent = "Три модели получили запрос";
      node.appendChild(status);
      node.insertAdjacentHTML("beforeend", "<i></i><i></i><i></i>");
      var statuses = [
        "Три модели получили запрос",
        "Сравниваем варианты",
        "Собираем общий ответ"
      ];
      var index = 0;
      node._statusTimer = setInterval(function () {
        index = (index + 1) % statuses.length;
        status.textContent = statuses[index];
      }, 1100);
      demoResult.appendChild(node);
      return node;
    }
    function removeThinking(node) {
      clearInterval(node._statusTimer);
      node.remove();
    }
    function appendAnswer(label, text, error) {
      var node = document.createElement("div");
      node.className = "chat-answer";
      if (error) node.classList.add("is-error");

      var heading = document.createElement("div");
      heading.className = "chat-answer__label";
      heading.textContent = label;
      node.appendChild(heading);

      var body = document.createElement("div");
      body.textContent = text;
      node.appendChild(body);
      demoResult.appendChild(node);
      return node;
    }
    demoForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var prompt = demoPrompt.value.trim();
      if (!prompt || demoUsed >= demoLimit) return;

      var welcome = demoResult.querySelector(".chat-welcome");
      if (welcome) welcome.remove();
      demoUsed += 1;
      localStorage.setItem("zeus-demo-used", String(demoUsed));
      updateDemoQuota();
      demoSubmit.disabled = true;
      demoPrompt.disabled = true;

      appendChatMessage(prompt);
      var thinking = appendThinking();
      demoPrompt.value = "";
      scrollDemo();

      fetch(demoApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "zeuscode-demo",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.4,
          max_tokens: 1200
        })
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (data) {
          if (!r.ok) {
            var detail = data.detail || (data.error && (data.error.message || data.error)) || "API вернул ошибку";
            var error = new Error(String(detail));
            error.status = r.status;
            throw error;
          }
          return data;
        });
      }).then(function (data) {
        var text = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
        if (!text) throw new Error("Пустой ответ API");
        removeThinking(thinking);
        appendAnswer("Общий ответ", text, false);
      }).catch(function (err) {
        removeThinking(thinking);
        var message = "Демо временно недоступно. Попробуйте ещё раз позже.";
        if (/quota|insufficient|额度不足|квот|баланс/i.test(err.message)) {
          message = "У демо закончился лимит. Попробуйте ещё раз позже.";
        } else if (err.status === 429) {
          message = "Лимит демо-запросов исчерпан. Попробуйте завтра.";
        } else if (err.status === 504) {
          message = "Модели не успели подготовить ответ. Попробуйте ещё раз.";
        }
        appendAnswer("Не удалось получить ответ", message, true);
        console.error("ZeusCode demo:", err);
      }).finally(function () {
        demoPrompt.disabled = false;
        demoSubmit.disabled = demoUsed >= demoLimit;
        scrollDemo();
      });
    });
    updateDemoQuota();
  }

  document.querySelectorAll(".card").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });
})();

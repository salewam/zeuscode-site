/* Грузим three.js только когда он реально нужен и страница уже интерактивна:
   ~600 КБ не должны конкурировать с первой отрисовкой. */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var saveData = navigator.connection && navigator.connection.saveData;
  var weak = navigator.connection && /(^|-)2g$/.test(navigator.connection.effectiveType || "");

  if (reduce || saveData || weak) return;

  function load() {
    import("./globe.js");
  }

  if ("requestIdleCallback" in window) {
    requestIdleCallback(load, { timeout: 2500 });
  } else {
    setTimeout(load, 900);
  }
})();

// Theme + mobile nav for cuijiawei.cn
(function () {
  "use strict";

  // Theme
  var root = document.documentElement;
  var stored = null;
  try { stored = localStorage.getItem("theme"); } catch (e) {}
  var initial = stored || (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  root.setAttribute("data-theme", initial);

  function toggleTheme() {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    var btn = document.getElementById("theme-btn");
    if (btn) btn.textContent = next === "dark" ? "☀" : "☾";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("theme-btn");
    if (btn) {
      btn.textContent = root.getAttribute("data-theme") === "dark" ? "☀" : "☾";
      btn.addEventListener("click", toggleTheme);
    }

    var toggle = document.getElementById("nav-toggle");
    var links = document.getElementById("nav-links");
    if (toggle && links) {
      toggle.addEventListener("click", function () { links.classList.toggle("open"); });
      links.addEventListener("click", function (e) {
        if (e.target.tagName === "A") links.classList.remove("open");
      });
    }

    // Blog tag filter
    var chips = document.querySelectorAll(".tagbar .chip");
    var cards = document.querySelectorAll(".post-grid .post-card");
    if (chips.length && cards.length) {
      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          var tag = chip.getAttribute("data-tag");
          chips.forEach(function (c) { c.classList.remove("active"); });
          chip.classList.add("active");
          cards.forEach(function (card) {
            var tags = (card.getAttribute("data-tags") || "").split(",");
            var show = tag === "all" || tags.indexOf(tag) !== -1;
            card.style.display = show ? "" : "none";
          });
        });
      });
    }
  });
})();

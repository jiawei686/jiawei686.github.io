// nav.js — 全站导航组件（cuijiawei.cn）
// 用法：页面放置占位符 <nav class="nav" data-nav></nav>，本脚本自动渲染导航
// 并高亮当前页。以后增删改导航链接只改这里一处，全站生效。
(function () {
  "use strict";

  var LINKS = [
    { href: "/", label: "About", isActive: function (p) { return p === "/" || p === "/index.html" || p === "/about.html"; } },
    { href: "/blog/", label: "Blog", isActive: function (p) { return p.indexOf("/blog/") === 0; } },
    { href: "/resume/", label: "3D Resume", isActive: function (p) { return p.indexOf("/resume/") === 0; } },
    { href: "https://github.com/jiawei686", label: "GitHub", external: true, isActive: function () { return false; } }
  ];

  function render() {
    var mounts = document.querySelectorAll("[data-nav]");
    if (!mounts.length) return;
    var path = window.location.pathname;

    var linksHtml = "";
    LINKS.forEach(function (l) {
      var cls = l.isActive(path) ? ' class="active"' : "";
      var ext = l.external ? ' target="_blank" rel="noopener"' : "";
      linksHtml += '<a href="' + l.href + '"' + cls + ext + ">" + l.label + "</a>";
    });

    var html =
      '<div class="container nav-inner">' +
        '<a class="brand" href="/"><img src="/public/img/logo.svg" alt="logo"> Jiawei Cui</a>' +
        '<button class="nav-toggle" id="nav-toggle" aria-label="Menu">☰</button>' +
        '<div class="nav-links" id="nav-links">' +
          linksHtml +
          '<button class="theme-btn" id="theme-btn" aria-label="Toggle theme">☾</button>' +
        "</div>" +
      "</div>";

    mounts.forEach(function (m) { m.innerHTML = html; });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();

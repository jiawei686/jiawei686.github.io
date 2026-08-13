// =========================================================
//  cuijiawei-site — static site generator
//  Zero runtime deps at serve time. Build once, host anywhere
//  (GitHub Pages or nginx). Output: ./dist  (root-relative links)
// =========================================================
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { marked } from "marked";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const SRC = path.join(ROOT, "src");
const POSTS_DIR = path.join(SRC, "posts");

const SITE = {
  name: "Jiawei Cui",
  domain: "https://cuijiawei.cn",
  author: "Jiawei Cui",
  github: "jiawei686",
  email: "892001108@qq.com",
  description:
    "Jiawei Cui — software engineer turned AI researcher. Notes on LLMs, deep learning, and building things that work.",
};

marked.setOptions({ gfm: true, breaks: false });

// ---------- theme registry ----------
const THEMES = {
  editorial: { file: "editorial.css", heroEyebrow: "Hello, I'm", label: "Editorial" },
  terminal:  { file: "terminal.css",  heroEyebrow: "~/jiawei $ whoami", label: "Terminal" },
  soft:      { file: "soft.css",      heroEyebrow: "Hi, I'm", label: "Soft" },
  bold:      { file: "bold.css",      heroEyebrow: "Jiawei Cui", label: "Bold" },
};
function parseArgs() {
  const out = { theme: "editorial", outDir: null };
  for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i] === "--theme") out.theme = process.argv[++i];
    else if (process.argv[i] === "--out") out.outDir = process.argv[++i];
  }
  if (!THEMES[out.theme]) {
    console.error(`Unknown theme "${out.theme}". Options: ${Object.keys(THEMES).join(", ")}`);
    process.exit(1);
  }
  return out;
}
const ARGS = parseArgs();
const THEME = THEMES[ARGS.theme];
const DIST = path.join(ROOT, ARGS.outDir || "dist");

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function fmtDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || "");
  if (!m) return iso || "";
  return `${MONTHS[parseInt(m[2], 10) - 1]} ${parseInt(m[3], 10)}, ${m[1]}`;
}
function esc(s = "") {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function plainExcerpt(md, max = 170) {
  const noFence = md.replace(/```[\s\S]*?```/g, " ").replace(/`[^`]*`/g, " ");
  const firstPara = (noFence.split(/\n\s*\n/).find((p) => p.trim().length > 30) || "").trim();
  const text = firstPara
    .replace(/[#>*_~-]/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? text.slice(0, max).replace(/\s+\S*$/, "") + "…" : text;
}

// ---------- read posts ----------
function readPosts() {
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  const posts = files.map((file) => {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
    const { data, content } = matter(raw);
    const slug = file.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "");
    const date = (data.date || "").toString();
    return {
      slug,
      title: data.title || slug,
      date,
      dateDisplay: fmtDate(date),
      tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []),
      html: marked.parse(content),
      excerpt: plainExcerpt(content),
    };
  });
  posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return posts;
}

// ---------- layout ----------
function nav(active) {
  const link = (href, label, key) =>
    `<a href="${href}"${key === active ? ' class="active"' : ""}>${label}</a>`;
  return `
  <nav class="nav">
    <div class="container nav-inner">
      <a class="brand" href="/"><img src="/public/img/logo.svg" alt="logo"> Jiawei Cui</a>
      <button class="nav-toggle" id="nav-toggle" aria-label="Menu">☰</button>
      <div class="nav-links" id="nav-links">
        ${link("/", "About", "home")}
        ${link("/blog/", "Blog", "blog")}
        <a href="https://github.com/${SITE.github}" target="_blank" rel="noopener">GitHub</a>
        <a href="mailto:${SITE.email}">Email</a>
        <button class="theme-btn" id="theme-btn" aria-label="Toggle theme">☾</button>
      </div>
    </div>
  </nav>`;
}

function footer() {
  const y = new Date().getFullYear();
  return `
  <footer class="footer">
    <div class="container footer-inner">
      <div class="copy">© ${y} ${esc(SITE.name)} · Built as hand-written static HTML/CSS/JS.</div>
      <div class="social">
        <a href="https://github.com/${SITE.github}" target="_blank" rel="noopener">GitHub</a>
        <a href="mailto:${SITE.email}">Email</a>
        <a href="/blog/">Blog</a>
      </div>
    </div>
  </footer>`;
}

function layout({ title, description, body, active, urlPath }) {
  const canonical = SITE.domain + urlPath;
  return `<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="icon" href="/public/img/logo.svg" type="image/svg+xml">
<link rel="stylesheet" href="/site/css/style.css">
<link rel="stylesheet" href="/site/css/themes/${THEME.file}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Person","name":"Jiawei Cui","alternateName":["kiritocui","崔家维","cuijiawei"],"url":"${SITE.domain}/","sameAs":["https://github.com/${SITE.github}"]}
</script>
</head>
<body class="theme-${ARGS.theme}">
${nav(active)}
<main>
${body}
</main>
${footer()}
<script src="/site/js/main.js"></script>
</body>
</html>`;
}

// ---------- pages ----------
function aboutContent() {
  const raw = fs.readFileSync(path.join(SRC, "about.md"), "utf8");
  const { content } = matter(raw);
  return marked.parse(content);
}

// The homepage IS the About page (self-intro hero + CV + recent notes + contact).
function indexPage(posts) {
  const about = aboutContent();
  const recent = posts.slice(0, 5);
  const recentRows = recent
    .map(
      (p) =>
        `<div class="wrow"><span class="date">${p.dateDisplay}</span><a href="/blog/${p.slug}/">${esc(p.title)}</a></div>`
    )
    .join("");

  const body = `
  <section class="hero">
    <div class="container hero-grid">
      <img class="avatar" src="/public/img/logo.svg" alt="${esc(SITE.name)}">
      <div>
        <div class="hero-eyebrow">${esc(THEME.heroEyebrow)}</div>
        <h1>${esc(SITE.name)}</h1>
        <p class="tag">Software engineer → AI researcher.</p>
        <p class="lede">I build things, then I train models. Five years shipping front-end systems at Tencent, now all-in on large language models and the path to a PhD. This is where I think in public.</p>
        <div class="cta-row">
          <a class="btn btn-primary" href="/blog/">Read the blog →</a>
          <a class="btn btn-ghost" href="https://github.com/${SITE.github}" target="_blank" rel="noopener">GitHub</a>
          <a class="btn btn-ghost" href="mailto:${SITE.email}">Get in touch</a>
        </div>
      </div>
    </div>
  </section>

  <section class="section about-home">
    <div class="container about-wrap">
      <div class="content">${about}</div>

      <div class="about-section recent-notes">
        <h2>Latest from the blog</h2>
        <div class="writing">${recentRows}</div>
        <p style="margin-top:18px"><a class="btn btn-ghost" href="/blog/">Browse all ${posts.length} notes →</a></p>
      </div>

      <div class="about-section" id="contact">
        <h2>Contact</h2>
        <p>Email: <a href="mailto:${SITE.email}">${esc(SITE.email)}</a><br>
        GitHub: <a href="https://github.com/${SITE.github}" target="_blank" rel="noopener">@${SITE.github}</a></p>
      </div>
    </div>
  </section>`;

  return layout({
    title: `${SITE.name} — About`,
    description: SITE.description,
    body,
    active: "home",
    urlPath: "/",
  });
}

// /about.html is kept only as a redirect to "/" so old links keep working.
function aboutRedirect() {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>About — ${esc(SITE.name)}</title>
<link rel="canonical" href="${SITE.domain}/">
<meta http-equiv="refresh" content="0; url=/">
</head>
<body>Redirecting to <a href="/">home</a>…</body>
</html>`;
}

function blogIndex(posts) {
  const tags = new Set();
  posts.forEach((p) => p.tags.forEach((t) => tags.add(t)));
  const tagList = Array.from(tags).sort();
  const chips =
    `<span class="chip active" data-tag="all">All (${posts.length})</span>` +
    tagList.map((t) => `<span class="chip" data-tag="${esc(t)}">${esc(t)}</span>`).join("");

  const cards = posts
    .map((p) => {
      const tagChips = p.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("");
      return `<article class="post-card" data-tags="${esc(p.tags.join(","))}">
        <div class="pc-body">
          <h3><a href="/blog/${p.slug}/">${esc(p.title)}</a></h3>
          <p class="ex">${esc(p.excerpt)}</p>
          <div class="tags">${tagChips}</div>
          <div class="pc-foot"><span>${p.dateDisplay}</span><span>${p.tags.length} tag${p.tags.length === 1 ? "" : "s"}</span></div>
        </div>
      </article>`;
    })
    .join("");

  const body = `
  <section class="blog-head">
    <div class="container">
      <h1>Blog</h1>
      <p>${posts.length} notes on LLMs, deep learning, and building things — written to be understood.</p>
    </div>
  </section>
  <section>
    <div class="container">
      <div class="tagbar">${chips}</div>
      <div class="post-grid">${cards}</div>
    </div>
  </section>`;

  return layout({
    title: `Blog — ${SITE.name}`,
    description: "Notes on LLMs, deep learning, and building things.",
    body,
    active: "blog",
    urlPath: "/blog/",
  });
}

function postPage(post, newer, older) {
  const tagChips = post.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join(" ");
  const prev = newer ? `<a href="/blog/${newer.slug}/">← ${esc(newer.title)}</a>` : `<span></span>`;
  const next = older ? `<a href="/blog/${older.slug}/">${esc(older.title)} →</a>` : `<span></span>`;
  const body = `
  <article class="article">
    <div class="read">
      <div class="a-head">
        <div class="a-meta"><a href="/blog/">Blog</a> · ${post.dateDisplay} ${tagChips ? "· " + tagChips : ""}</div>
        <h1>${esc(post.title)}</h1>
      </div>
      <div class="content">${post.html}</div>
      <div class="a-foot">
        ${prev}
        ${next}
      </div>
    </div>
  </article>`;
  return layout({
    title: `${post.title} — ${SITE.name}`,
    description: post.excerpt,
    body,
    active: "blog",
    urlPath: `/blog/${post.slug}/`,
  });
}

// ---------- write helpers ----------
function writeFile(rel, content) {
  const full = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
}
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    if (e.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

// ---------- sitemap ----------
function sitemap(posts) {
  const urls = ["/", "/blog/"].concat(posts.map((p) => `/blog/${p.slug}/`));
  const body = urls
    .map((u) => `  <url><loc>${SITE.domain}${u}</loc></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

// ---------- build ----------
function main() {
  fs.rmSync(DIST, { recursive: true, force: true });
  const posts = readPosts();

  writeFile("index.html", indexPage(posts));
  writeFile("about.html", aboutRedirect());
  writeFile("blog/index.html", blogIndex(posts));
  posts.forEach((p, i) => {
    const newer = posts[i - 1] || null;
    const older = posts[i + 1] || null;
    writeFile(`blog/${p.slug}/index.html`, postPage(p, newer, older));
  });

  copyDir(path.join(ROOT, "assets"), path.join(DIST, "site")); // served at /site/ (avoid nginx /assets/ proxy)
  copyDir(path.join(SRC, "..", "public"), path.join(DIST, "public")); // public/img/logo.svg
  fs.writeFileSync(path.join(DIST, ".nojekyll"), "");
  fs.writeFileSync(path.join(DIST, "robots.txt"), "User-agent: *\nAllow: /\nSitemap: " + SITE.domain + "/sitemap.xml\n");
  writeFile("sitemap.xml", sitemap(posts));

  console.log(`Built ${posts.length} posts + about-home/blog -> ${DIST} (theme: ${ARGS.theme})`);
}

main();

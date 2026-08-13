// =========================================================
//  preview.mjs — emit self-contained homepage + about previews
//  (inline CSS + logo) so the user can compare themes.
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
const CSS_DIR = path.join(ROOT, "assets", "css");
const THEMES_DIR = path.join(CSS_DIR, "themes");
const OUT = path.join(ROOT, "preview");
const LOGO = fs.readFileSync(path.join(ROOT, "public", "img", "logo.svg"), "utf8");

const SITE = {
  name: "Jiawei Cui",
  github: "jiawei686",
  email: "892001108@qq.com",
};

const THEMES = {
  editorial: { file: "editorial.css", heroEyebrow: "Hello, I'm", label: "Editorial · warm serif" },
  terminal:  { file: "terminal.css",  heroEyebrow: "~/jiawei $ whoami", label: "Terminal · dark mono" },
  soft:      { file: "soft.css",      heroEyebrow: "Hi, I'm", label: "Soft · airy pastel" },
  bold:      { file: "bold.css",      heroEyebrow: "Jiawei Cui", label: "Bold · gradient" },
};

marked.setOptions({ gfm: true, breaks: false });
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function fmtDate(iso){const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(iso||"");if(!m)return iso||"";return `${MONTHS[parseInt(m[2],10)-1]} ${parseInt(m[3],10)}, ${m[1]}`;}
function esc(s=""){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
const brandSvg = () => LOGO.replace(/<svg /, '<svg class="brand-svg" ');
const avatarSvg = () => LOGO.replace(/<svg /, '<svg class="avatar-svg" ');

// Inline /public/img/* assets as base64 data URIs so the preview HTML
// renders correctly when opened directly from disk (no server).
const IMG_MIME = { ".png":"image/png", ".svg":"image/svg+xml", ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".webp":"image/webp", ".gif":"image/gif" };
const IMG_RE = /src="(\/public\/img\/[^"]+)"/g;
function inlineImages(html){
  return html.replace(IMG_RE, (m, p) => {
    const fp = path.join(ROOT, p);
    if (!fs.existsSync(fp)) return m;
    const ext = path.extname(fp).toLowerCase();
    const mime = IMG_MIME[ext] || "application/octet-stream";
    const b64 = fs.readFileSync(fp).toString("base64");
    return `src="data:${mime};base64,${b64}"`;
  });
}

function readPosts(){
  const files = fs.readdirSync(POSTS_DIR).filter(f=>f.endsWith(".md"));
  const posts = files.map(file=>{
    const {data} = matter(fs.readFileSync(path.join(POSTS_DIR,file),"utf8"));
    const slug = file.replace(/^\d{4}-\d{2}-\d{2}-/,"").replace(/\.md$/,"");
    const date=(data.date||"").toString();
    return {slug,title:data.title||slug,date,dateDisplay:fmtDate(date)};
  });
  posts.sort((a,b)=>a.date<b.date?1:a.date>b.date?-1:0);
  return posts;
}

function navHtml(active){
  const a=(h,l,k)=>`<a href="#"${k===active?' class="active"':''}>${h}</a>`;
  return `<nav class="nav"><div class="container nav-inner">
    <a class="brand" href="#"><span class="brand-mark">${brandSvg()}</span> Jiawei Cui</a>
    <div class="nav-links">${a("About","/","home")}${a("Blog","/blog/","blog")}
      <a href="https://github.com/${SITE.github}" target="_blank" rel="noopener">GitHub</a>
      <a href="mailto:${SITE.email}">Email</a></div>
  </div></nav>`;
}
const footerHtml = () => `<footer class="footer"><div class="container footer-inner">
  <div class="copy">© 2026 ${esc(SITE.name)} · Preview</div>
  <div class="social"><a href="https://github.com/${SITE.github}" target="_blank" rel="noopener">GitHub</a><a href="mailto:${SITE.email}">Email</a></div>
</div></footer>`;

function aboutHtml(){
  const raw = fs.readFileSync(path.join(SRC, "about.md"), "utf8");
  const { content } = matter(raw);
  return marked.parse(content);
}

function homeBody(posts, theme){
  const recent = posts.slice(0,5);
  const recentRows = recent.map(p=>
    `<div class="wrow"><span class="date">${p.dateDisplay}</span><a href="#">${esc(p.title)}</a></div>`).join("");
  const about = aboutHtml();
  return `${navHtml("home")}
<main>
<section class="hero"><div class="container hero-grid">
  <span class="avatar">${avatarSvg()}</span>
  <div>
    <div class="hero-eyebrow">${esc(theme.heroEyebrow)}</div>
    <h1>${esc(SITE.name)}</h1>
    <p class="tag">Software engineer → AI researcher.</p>
    <p class="lede">I build things, then I train models. Five years shipping front-end systems at Tencent, now all-in on large language models and the path to a PhD. This is where I think in public.</p>
    <div class="cta-row">
      <a class="btn btn-primary" href="#">Read the blog →</a>
      <a class="btn btn-ghost" href="https://github.com/${SITE.github}" target="_blank" rel="noopener">GitHub</a>
      <a class="btn btn-ghost" href="mailto:${SITE.email}">Get in touch</a>
    </div>
  </div>
</div></section>
<section class="section about-home"><div class="container about-wrap">
  <div class="content">${about}</div>
  <div class="about-section recent-notes"><h2>Latest from the blog</h2>
    <div class="writing">${recentRows}</div>
    <p style="margin-top:18px"><a class="btn btn-ghost" href="#">Browse all ${posts.length} notes →</a></p>
  </div>
  <div class="about-section" id="contact"><h2>Contact</h2>
    <p>Email: <a href="mailto:${SITE.email}">${esc(SITE.email)}</a><br>
    GitHub: <a href="https://github.com/${SITE.github}" target="_blank" rel="noopener">@${SITE.github}</a></p>
  </div>
</div></section>
</main>${footerHtml()}`;
}

const EXTRA = `
.brand-svg{width:26px;height:26px;vertical-align:-6px}
.avatar-svg{width:100%;height:100%;display:block}
`;

fs.mkdirSync(OUT, { recursive: true });
const posts = readPosts();
const baseCss = fs.readFileSync(path.join(CSS_DIR, "style.css"), "utf8");

function emit(name, inner, themeKey){
  const theme = THEMES[themeKey];
  const themeCss = fs.readFileSync(path.join(THEMES_DIR, theme.file), "utf8");
  const doc = `<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(SITE.name)} — ${theme.label}</title>
<style>
${baseCss}
${themeCss}
${EXTRA}
</style>
</head>
<body class="theme-${themeKey}">
${inlineImages(inner)}
</body>
</html>`;
  fs.writeFileSync(path.join(OUT, name), doc);
}

for (const [key, theme] of Object.entries(THEMES)) {
  emit(`preview-${key}.html`, homeBody(posts, theme), key);
  console.log(`preview-${key}.html (${theme.label})`);
}
console.log("Done. Open preview/preview-<theme>.html in a browser.");

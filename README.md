# cuijiawei.cn — personal site + blog

A small, dependency-free static site for **Jiawei Cui (崔家维)**.

- **Primary:** self-introduction / personal homepage.
- **Secondary:** a blog of notes on LLMs, deep learning, and engineering.

Built with a tiny Node generator (`build.mjs`) using `marked` + `gray-matter`.
The output is plain HTML/CSS/JS with **root-relative links**, so the exact same
files run on:

- **GitHub Pages** (`jiawei686.github.io`) — push the built files; `.nojekyll` disables Jekyll.
- **cuijiawei.cn** — served by nginx from a static directory on the server.

Both domains serve the identical build. No custom domain is set on GitHub, so the
two sites are fully independent.

## Develop

```bash
npm install
npm run build      # -> dist/
# preview:
cd dist && python3 -m http.server 8099
```

Source content lives in `src/`:

- `src/posts/*.md` — blog posts (front matter: `title`, `date`, `tags`).
- `src/about.md`  — the About page.
- `assets/css/style.css`, `assets/js/main.js` — the design system.
- `build.mjs` — the generator (templates + rendering).

## Deploy

`dist/` is the deployable artifact (static, no build step on the host).

### GitHub Pages
Copy the contents of `dist/` to the repo root and push to the default branch:

```bash
cp -R dist/* .
echo > .nojekyll
git add -A && git commit -m "rebuild site" && git push
```

GitHub Pages serves it as-is (user-site repo → root). No Jekyll, no Actions.

### cuijiawei.cn (nginx)
On the server, serve `dist/` statically. Example nginx server block:

```nginx
server {
    listen 443 ssl;
    server_name cuijiawei.cn;
    root /home/ubuntu/www/cuijiawei;   # <- the dist/ contents
    index index.html;
    location / { try_files $uri $uri/ =404; }
    # ... ssl_certificate / ssl_certificate_key ...
}
```

Then reload: `sudo nginx -t && sudo nginx -s reload`.

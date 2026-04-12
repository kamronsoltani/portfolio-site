# Kamron Soltani Portfolio Site

Clean, responsive, static portfolio website designed for free hosting on GitHub Pages.

## Quick Start

1. Open this folder:
   - `/Users/kamronsoltani/portfolio-site`
2. Add your assets:
   - CV PDF at `assets/Kamron_Soltani_CV.pdf`
   - Project and photography images in `assets/images/`
3. Update content in `index.html`.

## Local Preview

Run this command in the project folder:

```bash
python3 -m http.server 8000
```

Then open: <http://localhost:8000>

## Publish to GitHub Pages

Create a new repo named either:
- `kamronsoltani.github.io` (publishes at root), or
- any other repo (publishes at `https://username.github.io/repo-name`)

Then run:

```bash
git init
git add .
git commit -m "Initial portfolio site"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

In GitHub:
1. Go to **Settings > Pages**
2. Under **Build and deployment**, choose:
   - Source: **Deploy from a branch**
   - Branch: `main` and `/ (root)`
3. Save and wait for deployment.

## Customize

- Color and style: `styles.css`
- Content and section order: `index.html`
- Mobile menu behavior: `script.js`

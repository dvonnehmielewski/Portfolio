# Portfolio

Personal site of D'vonne Hmielewski: computer science at UTSA, ML for security and markets.

**Live:** https://dvonnehmielewski.github.io/Portfolio/

Hand-written HTML, CSS and JavaScript, no framework or build step.

- `index.html`: content and structure (semantic sections, skip link, accessible labels)
- `styles.css`: design tokens, responsive grid (3 columns → 2 → 1), visible focus states
- `main.js`: draws the hero chart, Stockr's out-of-sample volatility forecast vs. realized
  S&P 500 volatility, from `assets/vol.json`. It draws in once on load, respects
  `prefers-reduced-motion`, and reads out values on hover, touch or arrow keys.
- `assets/`: resume PDF, optimized WebP images, chart data, favicon

## Update the resume
Replace `assets/Dvonne_Hmielewski_Resume.pdf` and push.

## Run locally
```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Deploy
GitHub Pages, from the `main` branch root (Settings > Pages > Deploy from a branch > main / root).

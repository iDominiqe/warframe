# Warframe Cycles — GitHub Pages

Static frontend that shows Warframe cycles, Baro Ki'Teer, events, devstreams and server status.

## Files
- `index.html` — main page
- `styles.css` — styles (glassmorphism, parallax, responsive)
- `locales.js` — basic EN/RU toggling
- `app.js` — main JavaScript (fetch worldstate from hub.warframestat.us with fallback)
- `.github/workflows/deploy.yml` — optional deploy workflow

## How to deploy
1. Create GitHub repo (or use existing `iDominiqe/warframe`).
2. Put these files into repo root.
3. Enable GitHub Pages (branch `main` / `/` root) OR use the included Actions workflow to publish to `gh-pages`.
4. Open site at `https://<username>.github.io/<repo>/`.

## Notes
- Sync interval default 30s. Change `SYNC_MS` in `app.js` if needed.
- Uses `hub.warframestat.us` with fallback to `api.warframestat.us`.
- All times shown in 24-hour format.

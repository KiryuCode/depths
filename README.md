# Depths

Underwater viewing canvas for **Ocean Market** — look up/out from under the water across ten dive sites.

## Local preview

Open `index.html` in a browser, or:

```bash
python3 -m http.server 8765 --directory .
# http://127.0.0.1:8765/
```

## Locations

Great Barrier Reef, Monterey Bay, Caribbean Blue Hole, Lake Superior, Amazon Floodplain, Mediterranean Wreck, Galápagos, Norwegian Fjord, Red Sea, Pacific Northwest Inlet.

## Skin hooks (bb5)

- `css/styles.css` — `:root` CSS variables (`--water-*`, `--caustic-opacity`, `--ray-opacity`, `--chrome-*`, `--accent`)
- `js/locations.js` — per-site `waterTint` + fish/props configs
- `js/render.js` — `drawCaustics` / `drawRays` procedural layers

## Deploy

Mirror Beacon: nginx Alpine Docker on zen88 loopback **4844**, host nginx `depths.adavis.cloud`.

```bash
HOST=74.208.35.191 REMOTE_USER=root REMOTE_DIR=/var/www/depths \
  SSH_KEY=/home/neon/.ssh/id_ed25519 bash scripts/deploy.sh
```

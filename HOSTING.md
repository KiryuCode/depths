# Hosting Depths (production)

Static site packaged as Docker Compose (nginx:alpine).

- VPS `root@74.208.35.191` (zen88) → `/var/www/depths`
- Container `127.0.0.1:4844` (`HOST_BIND=127.0.0.1`, `PORT=4844`)
- Host nginx site `depths` → proxy_pass loopback
- Public URL: **https://depths.adavis.cloud**

Port family: ocean-market `:4840`, chllc `:4841`, canopy-goods `:4842`, beacon `:4843`, **depths `:4844`**.

## Deploy

From tetraschool:

```bash
HOST=74.208.35.191 REMOTE_USER=root REMOTE_DIR=/var/www/depths \
  SSH_KEY=/home/neon/.ssh/id_ed25519 bash scripts/deploy.sh
```

After DNS A `depths` → `74.208.35.191`:

```bash
certbot --nginx -d depths.adavis.cloud --redirect
```

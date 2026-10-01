# RoundBuy Admin Panel — Production Deployment (CloudPanel VPS)

Server: `72.61.147.51` (Hostinger, CloudPanel) — same VPS as the backend
Site: `admin.roundbuy.com` — Node.js site, user `roundbuy-admin`
Path: `/home/roundbuy-admin/htdocs/admin.roundbuy.com`
App port: `3001`
Process manager: PM2, app name `roundbuy-admin`

This is a Vite/React SPA, so there's no Node server of its own — `npm run
build` produces static files in `dist/`, and those are served by the
`serve` package (a tiny static file server) run under PM2 so CloudPanel's
Node.js app port has something to proxy to. `serve -l 3001` sets the port
via a CLI flag rather than an env var, which sidesteps the issue we hit on
the backend where CloudPanel's injected `PORT` silently overrode `.env`.

## One-time setup

Run `./bootstrap-production.sh` from `admin-panel/`, in your own terminal
(it needs interactive password prompts). It uploads `.env`, then calls
`./deploy.sh` to sync the code, build it, and start it.

**Assumption to verify:** this setup assumes the `admin.roundbuy.com` site
in CloudPanel was created as a **Node.js** site type (since you gave it a
port). If it's actually a static/PHP site type instead, there's no Node
process to manage — just point CloudPanel's document root at `dist/` and
skip PM2/`serve` entirely. Let me know if that's the case and I'll rewrite
the scripts to just `rsync` the built `dist/` folder directly.

## `.env` (production)

```
VITE_API_URL=https://api.roundbuy.com/backend/api/v1
VITE_APP_NAME=RoundBuy Admin Panel
```

This points at the same `/backend` prefix the mobile/web apps use (see
`backend/PRODUCTION_SETUP.md`), and relies on the backend's
`CORS_ORIGIN` already including `https://admin.roundbuy.com` (it does -
set during the backend bootstrap).

## Ongoing deploys

```bash
./deploy.sh
```

Rsyncs your local `admin-panel/` source to the server (excluding
`node_modules/`, `dist/`, `.env*`), then SSHes in to `npm install`, `npm
run build`, and restart the PM2-managed `serve` process. Run this
directly in your own terminal so SSH/rsync password prompts reach you.

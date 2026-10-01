#!/bin/bash

# =============================================================
# RoundBuy Admin Panel - Live Deployment Script
# Server:  72.61.147.51 (Hostinger VPS, CloudPanel)
# Site:    admin.roundbuy.com
# Path:    /home/roundbuy-admin/htdocs/admin.roundbuy.com
# User:    roundbuy-admin
#
# Usage (run from admin-panel/, in your own terminal so password
# prompts work):
#   ./deploy.sh
#
# What it does:
#   1. rsyncs your local admin-panel/ source straight to the server
#      (no git/GitHub involved - excludes node_modules, dist/, .env*)
#   2. npm install + npm run build on the server (produces dist/)
#   3. serves dist/ as a static SPA on port 3001 via the `serve`
#      package, managed by PM2 (so CloudPanel's Node.js app port
#      matches regardless of any env var CloudPanel injects)
#   4. health-checks https://admin.roundbuy.com
#
# First time only: run ./bootstrap-production.sh instead, which
# uploads .env, then calls this.
# =============================================================

set -euo pipefail

REMOTE_HOST="72.61.147.51"
REMOTE_USER="roundbuy-admin"
REMOTE_PATH="/home/roundbuy-admin/htdocs/admin.roundbuy.com"
PM2_APP_NAME="roundbuy-admin"
APP_PORT="3001"
HEALTH_URL="https://admin.roundbuy.com"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=============================================${NC}"
echo -e "${BLUE}  RoundBuy Admin Panel - Live Deployment    ${NC}"
echo -e "${BLUE}=============================================${NC}"
echo ""

# ─── Step 1: Sync source code ────────────────────────────────
echo -e "${YELLOW}[1/3] Syncing source code to server...${NC}"
rsync -az --delete \
  --exclude 'node_modules/' \
  --exclude 'dist/' \
  --exclude '.env' \
  --exclude '.env.production' \
  --exclude '.env.local' \
  --exclude '.deploy-tmp/' \
  --exclude '.git/' \
  --exclude '*.log' \
  --exclude '.DS_Store' \
  ./ "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/"
echo -e "${GREEN}✓ Code synced${NC}"

# ─── Step 2: Build and (re)start (remote) ────────────────────
echo -e "${YELLOW}[2/3] Installing, building, and starting on server...${NC}"
ssh "${REMOTE_USER}@${REMOTE_HOST}" bash -s -- "$REMOTE_PATH" "$PM2_APP_NAME" "$APP_PORT" <<'REMOTE_SCRIPT'
set -e
REMOTE_PATH="$1"
PM2_APP_NAME="$2"
APP_PORT="$3"

cd "$REMOTE_PATH"

# npm/node aren't on PATH in this non-interactive shell (NVM's rc-file
# hook isn't wired up here) - load them directly instead.
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  . "$NVM_DIR/nvm.sh"
elif [ -d "$NVM_DIR/versions/node" ]; then
  NODE_BIN_DIR=$(ls -d "$NVM_DIR"/versions/node/*/bin 2>/dev/null | tail -1)
  export PATH="$NODE_BIN_DIR:$PATH"
fi
echo "  → using node $(command -v node) ($(node -v))"

echo "  → npm install..."
npm install

echo "  → npm run build..."
npm run build

echo "  → Ensuring PM2 and serve are available..."
command -v pm2 >/dev/null 2>&1 || npm install -g pm2
command -v serve >/dev/null 2>&1 || npm install -g serve

echo "  → Restarting PM2 process '$PM2_APP_NAME'..."
if pm2 describe "$PM2_APP_NAME" > /dev/null 2>&1; then
  pm2 restart "$PM2_APP_NAME" --update-env
else
  pm2 start serve --name "$PM2_APP_NAME" -- -s dist -l "$APP_PORT"
fi
pm2 save
pm2 status
REMOTE_SCRIPT
echo -e "${GREEN}✓ Server updated and restarted${NC}"

# ─── Health check ─────────────────────────────────────────────
echo -e "${YELLOW}[3/3] Waiting for the app to come back up...${NC}"
sleep 3
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$HEALTH_URL" || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ $HEALTH_URL responded 200 OK${NC}"
else
  echo -e "${RED}✗ $HEALTH_URL responded with HTTP $HTTP_CODE - check 'pm2 logs $PM2_APP_NAME' on the server${NC}"
fi

echo ""
echo -e "${GREEN}=============================================${NC}"
echo -e "${GREEN}  ✅ Admin Panel Deployed Successfully!      ${NC}"
echo -e "${GREEN}=============================================${NC}"
echo -e "  ${BLUE}Path:${NC} $REMOTE_PATH"
echo -e "  ${BLUE}PM2:${NC}  $PM2_APP_NAME"
echo -e "  ${BLUE}Time:${NC} $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

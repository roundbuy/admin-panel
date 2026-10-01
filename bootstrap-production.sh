#!/bin/bash

# =============================================================
# RoundBuy Admin Panel - ONE-TIME Production Bootstrap
# Run this ONCE from your own terminal (needs interactive password
# prompts, which only work when you run it directly). After this
# succeeds, use ./deploy.sh for every future deploy.
#
# What it does:
#   1. Shows you what's currently in the server's site directory
#   2. Uploads the prepared production .env
#   3. Calls ./deploy.sh, which syncs code, builds, ensures PM2 +
#      serve are installed, starts the app, and health-checks it
# =============================================================

set -euo pipefail

REMOTE_HOST="72.61.147.51"
REMOTE_USER="roundbuy-admin"
REMOTE_PATH="/home/roundbuy-admin/htdocs/admin.roundbuy.com"

ENV_FILE="$(pwd)/.deploy-tmp/admin-panel.env.production"

if [ ! -f "$ENV_FILE" ]; then
  echo "Expected file not found in .deploy-tmp/ - run this from admin-panel/"
  exit 1
fi

echo "== Step 1/3: Inspecting remote directory =="
ssh "${REMOTE_USER}@${REMOTE_HOST}" "mkdir -p '${REMOTE_PATH}' && ls -la '${REMOTE_PATH}'"
echo ""
read -p "Continue and set this directory up as the live admin panel? [y/N] " CONFIRM
if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
  echo "Aborted."
  exit 1
fi

echo "== Step 2/3: Uploading production .env =="
scp "$ENV_FILE" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/.env"
echo "  ✓ .env uploaded"

echo "== Step 3/3: Syncing code, building, starting app =="
./deploy.sh

echo ""
echo "Bootstrap complete. From now on, just run ./deploy.sh for future changes."

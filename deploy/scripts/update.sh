#!/usr/bin/env bash
# update.sh — Zero-downtime rolling update (pull latest → rebuild → restart)
# Usage: ./deploy/scripts/update.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
COMPOSE="docker compose -f $ROOT_DIR/docker-compose.prod.yml"

cd "$ROOT_DIR"

[[ -f .env.prod ]] || { echo "✗ .env.prod not found"; exit 1; }

echo "▶ Creating pre-update database backup..."
"$SCRIPT_DIR/backup.sh" || echo "⚠ Backup failed — continuing anyway"

echo "▶ Pulling latest code..."
git pull --ff-only

echo "▶ Building new images..."
$COMPOSE build --pull

echo "▶ Restarting backend with zero-downtime..."
$COMPOSE up -d --no-deps --build backend

echo "▶ Restarting frontend..."
$COMPOSE up -d --no-deps --build frontend

echo "▶ Running health checks..."
"$SCRIPT_DIR/health-check.sh"

echo "▶ Cleaning up dangling images..."
docker image prune -f

echo "✅ Update complete!"

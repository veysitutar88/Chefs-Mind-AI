#!/usr/bin/env bash
# rollback.sh — Roll back to the previous git commit and redeploy
# Usage: ./deploy/scripts/rollback.sh [commit-sha]
#   commit-sha: specific commit to roll back to (default: HEAD~1)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
COMPOSE="docker compose -f $ROOT_DIR/docker-compose.prod.yml"

TARGET="${1:-HEAD~1}"

cd "$ROOT_DIR"

CURRENT=$(git rev-parse --short HEAD)
echo "▶ Current commit: $CURRENT"

ROLLBACK=$(git rev-parse --short "$TARGET")
echo "▶ Rolling back to: $ROLLBACK ($TARGET)"

read -rp "   Confirm rollback? [y/N] " confirm
[[ "$confirm" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 0; }

echo "▶ Creating pre-rollback database backup..."
"$SCRIPT_DIR/backup.sh" || echo "⚠ Backup failed — continuing anyway"

echo "▶ Checking out $ROLLBACK..."
git checkout "$TARGET"

echo "▶ Rebuilding images..."
$COMPOSE build --pull

echo "▶ Redeploying..."
$COMPOSE up -d --no-deps --build backend frontend

echo "▶ Running health checks..."
"$SCRIPT_DIR/health-check.sh"

echo "✅ Rolled back to $ROLLBACK"
echo "   To return to $CURRENT: git checkout $CURRENT && ./deploy/scripts/update.sh"

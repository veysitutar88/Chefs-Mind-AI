#!/usr/bin/env bash
# deploy.sh — Full production deployment (first-time or clean re-deploy)
# Usage: ./deploy/scripts/deploy.sh [--no-backup]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
COMPOSE="docker compose -f $ROOT_DIR/docker-compose.prod.yml"
NO_BACKUP="${1:-}"

# ── Preflight ────────────────────────────────────────────────────────────────
cd "$ROOT_DIR"

echo "▶ Checking prerequisites..."
command -v docker  >/dev/null 2>&1 || { echo "✗ docker not found"; exit 1; }
command -v docker compose >/dev/null 2>&1 2>&1 || { echo "✗ docker compose not found"; exit 1; }
[[ -f .env.prod ]] || { echo "✗ .env.prod not found — copy .env.prod.example and fill in values"; exit 1; }

# Source env for variable checks
set -a; source .env.prod; set +a

[[ -n "${POSTGRES_PASSWORD:-}" ]] || { echo "✗ POSTGRES_PASSWORD not set in .env.prod"; exit 1; }
[[ -n "${REDIS_PASSWORD:-}"    ]] || { echo "✗ REDIS_PASSWORD not set in .env.prod";    exit 1; }
[[ -n "${SESSION_SECRET:-}"    ]] || { echo "✗ SESSION_SECRET not set in .env.prod";    exit 1; }

# ── Backup (optional, skipped with --no-backup) ──────────────────────────────
if [[ "$NO_BACKUP" != "--no-backup" ]]; then
  echo "▶ Creating pre-deploy database backup..."
  "$SCRIPT_DIR/backup.sh" || echo "⚠ Backup failed — continuing anyway"
fi

# ── Pull / Build ─────────────────────────────────────────────────────────────
echo "▶ Building images..."
$COMPOSE build --pull

# ── Start services ────────────────────────────────────────────────────────────
echo "▶ Starting infrastructure (db + redis)..."
$COMPOSE up -d db redis
echo "   Waiting for database to be healthy..."
timeout 60 bash -c "until $COMPOSE exec -T db pg_isready -U \"\$POSTGRES_USER\" -d \"\$POSTGRES_DB\" 2>/dev/null; do sleep 2; done"

echo "▶ Starting application services..."
$COMPOSE up -d backend frontend prometheus

# ── Health check ─────────────────────────────────────────────────────────────
echo "▶ Waiting for services to become healthy..."
"$SCRIPT_DIR/health-check.sh"

echo ""
echo "✅ Deployment complete!"
echo "   Backend:    http://localhost:5001/health"
echo "   Frontend:   http://localhost:3000"
echo "   Prometheus: http://127.0.0.1:9090"

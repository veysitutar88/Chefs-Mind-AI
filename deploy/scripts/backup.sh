#!/usr/bin/env bash
# backup.sh — PostgreSQL database backup to compressed SQL dump
# Usage: ./deploy/scripts/backup.sh
# Backups are stored in: deploy/backups/
# Retention: keeps the last 7 daily backups automatically
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
COMPOSE="docker compose -f $ROOT_DIR/docker-compose.prod.yml"
BACKUP_DIR="$ROOT_DIR/deploy/backups"
RETAIN_DAYS="${BACKUP_RETAIN_DAYS:-7}"

[[ -f "$ROOT_DIR/.env.prod" ]] || { echo "✗ .env.prod not found"; exit 1; }
set -a; source "$ROOT_DIR/.env.prod"; set +a

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="chefsmind_${TIMESTAMP}.sql.gz"
FILEPATH="$BACKUP_DIR/$FILENAME"

mkdir -p "$BACKUP_DIR"

echo "▶ Backing up PostgreSQL database to $FILENAME..."
$COMPOSE exec -T db pg_dump \
  -U "${POSTGRES_USER}" \
  -d "${POSTGRES_DB}" \
  --no-password \
  | gzip > "$FILEPATH"

SIZE=$(du -sh "$FILEPATH" | cut -f1)
echo "   ✅ Backup complete: $FILENAME ($SIZE)"

# ── Prune old backups ────────────────────────────────────────────────────────
PRUNED=$(find "$BACKUP_DIR" -name "chefsmind_*.sql.gz" -mtime "+$RETAIN_DAYS" -print -delete | wc -l)
if (( PRUNED > 0 )); then
  echo "   🗑  Pruned $PRUNED backup(s) older than $RETAIN_DAYS days"
fi

echo "   📁 Backups stored in: $BACKUP_DIR"

#!/usr/bin/env bash
# logs.sh — Tail logs for all or a specific service
# Usage: ./deploy/scripts/logs.sh [service] [--lines N]
#   service: backend | frontend | db | redis | prometheus (default: all)
#   --lines N: number of lines to show initially (default: 100)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
COMPOSE="docker compose -f $ROOT_DIR/docker-compose.prod.yml"

SERVICE="${1:-}"
LINES="${2:-100}"

# Strip --lines flag if passed
if [[ "$SERVICE" == "--lines" ]]; then
  LINES="${2:-100}"
  SERVICE=""
fi

if [[ -n "$SERVICE" ]]; then
  echo "▶ Tailing logs for '$SERVICE' (last $LINES lines, Ctrl+C to stop)..."
  $COMPOSE logs --follow --tail="$LINES" "$SERVICE"
else
  echo "▶ Tailing logs for all services (last $LINES lines, Ctrl+C to stop)..."
  $COMPOSE logs --follow --tail="$LINES"
fi

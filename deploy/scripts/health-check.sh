#!/usr/bin/env bash
# health-check.sh — Verify all services are healthy
# Usage: ./deploy/scripts/health-check.sh
# Exit code: 0 = all healthy, 1 = one or more unhealthy
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
COMPOSE="docker compose -f $ROOT_DIR/docker-compose.prod.yml"

TIMEOUT="${HEALTH_TIMEOUT:-90}"
SLEEP=3
ALL_OK=true

check_service() {
  local service="$1"
  local url="$2"
  local elapsed=0

  printf "   %-12s " "$service:"
  while (( elapsed < TIMEOUT )); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      echo "✅ healthy"
      return 0
    fi
    sleep $SLEEP
    (( elapsed += SLEEP )) || true
    printf "."
  done
  echo "❌ unhealthy after ${TIMEOUT}s"
  return 1
}

echo "▶ Health checks (timeout: ${TIMEOUT}s per service)"

check_service "backend"    "http://localhost:5001/health" || ALL_OK=false
check_service "frontend"   "http://localhost:3000"        || ALL_OK=false
check_service "prometheus" "http://127.0.0.1:9090/-/healthy" || ALL_OK=false

echo ""
echo "▶ Container status:"
$COMPOSE ps

if [[ "$ALL_OK" == "true" ]]; then
  echo ""
  echo "✅ All services healthy"
  exit 0
else
  echo ""
  echo "❌ One or more services are unhealthy — check logs with: ./deploy/scripts/logs.sh"
  exit 1
fi

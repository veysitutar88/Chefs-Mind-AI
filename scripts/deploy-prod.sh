#!/usr/bin/env bash
set -euo pipefail
ROOT=$(pwd)
mkdir -p "$ROOT/reports"
docker compose -f docker-compose.prod.yml build > reports/prod_build.log 2>&1
docker compose -f docker-compose.prod.yml up -d > reports/prod_up.log 2>&1
echo "Deploy done."
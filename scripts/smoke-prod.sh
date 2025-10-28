#!/usr/bin/env bash
set -euo pipefail
ROOT=$(pwd)
mkdir -p "$ROOT/reports"
echo "[SMOKE] Backend health" > reports/prod_smoke.log
curl -sS http://localhost:5001/health >> reports/prod_smoke.log || true
echo -e "\n[SMOKE] Frontend head" >> reports/prod_smoke.log
curl -sSI http://localhost:3000 >> reports/prod_smoke.log || true
echo -e "\n[SMOKE] Done" >> reports/prod_smoke.log
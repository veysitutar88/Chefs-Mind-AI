#!/usr/bin/env bash
set -euo pipefail
ROOT=$(pwd)
mkdir -p "$ROOT/reports"
npm ci
pushd frontend-enhanced
npm ci
npm run build > "$ROOT/reports/ci_build.log" 2>&1
popd
npx next lint > reports/ci_lint.log 2>&1 || true
tsc -p . --noEmit > reports/ci_tsc.log 2>&1 || true
echo "Smoke local done."
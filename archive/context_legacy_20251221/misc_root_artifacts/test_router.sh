#!/usr/bin/env bash
set -euo pipefail
HOST="${HOST:-https://7e0677e6-992a-40c1-b872-b932e492264d-00-3owuu6an605o6.riker.replit.dev}"
PASS="${ADMIN_PASS:-270674}"
jq() { node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{try{console.log(JSON.stringify(JSON.parse(s),null,2))}catch{console.log(s)}})'; }

# 0) login (cookie)
CK="$(mktemp)"; trap 'rm -f "$CK"' EXIT
curl -sS -L "$HOST/api/login" -H 'Content-Type: application/json' -c "$CK" -d "{\"password\":\"$PASS\"}" >/dev/null

ask () {
  local role="$1"; shift
  local q="$*"
  local body=$(printf '{"role":"%s","query":%s,"meta":{"debug":true}}' "$role" "$(node -p "JSON.stringify(process.argv[1])" "$q")")
  local t0=$(date +%s%3N)
  resp=$(curl -sS "$HOST/api/universal-ask" -b "$CK" -H 'Content-Type: application/json' -d "$body")
  local t1=$(date +%s%3N)
  echo "=== $role :: $q"
  echo "$resp" | jq
  echo "tTotal_ms=$((t1-t0))"
  echo
}

echo "== health =="; curl -sS "$HOST/api/health" | jq; echo
echo "== models =="; curl -sS "$HOST/api/models" | jq; echo

ask "Chef" "Рецепт салата Оливье на 6 порций, кратко."
ask "Accountant" "Синтезируй безопасный SQL запрос к продажам за неделю (описать обсценки и проверку инъекций)."
ask "Research" "Составь план запуска кухни на 30 дней с рисками и KPI."
ask "MediaPrompter" "Сцена: блюдо-герой, нейтральный фон, мягкий свет — подготовь фотореалистичный промпт."

echo "== done =="

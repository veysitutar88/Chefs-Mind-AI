#!/usr/bin/env bash
set -Eeuo pipefail
HOST="${HOST:-https://7e0677e6-992a-40c1-b872-b932e492264d-00-3owuu6an605o6.riker.replit.dev}"
PASS="${ADMIN_PASS:-270674}"
pp(){ node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{try{console.log(JSON.stringify(JSON.parse(s),null,2))}catch{console.log(s)}})'; }

# 0) Логин: cookie + JWT (используем Bearer, если удалось)
CK="$(mktemp)"; trap 'rm -f "$CK"' EXIT
curl -sS -L "$HOST/api/login" -H 'Content-Type: application/json' -c "$CK" -d "{\"password\":\"$PASS\"}" >/dev/null || true
TOKEN="$(curl -sS "$HOST/auth/login" -H 'Content-Type: application/json' -d "{\"password\":\"$PASS\"}" \
  | node -e "let s='';process.stdin.on('data',d=>s+=d);process.stdin.on('end',()=>{try{const j=JSON.parse(s);process.stdout.write(j.access_token||j.token||'')}catch{}})")"
if [ -n "$TOKEN" ]; then AUTH=(-H "Authorization: Bearer $TOKEN"); else AUTH=(-b "$CK"); fi

echo "== health =="; curl -sS "$HOST/api/health" | pp; echo
echo "== models ==";  curl -sS "$HOST/api/models" "${AUTH[@]}" -b "$CK" | pp; echo

ask(){ local role="$1"; shift; local q="$*"; local body=$(printf '{"role":"%s","query":%s,"meta":{"debug":true}}' "$role" "$(node -p "JSON.stringify(process.argv[1])" "$q")"); \
  echo "=== $role :: $q"; curl -sS "$HOST/api/universal-ask" -H 'Content-Type: application/json' "${AUTH[@]}" -b "$CK" -d "$body" | pp; echo; }
ask "Chef" "Рецепт салата Оливье на 6 порций, кратко."
ask "Accountant" "Синтезируй безопасный SQL к продажам за неделю."
ask "Research" "План запуска кухни на 30 дней с рисками и KPI."
ask "MediaPrompter" "Сцена: блюдо-герой, нейтральный фон, мягкий свет — промпт для фотореалистичного фото."
echo "== done =="

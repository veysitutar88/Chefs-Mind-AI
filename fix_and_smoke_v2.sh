#!/usr/bin/env bash
# one-shot: HOST нормализация, SAFE_MODE, JWT+cookie, NEG/SEED/SMOKE
set -Eeuo pipefail

# === Конфиг (можно переопределить через env) ===
HOST="${HOST:-https://7e0677e6-992a-40c1-b872-b932e492264d-00-3owuu6an605o6.riker.replit.dev}"
ADMIN_PASS="${ADMIN_PASS:-270674}"

# === Утилиты ===
pp(){ node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{try{console.log(JSON.stringify(JSON.parse(s),null,2))}catch{console.log(s)}})'; }
have(){ command -v "$1" >/dev/null 2>&1; }

# === 0) Нормализация HOST (снимаем цепочки редиректов, чтоб не терять заголовки) ===
canonize(){
  local url="$1" i=0
  while :; do
    hdrs="$(curl -sS -I --max-redirs 0 "$url" || true)"
    code="$(printf "%s" "$hdrs" | awk 'NR==1{print $2}')"
    loc="$(printf "%s" "$hdrs" | awk 'BEGIN{IGNORECASE=1}/^Location:/{print $2;exit}' | tr -d '\r')"
    [[ "$code" =~ ^3[0-9][0-9]$ && -n "$loc" && $i -lt 5 ]] || break
    url="${loc%/}"; i=$((i+1))
  done
  echo "${url%/}"
}
HOST="$(canonize "$HOST")"
echo "HOST=$HOST"

# === 1) SAFE_MODE включить и подготовить код ===
if [ ! -f .safe_confirm ]; then
  if have openssl; then openssl rand -hex 12 > .safe_confirm
  else node -e "console.log(require('crypto').randomBytes(12).toString('hex'))" > .safe_confirm
  fi
  echo "Generated .safe_confirm"
fi
CONFIRM_CODE="$(cat .safe_confirm)"
if [ -f .env ]; then grep -q '^SAFE_MODE=1' .env || echo 'SAFE_MODE=1' >> .env; else echo 'SAFE_MODE=1' > .env; fi
echo "SAFE_MODE=1; X-Confirm-Code ready."

# === 2) Логины: cookie И JWT (берём оба и используем вместе) ===
COOKIES="$(mktemp)"; trap 'rm -f "$COOKIES"' EXIT

# cookie (на случай, если universal-ask ждёт сессию)
curl -sS -L "$HOST/api/login" -H 'Content-Type: application/json' \
  -c "$COOKIES" -d "{\"password\":\"$ADMIN_PASS\"}" -o /dev/null || true

# JWT (основной способ)
TOKEN="$(curl -sS "$HOST/auth/login" -H 'Content-Type: application/json' -d "{\"password\":\"$ADMIN_PASS\"}" \
        | node -e 'let s=\"\";process.stdin.on(\"data\",d=>s+=d);process.stdin.on(\"end\",()=>{try{console.log(JSON.parse(s).access_token||\"\")}catch{}})')"
if [ -z "$TOKEN" ]; then echo "E: JWT login failed. Проверь HOST/пароль."; exit 1; fi
AUTH=(-H "Authorization: Bearer $TOKEN" -b "$COOKIES" -c "$COOKIES")

# === 3) /api/health (если есть) ===
echo "→ /api/health (может быть 200 или 404 — это не критично)"
curl -sS "$HOST/api/health" | pp || echo "(нет эндпоинта /api/health — продолжим)"

# === 4) NEG-тесты SAFE_MODE (ожидаем 403). ВАЖНО: без редиректов! ===
echo "→ NEG: без X-Confirm-Code (expect 403)"
curl -sS -i --max-redirs 0 -X POST "$HOST/api/import/upload?table=units&mode=upsert" \
  "${AUTH[@]}" -F "file=@/etc/hosts" | sed -n '1,15p' || true

echo "→ NEG: неправильный X-Confirm-Code (expect 403)"
curl -sS -i --max-redirs 0 -X POST "$HOST/api/import/upload?table=units&mode=upsert" \
  -H "X-Confirm-Code: WRONG" "${AUTH[@]}" -F "file=@/etc/hosts" | sed -n '1,15p' || true

# === 5) Seed (units/categories/suppliers) — ПОЛОЖИТЕЛЬНЫЙ сценарий ===
echo "→ SEED (с правильным X-Confirm-Code)"
cat > units.csv <<'CSV'
code,name
kg,Килограмм
g,Грамм
l,Литр
ml,Миллилитр
pcs,Штука
CSV

cat > categories.csv <<'CSV'
name,kind
Молочные продукты,ingredient
Овощи,ingredient
Соусы,ingredient
Заготовки,recipe
Горячие блюда,recipe
CSV

cat > suppliers.csv <<'CSV'
name,code,phone,email
Metro,metro,+49-30-123456,metro@example.com
Edeka,edeka,+49-30-654321,edeka@example.com
CSV

UP="$HOST/api/import/upload?mode=upsert&table="

echo "  - units"
curl -sS --max-redirs 0 -X POST "${UP}units"      -H "X-Confirm-Code: $CONFIRM_CODE" "${AUTH[@]}" \
  -F "file=@units.csv"      -F 'map={"code":"code","name":"name"}' | pp

echo "  - categories"
curl -sS --max-redirs 0 -X POST "${UP}categories" -H "X-Confirm-Code: $CONFIRM_CODE" "${AUTH[@]}" \
  -F "file=@categories.csv" -F 'map={"name":"name","kind":"kind"}' | pp

echo "  - suppliers"
curl -sS --max-redirs 0 -X POST "${UP}suppliers"  -H "X-Confirm-Code: $CONFIRM_CODE" "${AUTH[@]}" \
  -F "file=@suppliers.csv"  -F 'map={"name":"name","code":"code","phone":"phone","email":"email"}' | pp

# === 6) Smoke /api/universal-ask (4 роли) ===
echo "→ Smoke: Accountant"
curl -sS "$HOST/api/universal-ask" -H "Content-Type: application/json" "${AUTH[@]}" \
  -d '{"role":"Accountant","query":"Show top 5 suppliers"}' | pp

echo "→ Smoke: Chef"
curl -sS "$HOST/api/universal-ask" -H "Content-Type: application/json" "${AUTH[@]}" \
  -d '{"role":"Chef","query":"German potato soup"}' | pp

echo "→ Smoke: Media"
curl -sS "$HOST/api/universal-ask" -H "Content-Type: application/json" "${AUTH[@]}" \
  -d '{"role":"Media","query":"Modern restaurant interior with warm lighting","context":{"model":"imagen-3"}}' | pp

echo "→ Smoke: Research"
curl -sS "$HOST/api/universal-ask" -H "Content-Type: application/json" "${AUTH[@]}" \
  -d '{"role":"Research","query":"AI in restaurants 2025"}' | pp

echo "OK: fix_and_smoke_v2 completed."

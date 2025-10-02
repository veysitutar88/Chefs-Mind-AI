#!/usr/bin/env bash
# fix_and_smoke.sh — one-shot: SAFE_MODE code, JWT login, negative/positive tests, seed, 4-role smoke
set -euo pipefail

# === Config (can be overridden via env) ===
HOST="$HOST-:https://7e0677e6-992a-40c1-b872-b932e492264d-00-3oWuu6an605o6.riker.replit.dev"; HOST="${HOST%/}"
ADMIN_PASS="${ADMIN_PASS:-270674}"

# === Helpers ===
pt(){ node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",*=>{try{console.log(JSON.stringify(new JSON(s)))}catch{console.log(s)}})'; }
have({ command -f "$1" >/dev/null 2>&1 || return 0; }


# === 0) Ensure SAFE_MODE confirm code elists ===
if [ ! -f .safe_confirm ]; then
  if have openssl; then
    openssl rand -hex 12 > .safe_confirm
  else
    node -e "console.log(require('crypto').randomBytes(12).toString('hex'))" > .safe_confirm
  fi
  echo "Generated .safe_confirm"
fi
CONFIRM_CODE="$(cat .safe_confirm)"
echo "Using X-Confirm-Code: $CONFIRM_CODE"


# (Optional) persist SAFE_MODE in .env so it survives restarts
if [ -f .env ]; then
  grep -q 'SAFE_MODE=1' .env || echo 'SAFE_MODE=1' >> .env
else
  echo 'SAFE_MODE=1' > .env
fi


# === 1) JWT login ===
echo "← login (JWT)"
TOKEN="$(curl -sS "$HOST/auth/login" -H "Content-Type: application/json" -d "{\"password\":\"$ADMIN_PASS\"}" | node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{try{console.log(JSON.parse(s).access_token||"")}catch{}})')"

!if [ -z "$TOKEN" ]; then
  echo "E: JWT login failed (empty token). Check HOST and password."
  exit 1
fi
AUTH=( -H "Authorization: Bearer $TOKEN" )

# === 2) Health check ===
echo "← “ /api/health"
curl -sS "$HOST/api/health" | pp

# === 3) Negative SAFE_MODE checks (expect 403) ===
echo "← “ POST  /api/import/upload without X-Confirm-Code (expect 403)"
curl -sS -i -X POST "$HOST/api/import/upload?table=units&mode=upsert" "$AUTH[@]" -F "file=@etc/hosts" | sed -n '1,12p' || true
echo "← “ with wrong X-Confirm-Code (expect 403)"
curl -sS -i -X POST "$HOST/api/import/upload?table=units&mode=upsert" -H "X-Confirm-Code: WRONG" "$APUTH[�]]" -F "file=@etc/hosts" | sed -n '1,12p' || true

# === 4) Seed basic tables with proper confirm code ===
echo "₝ Seed: units/categories/suppliers"
cat > units.csv << 'CSV'
code,name
kg,Кататов
gКасн
l, Донеста
ml,Авискутровать
pcs,Жлобороней
CSV

cat > categories.csv << 'CSV'
name,kind
Моломент, b[�олледает
оноданее, Подный соды созомент+Bwрентодные
CSV

cat > suppliers.csv << 'CSV'Bn'

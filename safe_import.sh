#!/usr/bin/env bash
set -euo pipefail

HOST_RAW="${HOST:-https://7e0677e6-992a-40c1-b872-b932e492264d-00-3owuu6an605o6.riker.replit.dev/}"
ADMIN_PASS="${ADMIN_PASS:-270674}"
CONFIRM_CODE="${CONFIRM_CODE:-$(cat .safe_confirm 2>/dev/null || echo)}"

HOST="${HOST_RAW%/}"
COOKIES="$(mktemp)"; trap 'rm -f "$COOKIES"' EXIT

read -rp "Target table [ingredients|ingredient_prices|recipes|recipe_components|suppliers|units|categories]: " TABLE
read -rp "Path to file (CSV or HTML table): " FILE
read -rp "Mapping JSON (FileCol->DBcol) or blank to pass as-is: " MAP

[[ -f "$FILE" ]] || { echo "File not found: $FILE"; exit 1; }

echo "→ Login /api/login…"
LOGIN_RESP_API=$(curl -sS -D - "$HOST/api/login" -H "Content-Type: application/json" -H "Accept: application/json" -c "$COOKIES" -d "{\"password\":\"$ADMIN_PASS\"}")
HTTP_API=$(printf "%s" "$LOGIN_RESP_API" | head -n 1 | awk '{print $2}')

TOKEN=""
if [[ "$HTTP_API" != "200" && "$HTTP_API" != "204" ]]; then
  echo "→ Fallback /auth/login…"
  LOGIN_RESP_AUTH=$(curl -sS "$HOST/auth/login" -H "Content-Type: application/json" -H "Accept: application/json" -d "{\"password\":\"$ADMIN_PASS\"}")
  TOKEN=$(printf "%s" "$LOGIN_RESP_AUTH" | node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{try{const j=JSON.parse(s);console.log(j.access_token||j.token||"")}catch{console.log("")}})')
fi

echo "→ Upload & upsert to $TABLE …"
if [[ -n "$TOKEN" ]]; then
  curl -sS -X POST "$HOST/api/import/upload?table=$TABLE&mode=upsert" \
    -H "Authorization: Bearer $TOKEN" \
    -H "X-Confirm-Code: $CONFIRM_CODE" \
    -F "file=@${FILE}" \
    -F "map=${MAP}" | node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{try{console.log(JSON.stringify(JSON.parse(s),null,2))}catch{console.log(s)}})'
else
  curl -sS -X POST "$HOST/api/import/upload?table=$TABLE&mode=upsert" \
    -H "X-Confirm-Code: $CONFIRM_CODE" \
    -b "$COOKIES" -c "$COOKIES" \
    -F "file=@${FILE}" \
    -F "map=${MAP}" | node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{try{console.log(JSON.stringify(JSON.parse(s),null,2))}catch{console.log(s)}})'
fi

echo "✅ Import finished."

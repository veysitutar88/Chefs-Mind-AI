#!/usr/bin/env bash
set -euo pipefail

# ====== SET VALUES HERE ======
HOST_RAW="${HOST:-https://7e0677e6-992a-40c1-b872-b932e492264d-00-3owuu6an605o6.riker.replit.dev/}"
ADMIN_PASS="${ADMIN_PASS:-270674}"
CONFIRM_CODE="${CONFIRM_CODE:-$(cat .safe_confirm 2>/dev/null || echo)}"
# =============================

# 1) Normalize HOST (remove trailing slash)
HOST="${HOST_RAW%/}"
echo "HOST=$HOST"

# 2) Prepare temp cookie jar
COOKIES="$(mktemp)"
trap 'rm -f "$COOKIES"' EXIT

# 3) Try login (session first: /api/login), then fallback to /auth/login (JWT)
echo "→ Trying /api/login (session cookie)…"
LOGIN_RESP_API=$(curl -sS -D - "$HOST/api/login" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -c "$COOKIES" \
  -d "{\"password\":\"$ADMIN_PASS\"}")

HTTP_API=$(printf "%s" "$LOGIN_RESP_API" | head -n 1 | awk '{print $2}')
if [[ "$HTTP_API" != "200" && "$HTTP_API" != "204" ]]; then
  echo "→ /api/login not 200 (${HTTP_API}). Trying /auth/login (JWT)…"
  LOGIN_RESP_AUTH=$(curl -sS "$HOST/auth/login" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d "{\"password\":\"$ADMIN_PASS\"}")
  # extract access_token if present
  TOKEN=$(printf "%s" "$LOGIN_RESP_AUTH" | node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{try{const j=JSON.parse(s);console.log(j.access_token||j.token||"")}catch{console.log("")}})')
else
  TOKEN=""
fi

if [[ -n "${TOKEN:-}" ]]; then
  echo "✅ JWT token acquired"
else
  echo "ℹ️ Working with session cookie (no JWT token)"
fi

# 4) Apply DDL (no -L to avoid SPA redirects). Add confirm header.
echo "→ Applying DDL…"
if [[ -n "${TOKEN:-}" ]]; then
  curl -sS -i -X POST "$HOST/api/db/apply-ddl" \
    -H "Authorization: Bearer $TOKEN" \
    -H "X-Confirm-Code: $CONFIRM_CODE"
else
  curl -sS -i -X POST "$HOST/api/db/apply-ddl" \
    -H "X-Confirm-Code: $CONFIRM_CODE" \
    -b "$COOKIES" -c "$COOKIES"
fi
echo
echo "→ DDL done."

# 5) Check safe status (pretty print via node, без jq)
echo "→ Checking /api/safe/status…"
SAFE_JSON=$(curl -sS "$HOST/api/safe/status")
printf "%s" "$SAFE_JSON" | node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{try{console.log(JSON.stringify(JSON.parse(s),null,2))}catch{console.log(s)}})'

echo "✅ Completed."

#!/usr/bin/env bash
set -euo pipefail
# One-shot: login -> (optional) DDL -> seed -> smoke tests

# defaults (override by env)
HOST="${HOST:-https://7e0677e6-992a-40c1-b872-b932e492264d-00-3owuu6an605o6.riker.replit.dev}"
ADMIN_PASS="${ADMIN_PASS:-270674}"
CONFIRM_CODE="${CONFIRM_CODE:-$(cat .safe_confirm 2>/dev/null || echo)}"
SEED="${SEED:-1}"        # 1 seed basics, 0 skip
APPLY_DDL="${APPLY_DDL:-0}" # 1 apply ddl, 0 skip
HOST="${HOST%/}"

COOKIES="$(mktemp)"; trap 'rm -f "$COOKIES"' EXIT

pp(){ node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{try{console.log(JSON.stringify(JSON.parse(s),null,2))}catch{console.log(s)}})'; }
jstr(){ node -e 'console.log(JSON.stringify(process.argv[1]))' -- "$1"; }

say(){ printf "\n== %s ==\n" "$*"; }
ok(){ printf "OK: %s\n" "$*"; }

login(){
  say "login /api/login"
  local code
  code=$(curl -sS -D - "$HOST/api/login" \
    -H "Content-Type: application/json" -H "Accept: application/json" \
    -c "$COOKIES" -d "{\"password\":\"$ADMIN_PASS\"}" \
    | head -n1 | awk '{print $2}')
  if [[ "$code" == "200" || "$code" == "204" ]]; then
    TOKEN=""
    ok "cookie session"
    return
  fi
  say "fallback /auth/login"
  local resp
  resp=$(curl -sS "$HOST/auth/login" \
    -H "Content-Type: application/json" -H "Accept: application/json" \
    -d "{\"password\":\"$ADMIN_PASS\"}")
  TOKEN=$(printf "%s" "$resp" | node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{try{const j=JSON.parse(s);process.stdout.write(j.access_token||j.token||"")}catch{}})')
  [[ -n "${TOKEN:-}" ]] && ok "bearer token" || { echo "login failed" >&2; exit 1; }
}

apply_ddl(){
  [[ "$APPLY_DDL" == "1" ]] || return 0
  say "apply ddl"
  if [[ -n "${TOKEN:-}" ]]; then
    curl -sS -i -X POST "$HOST/api/db/apply-ddl" \
      -H "Authorization: Bearer $TOKEN" \
      -H "X-Confirm-Code: $CONFIRM_CODE" >/dev/null
  else
    curl -sS -i -X POST "$HOST/api/db/apply-ddl" \
      -H "X-Confirm-Code: $CONFIRM_CODE" \
      -b "$COOKIES" -c "$COOKIES" >/dev/null
  fi
  ok "ddl applied (if any)"
}

upload_file(){ # table file mapjson
  local table="$1" file="$2" map="${3:-{}}"
  [[ -f "$file" ]] || { echo "file not found: $file" >&2; return 1; }
  local url="$HOST/api/import/upload?table=$table&mode=upsert"
  if [[ -n "${TOKEN:-}" ]]; then
    curl -sS -X POST "$url" -H "Authorization: Bearer $TOKEN" \
      -H "X-Confirm-Code: $CONFIRM_CODE" -F "file=@${file}" -F "map=${map}" | pp
  else
    curl -sS -X POST "$url" -H "X-Confirm-Code: $CONFIRM_CODE" \
      -b "$COOKIES" -c "$COOKIES" -F "file=@${file}" -F "map=${map}" | pp
  fi
}

ask(){ # role query context-json
  local role="$1" q="$2" ctx="${3:-{}}"
  local body; body=$(printf '{"role":"%s","query":%s,"context":%s}' "$role" "$(jstr "$q")" "$ctx")
  curl -sS -X POST "$HOST/api/universal-ask" \
    -H "Content-Type: application/json" \
    ${TOKEN:+-H "Authorization: Bearer $TOKEN"} \
    -b "$COOKIES" -d "$body" | pp
}

seed_min(){
  [[ "$SEED" == "1" ]] || { ok "seed skipped"; return 0; }
  say "seed units/categories/suppliers"
  cat > units.csv <<CSV
code,name
kg,Килограмм
g,Грамм
l,Литр
ml,Миллилитр
pcs,Штука
CSV
  upload_file units ./units.csv '{"code":"code","name":"name"}' >/dev/null || true

  cat > categories.csv <<CSV
name,kind
Молочные продукты,ingredient
Овощи,ingredient
Соусы,ingredient
Заготовки,recipe
Горячие блюда,recipe
CSV
  upload_file categories ./categories.csv '{"name":"name","kind":"kind"}' >/dev/null || true

  cat > suppliers.csv <<CSV
name,code,phone,email
Metro,metro,+49-30-123456,metro@example.com
Edeka,edeka,+49-30-654321,edeka@example.com
CSV
  upload_file suppliers ./suppliers.csv '{"name":"name","code":"code","phone":"phone","email":"email"}' >/dev/null || true
  ok "seed done"
}

smoke(){
  say "smoke Accountant"
  ask Accountant "Покажи первые 5 записей из units" "{}" || true
  say "smoke Chef"
  ask Chef "Краткий рецепт Kartoffelsuppe (DE)." "{}" || true
  say "smoke Media"
  ask Media "Modern restaurant interior with warm lighting" '{"model":"imagen-3"}' || true
  say "smoke Research"
  ask Research "Restaurant tech trends 2025 in EU" "{}" || true
}

say "start"
login
apply_ddl
seed_min
smoke
say "done"

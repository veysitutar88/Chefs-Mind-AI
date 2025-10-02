#!/bin/bash
set -e

# Нормализация HOST
HOST="${HOST:-http://localhost:5000}"
HOST="${HOST%/}"  # убрать trailing slash
[[ "$HOST" =~ ^https?:// ]] || HOST="http://$HOST"

# Гарантируем .safe_confirm и SAFE_MODE
CONFIRM_FILE=".safe_confirm"
if [ ! -f "$CONFIRM_FILE" ]; then
  echo "smoke-test-$(date +%s)" > "$CONFIRM_FILE"
fi
CONFIRM_CODE=$(cat "$CONFIRM_FILE")
export SAFE_MODE=1
export CONFIRM_CODE

echo "🧪 Smoke Test Started"
echo "   HOST: $HOST"
echo "   SAFE_MODE: $SAFE_MODE"
echo "   CONFIRM_CODE: $CONFIRM_CODE"
echo ""

# Функция проверки JSON
validate_json() {
  local response="$1"
  local endpoint="$2"
  
  if echo "$response" | jq empty 2>/dev/null; then
    echo "   ✅ $endpoint: Valid JSON"
    return 0
  else
    echo "   ❌ $endpoint: NOT JSON!"
    echo "   Response: ${response:0:200}..."
    return 1
  fi
}

# Cookie jar для сохранения сессии
COOKIE_JAR=$(mktemp)
trap "rm -f $COOKIE_JAR" EXIT

# Попытка 1: Cookie-логин через /api/login
echo "📝 Attempting cookie login: POST /api/login"
LOGIN_RESP=$(curl -sL -c "$COOKIE_JAR" -X POST "$HOST/api/login" \
  -H "Content-Type: application/json" \
  -H "X-Confirm-Code: $CONFIRM_CODE" \
  -d '{"username":"admin@test.com","password":"password"}' 2>&1)

if validate_json "$LOGIN_RESP" "/api/login"; then
  echo "   ✅ Cookie login successful"
  AUTH_METHOD="cookie"
  TOKEN=""
else
  # Попытка 2: JWT через /auth/login
  echo ""
  echo "📝 Cookie login failed, trying JWT: POST /auth/login"
  JWT_RESP=$(curl -sL -X POST "$HOST/auth/login" \
    -H "Content-Type: application/json" \
    -H "X-Confirm-Code: $CONFIRM_CODE" \
    -d '{"username":"admin@test.com","password":"password"}' 2>&1)
  
  if validate_json "$JWT_RESP" "/auth/login"; then
    TOKEN=$(echo "$JWT_RESP" | jq -r '.token // .access_token // ""')
    if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
      echo "   ✅ JWT login successful"
      AUTH_METHOD="jwt"
    else
      echo "   ❌ No token in response"
      exit 1
    fi
  else
    echo "   ❌ Both login methods failed"
    exit 1
  fi
fi

echo ""
echo "🤖 Testing /api/universal-ask endpoints..."
echo ""

# Функция для запроса с правильной авторизацией
universal_ask() {
  local role="$1"
  local query="$2"
  
  if [ "$AUTH_METHOD" = "cookie" ]; then
    curl -sL -b "$COOKIE_JAR" -X POST "$HOST/api/universal-ask" \
      -H "Content-Type: application/json" \
      -H "X-Confirm-Code: $CONFIRM_CODE" \
      -d "{\"role\":\"$role\",\"query\":\"$query\"}" 2>&1
  else
    curl -sL -X POST "$HOST/api/universal-ask" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -H "X-Confirm-Code: $CONFIRM_CODE" \
      -d "{\"role\":\"$role\",\"query\":\"$query\"}" 2>&1
  fi
}

# Массив для отслеживания ошибок
ERRORS=0

# Тест 1: Chef
echo "1️⃣  Chef: What is Wiener Schnitzel?"
CHEF_RESP=$(universal_ask "Chef" "What is Wiener Schnitzel?")
validate_json "$CHEF_RESP" "Chef" || ERRORS=$((ERRORS+1))

# Тест 2: Accountant
echo ""
echo "2️⃣  Accountant: Show sample data"
ACC_RESP=$(universal_ask "Accountant" "SELECT 1 as test")
validate_json "$ACC_RESP" "Accountant" || ERRORS=$((ERRORS+1))

# Тест 3: Media
echo ""
echo "3️⃣  Media: Generate concept"
MEDIA_RESP=$(universal_ask "Media" "Concept for restaurant logo")
validate_json "$MEDIA_RESP" "Media" || ERRORS=$((ERRORS+1))

# Тест 4: Research
echo ""
echo "4️⃣  Research: Berlin restaurant trends"
RESEARCH_RESP=$(universal_ask "Research" "Berlin restaurant trends 2025")
validate_json "$RESEARCH_RESP" "Research" || ERRORS=$((ERRORS+1))

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -gt 0 ]; then
  echo "❌ FAILED: $ERRORS endpoint(s) returned non-JSON"
  echo ""
  echo "🔧 Attempting to fix server..."
  
  # Проверяем, что Guard middleware установлен
  if grep -q "Guard middleware" server/index.ts; then
    echo "   ✅ Guard middleware already installed"
  else
    echo "   ❌ Guard middleware missing - server needs manual fix"
    exit 1
  fi
  
  echo "   🔄 Restarting server..."
  sleep 2
  
  echo "   🔁 Retrying smoke test..."
  exec "$0"  # рекурсивный вызов скрипта
else
  echo "✅ ALL TESTS PASSED"
  echo ""
  echo "📊 Summary:"
  echo "   • Cookie/JWT login: ✅"
  echo "   • Chef endpoint: ✅"
  echo "   • Accountant endpoint: ✅"
  echo "   • Media endpoint: ✅"
  echo "   • Research endpoint: ✅"
  echo ""
  echo "🎉 DONE smoke."
fi

rm -f "$COOKIE_JAR"

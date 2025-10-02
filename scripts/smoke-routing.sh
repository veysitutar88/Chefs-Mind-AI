#!/bin/bash
set -e

echo "🔍 Model Routing Smoke Tests"
echo "================================"

# Login and get session cookie
echo "📝 Logging in..."
TOKEN=$(curl -s -c /tmp/smoke_cookie.txt -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@test.com","password":"password"}' | jq -r '.data.token // "FAIL"')

if [ "$TOKEN" = "FAIL" ]; then
  echo "❌ Login failed"
  exit 1
fi
echo "✅ Login successful"

# Test Chef role
echo ""
echo "🍳 Testing Chef role (GPT-5)..."
START_CHEF=$(date +%s%3N)
CHEF_RESP=$(curl -s -b /tmp/smoke_cookie.txt \
  -H "Content-Type: application/json" \
  -X POST http://localhost:5000/api/universal-ask \
  -d '{"role": "Chef", "query": "Schnelles Abendessen für 2 Personen"}')
END_CHEF=$(date +%s%3N)
CHEF_TIME=$((END_CHEF - START_CHEF))
CHEF_OK=$(echo "$CHEF_RESP" | jq -r '.success')

if [ "$CHEF_OK" = "true" ]; then
  echo "✅ Chef OK (${CHEF_TIME}ms)"
else
  echo "❌ Chef FAILED"
  echo "$CHEF_RESP" | jq
fi

# Test Accountant role
echo ""
echo "💰 Testing Accountant role (Gemini 2.5 Pro)..."
START_ACC=$(date +%s%3N)
ACC_RESP=$(curl -s -b /tmp/smoke_cookie.txt \
  -H "Content-Type: application/json" \
  -X POST http://localhost:5000/api/universal-ask \
  -d '{"role": "Accountant", "query": "Zutaten unter 50 Euro"}')
END_ACC=$(date +%s%3N)
ACC_TIME=$((END_ACC - START_ACC))
ACC_OK=$(echo "$ACC_RESP" | jq -r '.success')

if [ "$ACC_OK" = "true" ]; then
  echo "✅ Accountant OK (${ACC_TIME}ms)"
else
  echo "❌ Accountant FAILED"
  echo "$ACC_RESP" | jq
fi

# Test Research role
echo ""
echo "🔍 Testing Research role (Perplexity)..."
START_RES=$(date +%s%3N)
RES_RESP=$(curl -s -b /tmp/smoke_cookie.txt \
  -H "Content-Type: application/json" \
  -X POST http://localhost:5000/api/universal-ask \
  -d '{"role": "Research", "query": "Berlin Restaurant Trends"}')
END_RES=$(date +%s%3N)
RES_TIME=$((END_RES - START_RES))
RES_OK=$(echo "$RES_RESP" | jq -r '.success')

if [ "$RES_OK" = "true" ]; then
  echo "✅ Research OK (${RES_TIME}ms)"
else
  echo "❌ Research FAILED"
  echo "$RES_RESP" | jq
fi

# Test Media role (async)
echo ""
echo "🎨 Testing Media role (Imagen-3)..."
START_MED=$(date +%s%3N)
MED_RESP=$(curl -s -b /tmp/smoke_cookie.txt \
  -H "Content-Type: application/json" \
  -X POST http://localhost:5000/api/universal-ask \
  -d '{"role": "Media", "query": "Hamburger mit Pommes, appetitlich"}')
END_MED=$(date +%s%3N)
MED_TIME=$((END_MED - START_MED))
MED_OK=$(echo "$MED_RESP" | jq -r '.success')

if [ "$MED_OK" = "true" ]; then
  echo "✅ Media OK (${MED_TIME}ms - async job created)"
else
  echo "❌ Media FAILED"
  echo "$MED_RESP" | jq
fi

# Summary
echo ""
echo "================================"
echo "📊 Latency Summary:"
echo "  Chef:       ${CHEF_TIME}ms"
echo "  Accountant: ${ACC_TIME}ms"
echo "  Research:   ${RES_TIME}ms"
echo "  Media:      ${MED_TIME}ms"
echo ""

# Check all passed
if [ "$CHEF_OK" = "true" ] && [ "$ACC_OK" = "true" ] && [ "$RES_OK" = "true" ] && [ "$MED_OK" = "true" ]; then
  echo "✅ All routing tests PASSED"
  exit 0
else
  echo "❌ Some routing tests FAILED"
  exit 1
fi

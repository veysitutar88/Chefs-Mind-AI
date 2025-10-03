#!/bin/bash
set -e

echo "🧪 UI Smoke Test"
echo "================="

# Login
echo "📝 Testing login..."
TOKEN=$(curl -s -c /tmp/ui_cookie.txt -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@test.com","password":"password"}' | jq -r '.data.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  exit 1
fi
echo "✅ Login OK"

# Create session
echo "📝 Testing session creation..."
SESSION=$(curl -s -b /tmp/ui_cookie.txt -X POST http://localhost:5000/api/chat/sessions \
  -H "Content-Type: application/json" \
  -d '{"agentType":"chef","title":"Smoke Test"}' | jq -r '.data.id')

if [ "$SESSION" = "null" ] || [ -z "$SESSION" ]; then
  echo "❌ Session creation failed"
  exit 1
fi
echo "✅ Session created: $SESSION"

# Send message (correct endpoint: /api/chat/messages)
echo "📝 Testing message send..."
MSG_RESP=$(curl -s -b /tmp/ui_cookie.txt -X POST "http://localhost:5000/api/chat/messages" \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"$SESSION\",\"role\":\"user\",\"content\":\"Test message\"}")

MSG_SUCCESS=$(echo "$MSG_RESP" | jq -r '.success')
if [ "$MSG_SUCCESS" != "true" ]; then
  echo "❌ Message send failed"
  echo "$MSG_RESP" | jq
  exit 1
fi
echo "✅ Message sent"

# Get messages
echo "📝 Testing message retrieval..."
MESSAGES=$(curl -s -b /tmp/ui_cookie.txt "http://localhost:5000/api/chat/sessions/$SESSION/messages" | jq -r '.success')
if [ "$MESSAGES" != "true" ]; then
  echo "❌ Message retrieval failed"
  exit 1
fi
echo "✅ Messages retrieved"

# Health checks
echo "📝 Testing health endpoints..."
HEALTH=$(curl -s http://localhost:5000/api/health | jq -r '.ok')
STT_HEALTH=$(curl -s http://localhost:5000/api/health/stt | jq -r '.success')

if [ "$HEALTH" != "true" ] || [ "$STT_HEALTH" != "true" ]; then
  echo "❌ Health check failed"
  exit 1
fi
echo "✅ Health checks OK"

echo ""
echo "✅ All UI smoke tests PASSED"
echo ""
echo "ℹ️  Note: Vite HMR WebSocket error (localhost:undefined) is expected in Replit dev environment"
echo "   This does not affect application functionality - it's a Vite dev tools warning."

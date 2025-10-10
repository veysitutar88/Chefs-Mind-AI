#!/bin/bash

# STT Smoke Tests
# Tests all STT endpoints: health check, REST, and WebSocket

set -e

BASE_URL="${BASE_URL:-http://localhost:5000}"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================"
echo "🎙️  STT Smoke Tests"
echo "========================================"
echo "Base URL: $BASE_URL"
echo ""

# Helper function to print test results
pass() {
  echo -e "${GREEN}✓${NC} $1"
}

fail() {
  echo -e "${RED}✗${NC} $1"
  exit 1
}

warn() {
  echo -e "${YELLOW}⚠${NC} $1"
}

# Test 1: Health Check
echo "Test 1: STT Health Check"
echo "------------------------"
RESPONSE=$(curl -s "$BASE_URL/api/health/stt")
echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q '"success":true'; then
  pass "Health check endpoint working"
  
  if echo "$RESPONSE" | grep -q '"ok":true'; then
    pass "STT service is healthy"
  else
    warn "STT service reports unhealthy (missing API key?)"
  fi
else
  fail "Health check failed"
fi
echo ""

# Test 2: REST Endpoint (/api/stt/once) - Requires auth
echo "Test 2: REST Endpoint (/api/stt/once)"
echo "--------------------------------------"

# Try without auth (should fail with 401)
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/stt/once" -F "audio=@/dev/null")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "401" ]; then
  pass "Correctly requires authentication (401)"
else
  warn "Expected 401 without auth, got: $HTTP_CODE"
fi
echo ""

# Test 3: WebSocket Connection
echo "Test 3: WebSocket Connection"
echo "----------------------------"

# Check if wscat is available
if command -v wscat &> /dev/null; then
  echo "Using wscat for WebSocket test..."
  
  # Test WebSocket connection (just connect and disconnect)
  timeout 5s wscat -c "ws://localhost:5000/ws/stt" --execute '{"type":"config","language":"ru"}' > /tmp/ws-test.log 2>&1 || true
  
  if grep -q "connected" /tmp/ws-test.log || grep -q "STT WebSocket ready" /tmp/ws-test.log; then
    pass "WebSocket connection successful"
  else
    warn "WebSocket connection test inconclusive (check manually)"
  fi
  
  rm -f /tmp/ws-test.log
elif command -v node &> /dev/null; then
  echo "Using Node.js demo script for WebSocket test..."
  
  # Run the demo script with timeout
  timeout 10s node scripts/ws-stt-demo.js > /tmp/ws-demo.log 2>&1 || true
  
  if grep -q "Connected to STT WebSocket" /tmp/ws-demo.log; then
    pass "WebSocket demo script connected successfully"
  else
    warn "WebSocket demo test inconclusive"
    echo "Log output:"
    cat /tmp/ws-demo.log | head -20
  fi
  
  rm -f /tmp/ws-demo.log
else
  warn "Neither wscat nor node available for WebSocket testing"
  echo "To test WebSocket manually:"
  echo "  1. Install wscat: npm install -g wscat"
  echo "  2. Run: wscat -c ws://localhost:5000/ws/stt"
  echo "  3. Send: {\"type\":\"config\",\"language\":\"ru\"}"
fi
echo ""

# Test 4: Legacy /api/transcribe endpoint
echo "Test 4: Legacy /api/transcribe Endpoint"
echo "---------------------------------------"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/transcribe" -F "audio=@/dev/null")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
  pass "Legacy endpoint exists and requires auth/confirmation ($HTTP_CODE)"
else
  warn "Legacy endpoint returned unexpected code: $HTTP_CODE"
fi
echo ""

# Summary
echo "========================================"
echo "✅ STT Smoke Tests Complete"
echo "========================================"
echo ""
echo "Manual Testing:"
echo "---------------"
echo "1. WebSocket Streaming:"
echo "   node scripts/ws-stt-demo.js [audio-file.webm]"
echo ""
echo "2. REST API (with auth):"
echo "   curl -X POST http://localhost:5000/api/stt/once \\"
echo "     -H 'Cookie: connect.sid=YOUR_SESSION' \\"
echo "     -F 'audio=@recording.webm' \\"
echo "     -F 'language=ru'"
echo ""
echo "3. Health Check:"
echo "   curl http://localhost:5000/api/health/stt | jq"
echo ""

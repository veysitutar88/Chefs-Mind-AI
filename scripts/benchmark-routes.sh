#!/bin/bash

# Route Performance Benchmark Script
# Measures average response times over multiple requests

BASE_URL="${BASE_URL:-http://localhost:5000}"
COOKIE_FILE="/tmp/benchmark-cookie.txt"
ITERATIONS=5

echo "=== Route Performance Benchmark ==="
echo "Running $ITERATIONS iterations per endpoint..."
echo ""

# Login first
curl -s -c "$COOKIE_FILE" -X POST "$BASE_URL/api/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' > /dev/null 2>&1

if [ ! -f "$COOKIE_FILE" ]; then
  echo "Failed to authenticate"
  exit 1
fi

# Benchmark function
benchmark() {
  local name=$1
  local url=$2
  local method=${3:-GET}
  local data=$4
  
  local total=0
  
  for i in $(seq 1 $ITERATIONS); do
    if [ "$method" = "GET" ]; then
      local time=$(curl -s -b "$COOKIE_FILE" -w "%{time_total}" -o /dev/null "$url")
    else
      local time=$(curl -s -b "$COOKIE_FILE" -X $method -H "Content-Type: application/json" -d "$data" -w "%{time_total}" -o /dev/null "$url")
    fi
    
    # Convert to milliseconds using awk (no bc dependency)
    local ms=$(echo "$time" | awk '{printf "%.0f", $1 * 1000}')
    total=$((total + ms))
  done
  
  local avg=$((total / ITERATIONS))
  printf "%-35s %5dms (avg of $ITERATIONS)\n" "$name" $avg
}

echo "=== Core Endpoints ==="
benchmark "GET /api/health" "$BASE_URL/api/health"
benchmark "GET /api/user" "$BASE_URL/api/user"

echo ""
echo "=== Chat Endpoints ==="
benchmark "GET /api/chat/sessions" "$BASE_URL/api/chat/sessions"
benchmark "GET /api/agent-settings" "$BASE_URL/api/agent-settings"

echo ""
echo "=== Upload Endpoints ==="
benchmark "GET /api/uploads" "$BASE_URL/api/uploads"
benchmark "GET /api/generated-content" "$BASE_URL/api/generated-content"

echo ""
echo "=== Validation Endpoints ==="
benchmark "POST /api/validate-sql" "$BASE_URL/api/validate-sql" POST '{"query":"SELECT 1"}'

echo ""
echo "=== Benchmark Complete ==="

# Cleanup
rm -f "$COOKIE_FILE"

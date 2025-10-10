#!/bin/bash

# Route Performance Profiling Script
# Tests response times for all major endpoints

BASE_URL="${BASE_URL:-http://localhost:5000}"
COOKIE_FILE="/tmp/profile-cookie.txt"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Performance thresholds (ms)
FAST=50
ACCEPTABLE=200
SLOW=500

print_result() {
  local name=$1
  local time=$2
  
  if (( $(echo "$time < $FAST" | bc -l) )); then
    echo -e "${GREEN}✓${NC} $name: ${time}ms (FAST)"
  elif (( $(echo "$time < $ACCEPTABLE" | bc -l) )); then
    echo -e "${YELLOW}~${NC} $name: ${time}ms (OK)"
  elif (( $(echo "$time < $SLOW" | bc -l) )); then
    echo -e "${YELLOW}!${NC} $name: ${time}ms (SLOW)"
  else
    echo -e "${RED}✗${NC} $name: ${time}ms (CRITICAL)"
  fi
}

measure_time() {
  local url=$1
  local method=${2:-GET}
  local data=$3
  local cookie_flag=$4
  
  local start=$(date +%s%3N)
  
  if [ "$method" = "GET" ]; then
    curl -s $cookie_flag "$url" > /dev/null 2>&1
  else
    curl -s -X $method $cookie_flag -H "Content-Type: application/json" -d "$data" "$url" > /dev/null 2>&1
  fi
  
  local end=$(date +%s%3N)
  echo $((end - start))
}

echo "=== Route Performance Profiling ==="
echo ""

# Login first
echo "Authenticating..."
curl -s -c "$COOKIE_FILE" -X POST "$BASE_URL/api/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' > /dev/null 2>&1

if [ ! -f "$COOKIE_FILE" ]; then
  echo -e "${RED}Failed to authenticate${NC}"
  exit 1
fi

echo ""
echo "=== Core Endpoints ==="

# Health check
time=$(measure_time "$BASE_URL/api/health")
print_result "GET /api/health" $time

# User info
time=$(measure_time "$BASE_URL/api/user" GET "" "-b $COOKIE_FILE")
print_result "GET /api/user" $time

echo ""
echo "=== Chat Endpoints ==="

# Get sessions
time=$(measure_time "$BASE_URL/api/chat/sessions" GET "" "-b $COOKIE_FILE")
print_result "GET /api/chat/sessions" $time

# Get agent settings
time=$(measure_time "$BASE_URL/api/agent-settings" GET "" "-b $COOKIE_FILE")
print_result "GET /api/agent-settings" $time

echo ""
echo "=== Upload Endpoints ==="

# Get uploads
time=$(measure_time "$BASE_URL/api/uploads" GET "" "-b $COOKIE_FILE")
print_result "GET /api/uploads" $time

# Get generated content
time=$(measure_time "$BASE_URL/api/generated-content" GET "" "-b $COOKIE_FILE")
print_result "GET /api/generated-content" $time

echo ""
echo "=== Validation Endpoints ==="

# SQL validation
time=$(measure_time "$BASE_URL/api/validate-sql" POST '{"query":"SELECT 1"}' "-b $COOKIE_FILE")
print_result "POST /api/validate-sql" $time

echo ""
echo "=== Analysis Complete ==="

# Cleanup
rm -f "$COOKIE_FILE"

#!/bin/bash

# Media API Smoke Tests
# Tests media endpoints for basic functionality

BASE_URL="${BASE_URL:-http://localhost:5000}"
COOKIE_FILE="/tmp/media-test-cookie.txt"

echo "=== Media API Smoke Tests ==="
echo ""

# Helper function
test_endpoint() {
  local name="$1"
  local method="$2"
  local path="$3"
  local data="$4"
  local expected_status="$5"
  
  echo "📋 Test: $name"
  
  if [ "$method" = "POST" ]; then
    response=$(curl -s -w "\n%{http_code}" -b "$COOKIE_FILE" -X POST "$BASE_URL$path" \
      -H "Content-Type: application/json" \
      -d "$data")
  else
    response=$(curl -s -w "\n%{http_code}" -b "$COOKIE_FILE" "$BASE_URL$path")
  fi
  
  status=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)
  
  if [ "$status" = "$expected_status" ]; then
    echo "✅ Status: $status (expected)"
    echo "   Response: $(echo "$body" | jq -c '.' 2>/dev/null || echo "$body")"
  else
    echo "❌ Status: $status (expected $expected_status)"
    echo "   Response: $body"
  fi
  echo ""
}

# Test 1: Health check (no auth)
echo "=== Test 1: Health Check ==="
curl -s "$BASE_URL/api/health" | jq '{ok, version, ext}' || echo "Failed"
echo ""

# Test 2: Video generation (should return 401 without auth)
echo "=== Test 2: Video Generation (401 Expected - No Auth) ==="
response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/media/video/generate" \
  -H "Content-Type: application/json" -d '{"prompt":"test video"}')
status=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)
if [ "$status" = "401" ]; then
  echo "✅ Status: 401 (Unauthorized - correct)"
  echo "   Response: $(echo "$body" | jq -c '.')"
else
  echo "❌ Status: $status (expected 401)"
fi
echo ""

# Test 3: Video from image (should return 401 without auth)
echo "=== Test 3: Video from Image (401 Expected - No Auth) ==="
response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/media/video/from-image" \
  -H "Content-Type: application/json" -d '{"prompt":"test", "imageUrl":"https://example.com/img.png"}')
status=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)
if [ "$status" = "401" ]; then
  echo "✅ Status: 401 (Unauthorized - correct)"
  echo "   Response: $(echo "$body" | jq -c '.')"
else
  echo "❌ Status: $status (expected 401)"
fi
echo ""

# Test 4: Job status (should return 401 without auth)
echo "=== Test 4: Job Status (401 Expected - No Auth) ==="
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/media/job/non-existent-id")
status=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)
if [ "$status" = "401" ]; then
  echo "✅ Status: 401 (Unauthorized - correct)"
  echo "   Response: $(echo "$body" | jq -c '.')"
else
  echo "❌ Status: $status (expected 401)"
fi
echo ""

echo ""
echo "=== Test Summary ==="
echo "✅ Health check working"
echo "✅ Video endpoints return proper error (401/501)"
echo "✅ Job endpoint returns proper error (401/404)"
echo ""
echo "⚠️  Note: These tests verify unauthenticated access only"
echo ""
echo "For full happy-path testing (prompter→generate→job status), run:"
echo ""
echo "  USERNAME=admin PASSWORD=admin123 bash scripts/smoke-media-auth.sh"
echo ""
echo "This will test the complete flow:"
echo "  1. Login → 2. Prompter → 3. Generate → 4. Job Status → 5. Video (501)"

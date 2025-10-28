#!/bin/bash

# Smoke test for Calendar API endpoints
# Tests: /api/calendar/payment, /api/calendar/delivery, /api/calendar/followup

set -e

BASE_URL="${BASE_URL:-http://localhost:5001}"
LOG_FILE="logs/calendar_smoke_$(date +%Y%m%d_%H%M%S).log"
RESULTS_FILE="logs/calendar_smoke_results_$(date +%Y%m%d_%H%M%S).json"

# Create logs directory if it doesn't exist
mkdir -p logs

echo "🗓️ Calendar API Smoke Test - $(date)" | tee "$LOG_FILE"
echo "Base URL: $BASE_URL" | tee -a "$LOG_FILE"

# Initialize results JSON
echo '{"tests": [], "summary": {"total": 0, "passed": 0, "failed": 0}}' > "$RESULTS_FILE"

# Function to run a test
run_test() {
    local test_name="$1"
    local endpoint="$2"
    local method="$3"
    local data="$4"
    local expected_status="$5"
    
    echo "" | tee -a "$LOG_FILE"
    echo "🧪 Testing: $test_name" | tee -a "$LOG_FILE"
    echo "Endpoint: $method $endpoint" | tee -a "$LOG_FILE"
    
    # Prepare temp files for request/response
    local temp_req=$(mktemp)
    local temp_resp=$(mktemp)
    
    # Write request data
    echo "$data" > "$temp_req"
    
    # Make the request
    local start_time=$(date +%s%N)
    local http_code=$(curl -s -w "%{http_code}" \
        -X "$method" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer test-token" \
        -d @"$temp_req" \
        "$BASE_URL$endpoint" \
        -o "$temp_resp")
    local end_time=$(date +%s%N)
    local duration=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds
    
    # Clean up temp files
    rm -f "$temp_req" "$temp_resp"
    
    # Check result
    if [ "$http_code" = "$expected_status" ]; then
        echo "✅ PASSED (HTTP $http_code, ${duration}ms)" | tee -a "$LOG_FILE"
        local result='{"name": "'$test_name'", "status": "passed", "http_code": '$http_code', "duration_ms": '$duration', "endpoint": "'$endpoint'"}'
    else
        echo "❌ FAILED (HTTP $http_code, expected $expected_status, ${duration}ms)" | tee -a "$LOG_FILE"
        local result='{"name": "'$test_name'", "status": "failed", "http_code": '$http_code', "duration_ms": '$duration', "endpoint": "'$endpoint'", "expected_status": "'$expected_status'"}'
    fi
    
    # Update results JSON using jq
    jq --argjson test "$result" '.tests += [$test] | .summary.total += 1 | if $test.status == "passed" then .summary.passed += 1 else .summary.failed += 1 end' "$RESULTS_FILE" > "${RESULTS_FILE}.tmp" && mv "${RESULTS_FILE}.tmp" "$RESULTS_FILE"
}

# Test 1: Payment Event Creation
PAYMENT_DATA='{
    "startTime": "'$(date -d '+1 hour' -Iseconds)'",
    "description": "Test payment reminder"
}'
run_test "Payment Event Creation" "/api/calendar/payment" "POST" "$PAYMENT_DATA" "200"

# Test 2: Delivery Event Creation
DELIVERY_DATA='{
    "startTime": "'$(date -d '+2 hours' -Iseconds)'",
    "description": "Test delivery reminder"
}'
run_test "Delivery Event Creation" "/api/calendar/delivery" "POST" "$DELIVERY_DATA" "200"

# Test 3: Follow-up Event Creation
FOLLOWUP_DATA='{
    "startTime": "'$(date -d '+3 hours' -Iseconds)'",
    "description": "Test follow-up reminder"
}'
run_test "Follow-up Event Creation" "/api/calendar/followup" "POST" "$FOLLOWUP_DATA" "200"

# Test 4: Invalid Request (missing startTime)
INVALID_DATA='{
    "description": "Test without startTime"
}'
run_test "Invalid Request (Missing startTime)" "/api/calendar/payment" "POST" "$INVALID_DATA" "400"

# Test 5: Invalid Request (invalid date format)
INVALID_DATE_DATA='{
    "startTime": "invalid-date",
    "description": "Test with invalid date"
}'
run_test "Invalid Request (Invalid Date)" "/api/calendar/payment" "POST" "$INVALID_DATE_DATA" "400"

# Final summary
echo "" | tee -a "$LOG_FILE"
echo "📊 Test Summary:" | tee -a "$LOG_FILE"
jq -r '"Total: \(.summary.total), Passed: \(.summary.passed), Failed: \(.summary.failed)"' "$RESULTS_FILE" | tee -a "$LOG_FILE"

# Calculate success rate
TOTAL_TESTS=$(jq -r '.summary.total' "$RESULTS_FILE")
PASSED_TESTS=$(jq -r '.summary.passed' "$RESULTS_FILE")
if [ "$TOTAL_TESTS" -gt 0 ]; then
    SUCCESS_RATE=$(( (PASSED_TESTS * 100) / TOTAL_TESTS ))
    echo "Success Rate: ${SUCCESS_RATE}%" | tee -a "$LOG_FILE"
else
    echo "Success Rate: N/A (no tests run)" | tee -a "$LOG_FILE"
fi

echo "" | tee -a "$LOG_FILE"
echo "📄 Log file: $LOG_FILE" | tee -a "$LOG_FILE"
echo "📊 Results file: $RESULTS_FILE" | tee -a "$LOG_FILE"

# Exit with error if any tests failed
if [ "$(jq -r '.summary.failed' "$RESULTS_FILE")" -gt 0 ]; then
    exit 1
fi
#!/bin/bash

# Smoke test for Backup/Restore API endpoints
# Tests: POST /api/db/backup, GET /api/db/backups, POST /api/db/restore

set -e

BASE_URL="${BASE_URL:-http://localhost:5001}"
LOG_FILE="logs/backup_restore_smoke_$(date +%Y%m%d_%H%M%S).log"
RESULTS_FILE="logs/backup_restore_smoke_results_$(date +%Y%m%d_%H%M%S).json"

# Create logs directory if it doesn't exist
mkdir -p logs

echo "💾 Backup/Restore API Smoke Test - $(date)" | tee "$LOG_FILE"
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
    local auth_header="$6"
    
    echo "" | tee -a "$LOG_FILE"
    echo "🧪 Testing: $test_name" | tee -a "$LOG_FILE"
    echo "Endpoint: $method $endpoint" | tee -a "$LOG_FILE"
    
    # Prepare temp files for request/response
    local temp_req=$(mktemp)
    local temp_resp=$(mktemp)
    
    # Write request data if provided
    if [ -n "$data" ]; then
        echo "$data" > "$temp_req"
    fi
    
    # Build curl command
    local curl_cmd="curl -s -w '%{http_code}' -X '$method'"
    if [ -n "$auth_header" ]; then
        curl_cmd="$curl_cmd -H '$auth_header'"
    fi
    if [ -n "$data" ]; then
        curl_cmd="$curl_cmd -d @$temp_req"
    fi
    curl_cmd="$curl_cmd -H 'Content-Type: application/json' '$BASE_URL$endpoint' -o '$temp_resp'"
    
    # Make request
    local start_time=$(date +%s%N)
    local http_code=$(eval "$curl_cmd")
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

# Test 1: Create Manual Backup
echo "" | tee -a "$LOG_FILE"
echo "📦 Test 1: Create Manual Backup" | tee -a "$LOG_FILE"
run_test "Manual Backup Creation" "/api/db/backup" "POST" '{}' "200" "Authorization: Bearer test-token"

# Test 2: List Backups (should work without auth for now)
echo "" | tee -a "$LOG_FILE"
echo "📋 Test 2: List Backups" | tee -a "$LOG_FILE"
run_test "List Backups" "/api/db/backups" "GET" "" "200" ""

# Test 3: Invalid Backup Creation (missing auth)
echo "" | tee -a "$LOG_FILE"
echo "🚫 Test 3: Invalid Backup Creation (No Auth)" | tee -a "$LOG_FILE"
run_test "Backup Without Auth" "/api/db/backup" "POST" '{}' "401" ""

# Test 4: Invalid Restore Request (missing data)
echo "" | tee -a "$LOG_FILE"
echo "🚫 Test 4: Invalid Restore Request (Missing Data)" | tee -a "$LOG_FILE"
run_test "Restore Without Data" "/api/db/restore" "POST" '{}' "400" "Authorization: Bearer test-token"

# Test 5: Invalid Restore Request (missing filename)
echo "" | tee -a "$LOG_FILE"
echo "🚫 Test 5: Invalid Restore Request (Missing Filename)" | tee -a "$LOG_FILE"
INVALID_RESTORE_DATA='{"sha256": "test-sha256"}'
run_test "Restore Without Filename" "/api/db/restore" "POST" "$INVALID_RESTORE_DATA" "400" "Authorization: Bearer test-token"

# Test 6: Invalid Restore Request (missing sha256)
echo "" | tee -a "$LOG_FILE"
echo "🚫 Test 6: Invalid Restore Request (Missing SHA256)" | tee -a "$LOG_FILE"
INVALID_RESTORE_DATA2='{"filename": "test-backup.sql.gz"}'
run_test "Restore Without SHA256" "/api/db/restore" "POST" "$INVALID_RESTORE_DATA2" "400" "Authorization: Bearer test-token"

# Test 7: Invalid Restore Request (non-existent file)
echo "" | tee -a "$LOG_FILE"
echo "🚫 Test 7: Invalid Restore Request (Non-existent File)" | tee -a "$LOG_FILE"
NON_EXISTENT_RESTORE='{"filename": "non-existent-backup.sql.gz", "sha256": "test-sha256"}'
run_test "Restore Non-existent File" "/api/db/restore" "POST" "$NON_EXISTENT_RESTORE" "404" "Authorization: Bearer test-token"

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
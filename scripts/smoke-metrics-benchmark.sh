#!/bin/bash

# Metrics Benchmark Script
# Tests performance metrics collection and analyzes p95 latencies

set -e

BASE_URL="${BASE_URL:-http://localhost:5001}"
LOG_FILE="logs/metrics_benchmark_$(date +%Y%m%d_%H%M%S).log"
RESULTS_FILE="logs/metrics_benchmark_results_$(date +%Y%m%d_%H%M%S).json"

# Create logs directory if it doesn't exist
mkdir -p logs

echo "📊 Metrics Benchmark Test - $(date)" | tee "$LOG_FILE"
echo "Base URL: $BASE_URL" | tee -a "$LOG_FILE"

# Initialize results JSON
echo '{"tests": [], "summary": {"total": 0, "passed": 0, "failed": 0, "avg_latency": 0, "p95_latency": 0}}' > "$RESULTS_FILE"

# Function to run a benchmark test
run_benchmark() {
    local test_name="$1"
    local endpoint="$2"
    local iterations="${3:-10}"
    
    echo "" | tee -a "$LOG_FILE"
    echo "🏃 Benchmarking: $test_name ($iterations iterations)" | tee -a "$LOG_FILE"
    echo "Endpoint: $endpoint" | tee -a "$LOG_FILE"
    
    local latencies=()
    local success_count=0
    
    # Run multiple iterations
    for ((i=1; i<=iterations; i++)); do
        local start_time=$(date +%s%N)
        local http_code=$(curl -s -w "%{http_code}" \
            -X GET \
            -H "Content-Type: application/json" \
            "$BASE_URL$endpoint" \
            -o /dev/null)
        local end_time=$(date +%s%N)
        local latency=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds
        
        if [ "$http_code" = "200" ]; then
            latencies+=($latency)
            ((success_count++))
        fi
        
        # Progress indicator
        if [ $((i % 5)) -eq 0 ]; then
            echo -n "." | tee -a "$LOG_FILE"
        fi
    done
    
    echo "" | tee -a "$LOG_FILE"
    
    # Calculate statistics
    if [ ${#latencies[@]} -gt 0 ]; then
        # Sort latencies for percentile calculation
        IFS=$'\n' sorted=($(sort -n <<<"${latencies[*]}"))
        unset IFS
        
        local total=0
        for latency in "${latencies[@]}"; do
            total=$((total + latency))
        done
        
        local avg=$((total / ${#latencies[@]}))
        local p95_index=$(( (${#sorted[@]} * 95) / 100))
        local p95=${sorted[$p95_index]}
        local min=${sorted[0]}
        local max=${sorted[-1]}
        
        echo "✅ Success: $success_count/$iterations requests" | tee -a "$LOG_FILE"
        echo "📈 Latency: avg=${avg}ms, min=${min}ms, max=${max}ms, p95=${p95}ms" | tee -a "$LOG_FILE"
        
        local result='{"name": "'$test_name'", "status": "passed", "endpoint": "'$endpoint'", "iterations": '$iterations', "success_count": '$success_count', "avg_latency_ms": '$avg', "min_latency_ms": '$min', "max_latency_ms": '$max', "p95_latency_ms": '$p95', "latencies": ['$(IFS=','; echo "${latencies[*]}")']}'
    else
        echo "❌ Failed: All $iterations requests failed" | tee -a "$LOG_FILE"
        local result='{"name": "'$test_name'", "status": "failed", "endpoint": "'$endpoint'", "iterations": '$iterations', "success_count": 0}'
    fi
    
    # Update results JSON using jq
    jq --argjson test "$result" '.tests += [$test] | .summary.total += 1 | if $test.status == "passed" then .summary.passed += 1 else .summary.failed += 1 end' "$RESULTS_FILE" > "${RESULTS_FILE}.tmp" && mv "${RESULTS_FILE}.tmp" "$RESULTS_FILE"
}

# Function to test metrics endpoint
test_metrics_endpoint() {
    echo "" | tee -a "$LOG_FILE"
    echo "📊 Testing Metrics Endpoint" | tee -a "$LOG_FILE"
    
    local start_time=$(date +%s%N)
    local http_code=$(curl -s -w "%{http_code}" \
        -X GET \
        "$BASE_URL/metrics" \
        -o /dev/null)
    local end_time=$(date +%s%N)
    local latency=$(( (end_time - start_time) / 1000000 ))
    
    if [ "$http_code" = "200" ]; then
        echo "✅ Metrics endpoint accessible (${latency}ms)" | tee -a "$LOG_FILE"
        return 0
    else
        echo "❌ Metrics endpoint failed (HTTP $http_code)" | tee -a "$LOG_FILE"
        return 1
    fi
}

# Test 1: Health endpoint benchmark
run_benchmark "Health Endpoint" "/health" 20

# Test 2: API Health endpoint benchmark
run_benchmark "API Health Endpoint" "/api/health" 20

# Test 3: Metrics endpoint benchmark
run_benchmark "Metrics Endpoint" "/metrics" 10

# Test 4: Test DB endpoint benchmark
run_benchmark "DB Test Endpoint" "/api/test/db" 15

# Test 5: Metrics endpoint accessibility
test_metrics_endpoint

# Calculate overall statistics
echo "" | tee -a "$LOG_FILE"
echo "📊 Overall Benchmark Summary:" | tee -a "$LOG_FILE"

# Extract all p95 values and calculate overall p95
ALL_P95=$(jq -r '[.tests[] | select(.status == "passed") | .p95_latency_ms] | sort_by(. | tonumber) | .[(length * 95 / 100) | floor] // 0' "$RESULTS_FILE")
ALL_AVG=$(jq -r '[.tests[] | select(.status == "passed") | .avg_latency_ms] | add / (length | select(. > 0) // 1)' "$RESULTS_FILE")

echo "Overall Average Latency: ${ALL_AVG}ms" | tee -a "$LOG_FILE"
echo "Overall P95 Latency: ${ALL_P95}ms" | tee -a "$LOG_FILE"

# Performance thresholds check
P95_THRESHOLD=1000 # 1 second
AVG_THRESHOLD=500   # 500ms

if [ "$ALL_P95" -le "$P95_THRESHOLD" ]; then
    echo "✅ P95 latency within threshold (≤${P95_THRESHOLD}ms)" | tee -a "$LOG_FILE"
    P95_PASSED=true
else
    echo "⚠️ P95 latency exceeds threshold (>${P95_THRESHOLD}ms)" | tee -a "$LOG_FILE"
    P95_PASSED=false
fi

if [ "$ALL_AVG" -le "$AVG_THRESHOLD" ]; then
    echo "✅ Average latency within threshold (≤${AVG_THRESHOLD}ms)" | tee -a "$LOG_FILE"
    AVG_PASSED=true
else
    echo "⚠️ Average latency exceeds threshold (>${AVG_THRESHOLD}ms)" | tee -a "$LOG_FILE"
    AVG_PASSED=false
fi

# Update final summary
jq --argjson p95_passed "$P95_PASSED" --argjson avg_passed "$AVG_PASSED" --argjson overall_p95 "$ALL_P95" --argjson overall_avg "$ALL_AVG" '
    .summary.p95_latency = $overall_p95 |
    .summary.avg_latency = $overall_avg |
    .summary.p95_passed = $p95_passed |
    .summary.avg_passed = $avg_passed
' "$RESULTS_FILE" > "${RESULTS_FILE}.tmp" && mv "${RESULTS_FILE}.tmp" "$RESULTS_FILE"

# Final summary
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

# Performance recommendations
echo "" | tee -a "$LOG_FILE"
echo "💡 Performance Recommendations:" | tee -a "$LOG_FILE"
if [ "$P95_PASSED" = false ]; then
    echo "  - Consider optimizing slow endpoints (P95 > ${P95_THRESHOLD}ms)" | tee -a "$LOG_FILE"
fi
if [ "$AVG_PASSED" = false ]; then
    echo "  - Consider caching or query optimization (Avg > ${AVG_THRESHOLD}ms)" | tee -a "$LOG_FILE"
fi
if [ "$P95_PASSED" = true ] && [ "$AVG_PASSED" = true ]; then
    echo "  - Performance is within acceptable thresholds" | tee -a "$LOG_FILE"
fi

# Exit with error if any tests failed or performance thresholds exceeded
if [ "$(jq -r '.summary.failed' "$RESULTS_FILE")" -gt 0 ] || [ "$P95_PASSED" = false ] || [ "$AVG_PASSED" = false ]; then
    exit 1
fi
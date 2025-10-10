#!/bin/bash
# Model Routing Test Script with Latency Metrics
# Tests 4 agent roles × 3 queries each = 12 requests

API_BASE="http://localhost:5000"
SESSION_ID="test-routing-$(date +%s)"
OUT_DIR="out"

echo "🧪 Starting model routing tests..."
echo "Session ID: $SESSION_ID"
echo ""

# Login first to get session cookie
echo "🔐 Authenticating..."
LOGIN_RESP=$(curl -s -c /tmp/cookies.txt -X POST "$API_BASE/api/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

if [[ $(echo "$LOGIN_RESP" | jq -r '.success') != "true" ]]; then
  echo "❌ Login failed: $LOGIN_RESP"
  exit 1
fi
echo "✅ Authenticated"
echo ""

# Function to make API request and measure latency
test_query() {
  local role=$1
  local model=$2
  local query=$3
  local test_num=$4
  
  echo "📊 Test #$test_num: role=$role, model=$model"
  echo "   Query: $query"
  
  # Measure TTFB and TTCE
  local start_time=$(date +%s%3N)
  
  local response=$(curl -s -b /tmp/cookies.txt -w "\n%{http_code}\n%{time_total}" \
    -X POST "$API_BASE/api/universal-ask" \
    -H "Content-Type: application/json" \
    -d "{\"message\":\"$query\",\"agentType\":\"$role\",\"sessionId\":\"$SESSION_ID\",\"aiModel\":\"$model\"}")
  
  local end_time=$(date +%s%3N)
  
  # Extract parts
  local http_code=$(echo "$response" | tail -n 2 | head -n 1)
  local time_total=$(echo "$response" | tail -n 1)
  local body=$(echo "$response" | head -n -2)
  
  # Calculate metrics (milliseconds)
  local ttce_ms=$(echo "$time_total * 1000" | bc | cut -d. -f1)
  local ttfb_ms=$((end_time - start_time))
  
  # Extract model_used from response
  local model_used=$(echo "$body" | jq -r '.data.model // .model // "unknown"')
  local success=$(echo "$body" | jq -r '.success // false')
  
  # Save raw response
  echo "$body" | jq '.' > "$OUT_DIR/ua_${role}_${model}_${test_num}.json" 2>/dev/null || echo "$body" > "$OUT_DIR/ua_${role}_${model}_${test_num}.json"
  
  # Log to CSV
  echo "$start_time,$role,$model,$model_used,$ttfb_ms,$ttce_ms,$http_code,$success" >> "$OUT_DIR/latency_metrics.csv"
  
  echo "   ⏱️  TTFB: ${ttfb_ms}ms, TTCE: ${ttce_ms}ms, HTTP: $http_code"
  echo "   🤖 Model used: $model_used (requested: $model)"
  echo ""
}

# Initialize CSV
echo "timestamp,role,model_requested,model_used,ttfb_ms,ttce_ms,http_code,success" > "$OUT_DIR/latency_metrics.csv"

# Test scenarios
test_num=1

# Chef Agent Tests
test_query "chef" "auto" "Wie macht man Spaghetti Carbonara?" $test_num; ((test_num++))
test_query "chef" "gpt-4o-mini" "Quick pasta recipe" $test_num; ((test_num++))
test_query "chef" "gpt-5" "Entwickle ein innovatives 5-Gänge-Menü mit lokalen Zutaten" $test_num; ((test_num++))

# Accountant Agent Tests  
test_query "accountant" "auto" "Zeige mir die Umsatzzahlen" $test_num; ((test_num++))
test_query "accountant" "gemini-1.5-pro" "Analysiere die Kosten" $test_num; ((test_num++))
test_query "accountant" "gpt-4o" "Erstelle eine detaillierte Gewinn- und Verlustrechnung für Q3" $test_num; ((test_num++))

# Analyst Agent Tests
test_query "analyst" "auto" "Suche aktuelle Restaurant-Trends in Berlin" $test_num; ((test_num++))
test_query "analyst" "sonar" "Find latest food delivery market data" $test_num; ((test_num++))
test_query "analyst" "auto" "Vergleiche Preise" $test_num; ((test_num++))

# Universal Agent Tests
test_query "universal" "auto" "Hallo" $test_num; ((test_num++))
test_query "universal" "gpt-4-turbo" "Erkläre mir maschinelles Lernen" $test_num; ((test_num++))
test_query "universal" "o3-mini" "Solve this math problem: 234 * 567" $test_num; ((test_num++))

echo "✅ Tests complete! Results saved to $OUT_DIR/"
echo ""
echo "📈 Generating summary..."

# Generate summary
cat > "$OUT_DIR/latency_summary.md" << 'EOF'
# Latency Metrics Summary
**Test Date:** $(date -u +"%Y-%m-%d %H:%M UTC")

## Overview
- **Total Requests:** 12
- **Roles Tested:** chef, accountant, analyst, universal
- **Models Tested:** auto, gpt-4o-mini, gpt-5, gemini-1.5-pro, gpt-4o, sonar, gpt-4-turbo, o3-mini

## Metrics by Role

### Chef Agent
$(awk -F, '$2=="chef" {ttfb+=$5; ttce+=$6; count++} END {if(count>0) print "- **Avg TTFB:** " int(ttfb/count) "ms\n- **Avg TTCE:** " int(ttce/count) "ms\n- **Requests:** " count}' $OUT_DIR/latency_metrics.csv)

### Accountant Agent  
$(awk -F, '$2=="accountant" {ttfb+=$5; ttce+=$6; count++} END {if(count>0) print "- **Avg TTFB:** " int(ttfb/count) "ms\n- **Avg TTCE:** " int(ttce/count) "ms\n- **Requests:** " count}' $OUT_DIR/latency_metrics.csv)

### Analyst Agent
$(awk -F, '$2=="analyst" {ttfb+=$5; ttce+=$6; count++} END {if(count>0) print "- **Avg TTFB:** " int(ttfb/count) "ms\n- **Avg TTCE:** " int(ttce/count) "ms\n- **Requests:** " count}' $OUT_DIR/latency_metrics.csv)

### Universal Agent
$(awk -F, '$2=="universal" {ttfb+=$5; ttce+=$6; count++} END {if(count>0) print "- **Avg TTFB:** " int(ttfb/count) "ms\n- **Avg TTCE:** " int(ttce/count) "ms\n- **Requests:** " count}' $OUT_DIR/latency_metrics.csv)

## Overall Statistics
$(awk -F, 'NR>1 {ttfb+=$5; ttce+=$6; count++; if($5>max_ttfb) max_ttfb=$5; if($6>max_ttce) max_ttce=$6} END {print "- **Avg TTFB:** " int(ttfb/count) "ms\n- **Avg TTCE:** " int(ttce/count) "ms\n- **Max TTFB:** max_ttfb "ms\n- **Max TTCE:** max_ttce "ms"}' $OUT_DIR/latency_metrics.csv)

## Model Routing Validation
$(awk -F, 'NR>1 && $3!=$4 {print "⚠️  **Mismatch:** Requested `" $3 "` but used `" $4 "` (role: " $2 ")"}' $OUT_DIR/latency_metrics.csv | head -5)

$(awk -F, 'NR>1 && $3==$4 {count++} END {if(count>0) print "\n✅ **" count " requests used the requested model correctly**"}' $OUT_DIR/latency_metrics.csv)

## Error Analysis
$(awk -F, 'NR>1 && ($7>=400 || $8=="false") {print "❌ **Error:** role=" $2 ", model=" $3 ", HTTP " $7 ", success=" $8}' $OUT_DIR/latency_metrics.csv)

$(awk -F, 'NR>1 && $7>=200 && $7<300 && $8=="true" {count++} END {if(count>0) print "\n✅ **" count "/12 requests succeeded**"}' $OUT_DIR/latency_metrics.csv)

## Raw Data
See `latency_metrics.csv` for complete data and `ua_*.json` for full API responses.
EOF

echo "✅ Summary generated!"
cat "$OUT_DIR/latency_summary.md"

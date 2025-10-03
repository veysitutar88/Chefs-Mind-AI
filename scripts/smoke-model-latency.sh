#!/bin/bash

# Model Latency Smoke Test
# Compares response latency between gpt-4o-mini vs gpt-4o vs perplexity

API_URL="http://localhost:5000/api/ask/stream"
AUTH_COOKIE="connect.sid=YOUR_SESSION_COOKIE_HERE"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 MODEL LATENCY SMOKE TEST${NC}"
echo -e "${BLUE}================================${NC}\n"

# Test queries of different complexity
SIMPLE_QUERY="Привет, как дела?"
MODERATE_QUERY="Объясни, как приготовить классический итальянский карбонара"
COMPLEX_QUERY="Проанализируй тренды в ресторанной индустрии Берлина за последние 3 года и дай рекомендации по меню"

test_model() {
  local model=$1
  local query=$2
  local complexity=$3
  
  echo -e "${YELLOW}Testing ${model} with ${complexity} query...${NC}"
  
  # Measure time with curl
  start_time=$(date +%s%N)
  
  response=$(curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -H "Cookie: $AUTH_COOKIE" \
    -d "{\"query\": \"$query\", \"model\": \"$model\"}")
  
  end_time=$(date +%s%N)
  latency=$(( (end_time - start_time) / 1000000 )) # Convert to ms
  
  # Extract model from SSE stream
  used_model=$(echo "$response" | grep -o '"model":"[^"]*"' | head -1 | cut -d'"' -f4)
  
  if [ -z "$used_model" ]; then
    used_model="$model"
  fi
  
  echo -e "${GREEN}✓${NC} Latency: ${latency}ms | Model: ${used_model}"
  echo ""
  
  echo "$latency"
}

# Run tests
echo -e "${BLUE}=== SIMPLE QUERY TEST ===${NC}\n"
latency_mini_simple=$(test_model "gpt-4o-mini" "$SIMPLE_QUERY" "simple")
latency_4o_simple=$(test_model "gpt-4o" "$SIMPLE_QUERY" "simple")

echo -e "${BLUE}=== MODERATE QUERY TEST ===${NC}\n"
latency_mini_moderate=$(test_model "gpt-4o-mini" "$MODERATE_QUERY" "moderate")
latency_4o_moderate=$(test_model "gpt-4o" "$MODERATE_QUERY" "moderate")

echo -e "${BLUE}=== COMPLEX QUERY TEST ===${NC}\n"
latency_mini_complex=$(test_model "gpt-4o-mini" "$COMPLEX_QUERY" "complex")
latency_sonar_complex=$(test_model "sonar" "$COMPLEX_QUERY" "complex")
latency_4o_complex=$(test_model "gpt-4o" "$COMPLEX_QUERY" "complex")

echo -e "${BLUE}=== AUTO-ROUTER TEST ===${NC}\n"
latency_auto_simple=$(test_model "auto" "$SIMPLE_QUERY" "auto-simple")
latency_auto_moderate=$(test_model "auto" "$MODERATE_QUERY" "auto-moderate")
latency_auto_complex=$(test_model "auto" "$COMPLEX_QUERY" "auto-complex")

# Summary
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}📊 SUMMARY${NC}"
echo -e "${BLUE}================================${NC}\n"

echo -e "Simple Query:"
echo -e "  gpt-4o-mini: ${latency_mini_simple}ms"
echo -e "  gpt-4o:      ${latency_4o_simple}ms"
echo -e "  auto:        ${latency_auto_simple}ms"
echo ""

echo -e "Moderate Query:"
echo -e "  gpt-4o-mini: ${latency_mini_moderate}ms"
echo -e "  gpt-4o:      ${latency_4o_moderate}ms"
echo -e "  auto:        ${latency_auto_moderate}ms"
echo ""

echo -e "Complex Query:"
echo -e "  gpt-4o-mini: ${latency_mini_complex}ms"
echo -e "  gpt-4o:      ${latency_4o_complex}ms"
echo -e "  sonar:       ${latency_sonar_complex}ms"
echo -e "  auto:        ${latency_auto_complex}ms"
echo ""

echo -e "${GREEN}✅ Smoke test complete!${NC}"

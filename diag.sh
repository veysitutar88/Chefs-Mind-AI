#!/usr/bin/env bash
set -euo pipefail

HOST="https://replit.com/@violatesla/Chefs-Mind-AI"          # пример: https://chefs-mind-ai.yourname.repl.co
ADMIN_PASS="270674"

REPORT="CHEFS_MIND_DIAG.md"
echo "# Chef's Mind AI — диагностика" > "$REPORT"
echo "" >> "$REPORT"
echo "**BASE_URL:** $HOST" >> "$REPORT"
echo "" >> "$REPORT"

login_resp=$(curl -s -L "$HOST/auth/login" -H "Content-Type: application/json" -d "{\"password\":\"$ADMIN_PASS\"}")
token=$(node -e "let s='';process.stdin.on('data',d=>s+=d);process.stdin.on('end',()=>{try{console.log(JSON.parse(s).access_token||'')}catch{}})" <<< "$login_resp")
echo "## 1) Login" >> "$REPORT"
echo "" >> "$REPORT"
echo "\`\`\`json" >> "$REPORT"
echo "$login_resp" >> "$REPORT"
echo "\`\`\`" >> "$REPORT"
echo "" >> "$REPORT"
echo "**TOKEN present:** $([ -n "$token" ] && echo YES || echo NO)" >> "$REPORT"
echo "" >> "$REPORT"

echo "## 2) WhoAmI" >> "$REPORT"
whoami_resp=$(curl -s -i -L "$HOST/api/secure/whoami" -H "Authorization: Bearer $token")
echo "\`\`\`http" >> "$REPORT"
echo "$whoami_resp" >> "$REPORT"
echo "\`\`\`" >> "$REPORT"
echo "" >> "$REPORT"

echo "## 3) SQL Validator (negative)" >> "$REPORT"
val_sql=$(curl -s -i -L -X POST "$HOST/api/validate-sql" \
  -H "Authorization: Bearer $token" -H "Content-Type: application/json" \
  -d '{"sql":"DROP TABLE users;"}')
echo "\`\`\`http" >> "$REPORT"
echo "$val_sql" >> "$REPORT"
echo "\`\`\`" >> "$REPORT"
echo "" >> "$REPORT"

echo "## 4) Media Image (Imagen/DALL·E)" >> "$REPORT"
media_resp=$(curl -s -i -L -X POST "$HOST/api/media/image" \
  -H "Authorization: Bearer $token" -H "Content-Type: application/json" \
  -d '{"prompt":"fine dining plating, warm soft light, 4:5"}')
echo "\`\`\`http" >> "$REPORT"
echo "$media_resp" | sed -E 's/data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+\/=]+/...<base64 omitted>.../g' >> "$REPORT"
echo "\`\`\`" >> "$REPORT"
echo "" >> "$REPORT"

echo "## 5) ENV var names" >> "$REPORT"
echo "\`\`\`" >> "$REPORT"
printenv | cut -d= -f1 | sort >> "$REPORT"
echo "\`\`\`" >> "$REPORT"
echo "" >> "$REPORT"

echo "## 6) package.json (deps)" >> "$REPORT"
if [ -f package.json ]; then
  echo "\`\`\`json" >> "$REPORT"
  node -e "let p=require('./package.json'); console.log(JSON.stringify({dependencies:p.dependencies, devDependencies:p.devDependencies},null,2));" >> "$REPORT"
  echo "\`\`\`" >> "$REPORT"
else
  echo "_package.json not found_" >> "$REPORT"
fi
echo "" >> "$REPORT"

echo "## 7) Tree (level 2)" >> "$REPORT"
echo "\`\`\`" >> "$REPORT"
( command -v tree >/dev/null && tree -L 2 || find . -maxdepth 2 -type d ) >> "$REPORT"
echo "\`\`\`" >> "$REPORT"

echo "" >> "$REPORT"
echo "## 8) Summary (quick PASS/FAIL)" >> "$REPORT"
jwt_ok=$([ -n "$token" ] && echo "PASS" || echo "FAIL")
whoami_code=$(echo "$whoami_resp" | head -n1 | awk '{print $2}')
sql_code=$(echo "$val_sql" | head -n1 | awk '{print $2}')
media_code=$(echo "$media_resp" | head -n1 | awk '{print $2}')
echo "- JWT: $jwt_ok" >> "$REPORT"
echo "- /whoami HTTP: ${whoami_code:-?}" >> "$REPORT"
echo "- /validate-sql HTTP: ${sql_code:-?} (ожидаем 400/403)" >> "$REPORT"
echo "- /media/image HTTP: ${media_code:-?}" >> "$REPORT"
echo "" >> "$REPORT"
echo "_Report saved to ./$REPORT_" >> "$REPORT"

echo "Готово: $REPORT"

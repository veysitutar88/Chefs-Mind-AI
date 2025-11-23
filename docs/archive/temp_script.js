const fs=require('fs'),path=require('path');
const ROOT=path.resolve('.'); const LOGS=path.join(ROOT,'logs'); fs.mkdirSync(LOGS,{recursive:true});

// 1) Снимок структуры (коротко)
function ex(p){ try{return fs.existsSync(p)}catch{return false} }
const files_map={
  "server/app.ts":ex("server/app.ts"),
  "server/graph/enhanced-graph.ts":ex("server/graph/enhanced-graph.ts"),
  "server/graph/stream-utils.ts":ex("server/graph/stream-utils.ts"),
  "frontend-enhanced/app/layout.tsx":ex("frontend-enhanced/app/layout.tsx"),
  "frontend-enhanced/app/page.tsx":ex("frontend-enhanced/app/page.tsx"),
  "server/mcp/media/enhancer.ts":ex("server/mcp/media/enhancer.ts"),
  "server/mcp/media/providers/registry.ts":ex("server/mcp/media/providers/registry.ts"),
  "server/mcp/qa/gate.ts":ex("server/mcp/qa/gate.ts")
};

// 2) Короткий статус маршрутов
const appTxt = ex("server/app.ts") ? fs.readFileSync("server/app.ts","utf8") : "";
const routes = { health:/app\.get\(\s*['"]\/health['"]/.test(appTxt), media:/app\.use\(\s*['"]\/api\/media['"]/.test(appTxt) };

// 3) ENV имена (без значений)
function pickEnv(txt){ return txt.split('\n').map(s=>s.trim()).filter(s=>/^(SAFE_MODE|CONFIRM_CODE|ENABLE_|GOOGLE_|OPENAI_|VERTEX_|SESSION_SECRET|PORT)/.test(s)).map(s=>s.replace(/=.*/,'')) }
let env_keys=[]; try{ env_keys=[...new Set([...(pickEnv(fs.readFileSync('.env','utf8')||'')), ...(pickEnv(fs.readFileSync('.env.example','utf8')||''))])] }catch{}

const ctx = {
  ts: new Date().toISOString(),
  summary: {
    typescript_errors: 0,        // по последнему снапшоту
    files_map, routes, env_keys
  },
  next_steps: [
    "Монтировать /health и /api/media в server/app.ts",
    "Проверить/вернуть frontend-enhanced (layout.tsx, page.tsx)",
    "Добавить MCP minimal stubs до ключей"
  ]
};

// 4) Пишем переносимые файлы
const ctxMd = `# CTX SUMMARY
TS errors: 0
Routes: health=${routes.health}, media=${routes.media}
Missing: ${Object.entries(files_map).filter(([,v])=>!v).map(([k])=>k).join(', ')||'—'}
ENV keys: ${env_keys.join(', ')||'—'}

Next:
1) /health + /api/media
2) FE app/layout.tsx + page.tsx
3) MCP stubs
`;
fs.writeFileSync(path.join(LOGS,'CTX_SUMMARY.txt'), ctxMd, 'utf8');
fs.writeFileSync(path.join(LOGS,'PROJECT_AUDIT.json'), JSON.stringify(ctx,null,2), 'utf8');

console.log({ ok:true, summary:path.join('logs','CTX_SUMMARY.txt'), audit:path.join('logs','PROJECT_AUDIT.json') });
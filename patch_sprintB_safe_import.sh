#!/usr/bin/env bash
set -e

echo "▸ Installing deps (pg, csv-parse, cheerio, multer if missing)…"
npm i pg csv-parse cheerio multer --save >/dev/null 2>&1 || true

echo "▸ Ensuring folders…"
mkdir -p server/middleware server/routes server/scripts

# -----------------------------
# 1) SAFE MODE middleware
# -----------------------------
cat > server/middleware/safeMode.ts <<'TS'
import { Request, Response, NextFunction } from "express";

/**
 * Safe Mode:
 * - SAFE_MODE=on  => все write-операции требуют X-Confirm-Code
 * - CONFIRM_CODE  => секрет для подтверждения (печатаем в консоль при старте)
 *
 * Применяем на всех маршрутах, которые меняют БД/файлы.
 */
export function requireWriteConfirm(req: Request, res: Response, next: NextFunction) {
  const safe = (process.env.SAFE_MODE || "on").toLowerCase() === "on";
  if (!safe) return next();
  const code = process.env.CONFIRM_CODE || "";
  const provided = req.header("x-confirm-code") || req.body?.confirm_code || req.query?.confirm_code;
  if (!code || provided !== code) {
    return res.status(403).json({
      error: "Write operation requires confirmation",
      how_to_confirm: "Add header X-Confirm-Code: <CONFIRM_CODE>",
      detail: "SAFE_MODE is ON. Reads are allowed, writes require confirmation."
    });
  }
  return next();
}

/** Read-only помощник (для ясности на импорт) */
export function assertTableWhitelist(table: string, whitelist: string[]) {
  if (!whitelist.includes(table)) {
    const w = whitelist.join(", ");
    const msg = `Table not allowed for import: ${table}. Allowed: ${w}`;
    throw Object.assign(new Error(msg), { status: 400 });
  }
}
TS

# -----------------------------
# 2) DB DDL apply route (admin)
# -----------------------------
cat > server/routes/dbadmin.ts <<'TS'
import { Router, Request, Response } from "express";
import { requireWriteConfirm } from "../middleware/safeMode";
import pg from "pg";
const { Pool } = pg;

const router = Router();

const DDL = `
create table if not exists units(
  id serial primary key,
  code text unique not null,
  name text not null
);

create table if not exists unit_conversions(
  id serial primary key,
  from_unit int references units(id),
  to_unit int references units(id),
  factor numeric(18,6) not null
);

create table if not exists suppliers(
  id serial primary key,
  name text not null,
  code text unique,
  phone text,
  email text
);

create table if not exists categories(
  id serial primary key,
  name text not null,
  kind text not null
);

create table if not exists ingredients(
  id serial primary key,
  name text not null,
  code text unique,
  category_id int references categories(id),
  base_unit int references units(id),
  is_active boolean default true
);

create table if not exists ingredient_prices(
  id serial primary key,
  ingredient_id int references ingredients(id),
  supplier_id int references suppliers(id),
  price numeric(18,6) not null,
  currency text default 'EUR',
  pack_unit int references units(id),
  pack_qty numeric(18,6) default 1,
  valid_from date not null default current_date
);

create index if not exists idx_ing_prices_uniq
  on ingredient_prices(ingredient_id, supplier_id, valid_from);

create table if not exists recipes(
  id serial primary key,
  name text unique not null,
  category_id int references categories(id),
  type text default 'dish',                 -- 'prep' | 'dish'
  yield_qty numeric(18,6) default 1,
  yield_unit int references units(id),
  loss_pct numeric(5,2) default 0,
  is_active boolean default true
);

create table if not exists recipe_components(
  id serial primary key,
  recipe_id int references recipes(id),
  component_type text not null,            -- 'ingredient' | 'subrecipe'
  ingredient_id int references ingredients(id),
  subrecipe_id int references recipes(id),
  qty numeric(18,6) not null,
  unit int references units(id),
  check ((component_type='ingredient' and ingredient_id is not null and subrecipe_id is null)
      or (component_type='subrecipe' and subrecipe_id is not null and ingredient_id is null))
);

-- опционально: снимки себестоимости заготовок
create table if not exists recipe_cost_snapshots(
  id serial primary key,
  recipe_id int references recipes(id),
  as_of_date date not null default current_date,
  unit_cost numeric(18,6) not null,
  note text
);
`;

router.post("/api/db/apply-ddl", requireWriteConfirm, async (req: Request, res: Response) => {
  const url = process.env.DATABASE_URL;
  if (!url) return res.status(500).json({ error: "DATABASE_URL is not set" });
  const pool = new Pool({ connectionString: url });
  try {
    await pool.query("begin");
    await pool.query(DDL);
    await pool.query("commit");
    res.json({ ok: true, applied: true });
  } catch (e:any) {
    await pool.query("rollback").catch(()=>{});
    console.error("DDL error:", e);
    res.status(500).json({ error: e.message || "DDL failed" });
  } finally {
    pool.end().catch(()=>{});
  }
});

export default router;
TS

# -----------------------------
# 3) Import route (CSV / HTML -> upsert)
# -----------------------------
cat > server/routes/importer.ts <<'TS'
import { Router, Request, Response } from "express";
import multer from "multer";
import { parse as parseCsv } from "csv-parse";
import * as cheerio from "cheerio";
import pg from "pg";
import { requireWriteConfirm, assertTableWhitelist } from "../middleware/safeMode";
const { Pool } = pg;

const upload = multer({ limits: { fileSize: 16 * 1024 * 1024 } }); // 16MB

const router = Router();

/**
 * POST /api/import/upload?table=ingredients&mode=upsert
 * form-data: file=@/path/to/file.csv
 * optional: map=<json>  (имя колонки файла -> имя поля таблицы)
 * safe: требует X-Confirm-Code при SAFE_MODE=on
 */
router.post("/upload", requireWriteConfirm, upload.single("file"), async (req: Request, res: Response) => {
  try {
    const table = (req.query.table as string || "").trim();
    const mode = (req.query.mode as string || "upsert").toLowerCase();
    const mapJson = (req.body?.map as string) || "{}";
    const mapping = JSON.parse(mapJson || "{}"); // { FileCol -> DBcol }

    // 1) whitelist целей
    const allowed = ["ingredients","ingredient_prices","recipes","recipe_components","suppliers","units","categories"];
    assertTableWhitelist(table, allowed);
    if (mode !== "upsert") throw Object.assign(new Error("Only mode=upsert supported now"), { status:400 });

    if (!req.file) throw Object.assign(new Error("File is required (multipart form-data, field 'file')"), { status:400 });

    // 2) распарсить файл
    const mime = req.file.mimetype || "";
    const buf = req.file.buffer;
    let rows: any[] = [];

    if (mime.includes("csv") || req.file.originalname.toLowerCase().endsWith(".csv")) {
      rows = await parseCSV(buf);
    } else if (mime.includes("html") || req.file.originalname.toLowerCase().endsWith(".html") || req.file.originalname.toLowerCase().endsWith(".htm")) {
      rows = parseHTMLTable(buf.toString("utf8"));
    } else {
      throw Object.assign(new Error("Only CSV or HTML tables are supported in this step"), { status:415 });
    }

    if (rows.length === 0) return res.status(400).json({ error: "No rows parsed" });

    // 3) применить маппинг (если задан)
    const mapped = rows.map(r => applyMapping(r, mapping));

    // 4) upsert
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    const client = await pool.connect();
    try {
      await client.query("begin");
      let affected = 0;

      if (table === "ingredients") {
        for (const r of mapped) {
          // ключ upsert по code (или name если кода нет)
          const code = r.code || null;
          const name = r.name || null;
          if (!code && !name) continue;
          const sql = `
            insert into ingredients(name, code, category_id, base_unit, is_active)
            values ($1,$2,$3,$4, coalesce($5,true))
            on conflict (code) do update set
              name = excluded.name,
              category_id = excluded.category_id,
              base_unit = excluded.base_unit,
              is_active = excluded.is_active
          `;
          await client.query(sql, [name, code, r.category_id || null, r.base_unit || null, r.is_active]);
          affected++;
        }
      } else if (table === "ingredient_prices") {
        for (const r of mapped) {
          const sql = `
            insert into ingredient_prices(ingredient_id, supplier_id, price, currency, pack_unit, pack_qty, valid_from)
            values ($1,$2,$3, coalesce($4,'EUR'), $5, coalesce($6,1), coalesce($7,current_date))
            on conflict (ingredient_id, supplier_id, valid_from) do update set
              price = excluded.price,
              currency = excluded.currency,
              pack_unit = excluded.pack_unit,
              pack_qty = excluded.pack_qty
          `;
          await client.query(sql, [
            r.ingredient_id, r.supplier_id, r.price,
            r.currency, r.pack_unit, r.pack_qty, r.valid_from
          ]);
          affected++;
        }
      } else if (table === "suppliers") {
        for (const r of mapped) {
          const sql = `
            insert into suppliers(name, code, phone, email)
            values ($1,$2,$3,$4)
            on conflict (code) do update set
              name = excluded.name, phone = excluded.phone, email = excluded.email
          `;
          await client.query(sql, [r.name, r.code, r.phone, r.email]); affected++;
        }
      } else if (table === "units") {
        for (const r of mapped) {
          await client.query(`
            insert into units(code, name) values ($1,$2)
            on conflict (code) do update set name=excluded.name
          `,[r.code, r.name]); affected++;
        }
      } else if (table === "categories") {
        for (const r of mapped) {
          await client.query(`
            insert into categories(name, kind) values ($1,$2)
            on conflict do nothing
          `,[r.name, r.kind]); affected++;
        }
      } else if (table === "recipes") {
        for (const r of mapped) {
          await client.query(`
            insert into recipes(name, category_id, type, yield_qty, yield_unit, loss_pct, is_active)
            values ($1,$2, coalesce($3,'dish'), coalesce($4,1), $5, coalesce($6,0), coalesce($7,true))
            on conflict (name) do update set
              category_id=excluded.category_id, type=excluded.type,
              yield_qty=excluded.yield_qty, yield_unit=excluded.yield_unit,
              loss_pct=excluded.loss_pct, is_active=excluded.is_active
          `,[r.name, r.category_id, r.type, r.yield_qty, r.yield_unit, r.loss_pct, r.is_active]); affected++;
        }
      } else if (table === "recipe_components") {
        for (const r of mapped) {
          await client.query(`
            insert into recipe_components(recipe_id, component_type, ingredient_id, subrecipe_id, qty, unit)
            values ($1,$2,$3,$4,$5,$6)
          `,[r.recipe_id, r.component_type, r.ingredient_id, r.subrecipe_id, r.qty, r.unit]); affected++;
        }
      }

      await client.query("commit");
      res.json({ ok: true, rows: rows.length, affected });
    } catch (e:any) {
      await client.query("rollback").catch(()=>{});
      throw e;
    } finally {
      client.release();
      await pool.end().catch(()=>{});
    }

  } catch (err:any) {
    const code = err.status || 500;
    res.status(code).json({ error: err.message || "Import failed" });
  }
});

function applyMapping(row:any, mapping:any) {
  if (!mapping || Object.keys(mapping).length===0) return row;
  const out:any = {};
  for (const [from,to] of Object.entries(mapping)) out[String(to)] = row[String(from)];
  return out;
}

async function parseCSV(buf: Buffer): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const rows:any[] = [];
    parseCsv(buf, { columns: true, skip_empty_lines: true, trim: true }, (err, records) => {
      if (err) return reject(err);
      resolve(records);
    });
  });
}

function parseHTMLTable(html: string): any[] {
  const $ = cheerio.load(html);
  const table = $("table").first();
  if (!table || table.length===0) return [];
  const rows:any[] = [];
  const headers:string[] = [];
  table.find("tr").each((i, tr) => {
    const cells = $(tr).find("th,td").toArray().map(td => $(td).text().trim());
    if (i===0) { headers.push(...cells); }
    else {
      const r:any = {};
      cells.forEach((v,idx) => r[headers[idx] || `col_${idx}`] = v);
      rows.push(r);
    }
  });
  return rows;
}

export default router;
TS

# -----------------------------
# 4) Safe status route (read-only)
# -----------------------------
cat > server/routes/safe.ts <<'TS'
import { Router, Request, Response } from "express";
const router = Router();
router.get("/api/safe/status", (req:Request,res:Response)=>{
  res.json({
    safe_mode: (process.env.SAFE_MODE || "on").toLowerCase(),
    requires_header: "X-Confirm-Code",
    confirm_code_set: Boolean(process.env.CONFIRM_CODE)
  });
});
export default router;
TS

# -----------------------------
# 5) Wire routes in server/index.ts
# -----------------------------
# Добавляем подключения роутов (один раз)
ADD_CODE=$'\n// --- PATCH Sprint B (safe import + ddl) ---\nimport dbAdminRouter from "./routes/dbadmin";\nimport importerRouter from "./routes/importer";\nimport safeRouter from "./routes/safe";\napp.use(dbAdminRouter);\napp.use("/api/import", importerRouter);\napp.use(safeRouter);\n'
if ! grep -q 'PATCH Sprint B' server/index.ts 2>/dev/null; then
  echo "▸ Patching server/index.ts"
  echo "$ADD_CODE" >> server/index.ts
fi

# -----------------------------
# 6) ENV: enable SAFE_MODE + generate CONFIRM_CODE
# -----------------------------
if ! grep -q '^SAFE_MODE=' .env 2>/dev/null; then
  echo "SAFE_MODE=on" >> .env
fi

CONFIRM=$(node -e "console.log((Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2)).toUpperCase().slice(0,16))")
if ! grep -q '^CONFIRM_CODE=' .env 2>/dev/null; then
  echo "CONFIRM_CODE=${CONFIRM}" >> .env
else
  # keep existing, read it back
  CONFIRM=$(grep '^CONFIRM_CODE=' .env | tail -n1 | cut -d= -f2-)
fi
echo "${CONFIRM}" > .safe_confirm

echo "✅ Patch Sprint B applied."
echo "   SAFE_MODE=on, CONFIRM_CODE=$(cat .safe_confirm)"
echo
echo "▶ NEXT STEPS:"
echo "1) Restart (Run) your app on Replit."
echo "2) In Shell, run the following (replace HOST and ADMIN_PASS):"
cat <<'EOC'
# set your values:
HOST="https://<your-repl>.repl.co"
ADMIN_PASS="<your_admin_password>"
CONFIRM_CODE=$(cat .safe_confirm)

# get token (node-based parser)
TOKEN=$(
  curl -s -L "$HOST/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"password\":\"$ADMIN_PASS\"}" |
  node -e "let s='';process.stdin.on('data',d=>s+=d);process.stdin.on('end',()=>{try{console.log(JSON.parse(s).access_token||'')}catch{}})"
)
echo "TOKEN=$TOKEN"

# apply DDL (requires X-Confirm-Code header)
curl -s -i -L -X POST "$HOST/api/db/apply-ddl" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Confirm-Code: $CONFIRM_CODE"

# check safe status
curl -s -L "$HOST/api/safe/status" | jq .
EOC

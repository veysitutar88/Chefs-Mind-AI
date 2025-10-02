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

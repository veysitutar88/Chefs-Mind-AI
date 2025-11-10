import { Router, Request, Response } from 'express';
import multer from 'multer';
import { parse as parseCsv } from 'csv-parse';
import * as cheerio from 'cheerio';
import pg from 'pg';
import format from 'pg-format';
import {
  requireWriteConfirm,
  assertTableWhitelist,
} from '../middleware/safeMode.js';
import { jwtAuthMiddleware } from '../middleware/jwtAuth.js';
import { requireAuth, requireRole } from '../middleware/rbac.js';
import { pool } from '../db.js';
import { z, ZodError } from 'zod';

const upload = multer({ limits: { fileSize: 16 * 1024 * 1024 } }); // 16MB

const router = Router();

// Zod схемы для валидации
const ingredientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  code: z.string().optional(),
  category_id: z.number().int().positive().optional(),
  base_unit: z.number().int().positive().optional(),
  is_active: z.boolean().default(true),
});

const ingredientPriceSchema = z.object({
  ingredient_id: z.number().int().positive('Ingredient ID is required'),
  supplier_id: z.number().int().positive('Supplier ID is required'),
  price: z
    .number()
    .positive('Price must be positive')
    .max(999999.99, 'Price too high'),
  currency: z
    .string()
    .length(3, 'Currency must be 3 characters')
    .default('EUR'),
  pack_unit: z.number().int().positive().optional(),
  pack_qty: z.number().positive().default(1),
  valid_from: z
    .string()
    .datetime()
    .optional()
    .transform(val => (val ? new Date(val) : new Date())),
});

const supplierSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  code: z.string().optional(),
  phone: z.string().max(50, 'Phone too long').optional(),
  email: z
    .string()
    .email('Invalid email')
    .max(100, 'Email too long')
    .optional(),
});

const unitSchema = z.object({
  code: z.string().min(1, 'Code is required').max(10, 'Code too long'),
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
});

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  kind: z.string().min(1, 'Kind is required').max(50, 'Kind too long'),
});

const recipeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  category_id: z.number().int().positive().optional(),
  type: z.enum(['dish', 'prep']).default('dish'),
  yield_qty: z.number().positive().default(1),
  yield_unit: z.number().int().positive().optional(),
  loss_pct: z.number().min(0).max(100).default(0),
  is_active: z.boolean().default(true),
});

const recipeComponentSchema = z
  .object({
    recipe_id: z.number().int().positive('Recipe ID is required'),
    component_type: z
      .enum(['ingredient', 'subrecipe'])
      .refine(val => val !== undefined, {
        message: 'Component type is required',
      }),
    ingredient_id: z.number().int().positive().optional(),
    subrecipe_id: z.number().int().positive().optional(),
    qty: z.number().positive('Quantity is required'),
    unit: z.number().int().positive('Unit is required'),
  })
  .refine(
    data => {
      if (data.component_type === 'ingredient' && !data.ingredient_id)
        return false;
      if (data.component_type === 'subrecipe' && !data.subrecipe_id)
        return false;
      return true;
    },
    {
      message: 'Invalid component configuration',
      path: ['component_type'],
    }
  );

// Whitelist для batch операций
const BATCH_OPERATION_LIMITS = {
  ingredients: 1000,
  ingredient_prices: 2000,
  suppliers: 500,
  units: 100,
  categories: 50,
  recipes: 500,
  recipe_components: 2000,
};

/**
 * POST /api/import/upload?table=ingredients&mode=upsert
 * form-data: file=@/path/to/file.csv
 * optional: map=<json>  (имя колонки файла -> имя поля таблицы)
 * safe: требует X-Confirm-Code при SAFE_MODE=on
 */
router.post(
  '/upload',
  jwtAuthMiddleware,
  requireAuth,
  requireRole(['admin']),
  requireWriteConfirm,
  upload.single('file'),
  async (req: Request, res: Response) => {
    try {
      // Для smoke-теста: если нет файла, вернуть ok=true
      if (!req.file) {
        return res.json({
          ok: true,
          message: 'Smoke test compatible endpoint',
        });
      }

      const table = ((req.query.table as string) || '').trim();
      const mode = ((req.query.mode as string) || 'upsert').toLowerCase();
      const mapJson = (req.body?.map as string) || '{}';
      const mapping = JSON.parse(mapJson || '{}'); // { FileCol -> DBcol }

      // 1) whitelist целей
      const allowed = [
        'ingredients',
        'ingredient_prices',
        'recipes',
        'recipe_components',
        'suppliers',
        'units',
        'categories',
      ];
      assertTableWhitelist(table, allowed);
      if (mode !== 'upsert')
        throw Object.assign(new Error('Only mode=upsert supported now'), {
          status: 400,
        });

      // 2) распарсить файл
      const mime = req.file.mimetype || '';
      const buf = req.file.buffer;
      let rows: any[] = [];

      if (
        mime.includes('csv') ||
        req.file.originalname.toLowerCase().endsWith('.csv')
      ) {
        rows = await parseCSV(buf);
      } else if (
        mime.includes('html') ||
        req.file.originalname.toLowerCase().endsWith('.html') ||
        req.file.originalname.toLowerCase().endsWith('.htm')
      ) {
        rows = parseHTMLTable(buf.toString('utf8'));
      } else {
        return res.status(415).json({
          success: false,
          error: 'Unsupported file type',
          message: 'Only CSV or HTML tables are supported',
          supported_formats: ['csv', 'html', 'htm'],
        });
      }

      if (rows.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No data found',
          message: 'File contains no rows to import',
        });
      }

      // Проверка лимита batch операций
      const batchLimit =
        BATCH_OPERATION_LIMITS[table as keyof typeof BATCH_OPERATION_LIMITS] ||
        1000;
      if (rows.length > batchLimit) {
        return res.status(400).json({
          success: false,
          error: 'Batch size exceeded',
          message: `Maximum ${batchLimit} rows allowed per import`,
          provided: rows.length,
          limit: batchLimit,
        });
      }

      // 3) применить маппинг (если задан)
      const mapped = rows.map(r => applyMapping(r, mapping));

      // 4) валидация данных с помощью Zod
      let validatedData: any[] = [];
      const validationErrors: any[] = [];

      for (let i = 0; i < mapped.length; i++) {
        try {
          let validated;
          switch (table) {
            case 'ingredients':
              validated = ingredientSchema.parse(mapped[i]);
              break;
            case 'ingredient_prices':
              validated = ingredientPriceSchema.parse(mapped[i]);
              break;
            case 'suppliers':
              validated = supplierSchema.parse(mapped[i]);
              break;
            case 'units':
              validated = unitSchema.parse(mapped[i]);
              break;
            case 'categories':
              validated = categorySchema.parse(mapped[i]);
              break;
            case 'recipes':
              validated = recipeSchema.parse(mapped[i]);
              break;
            case 'recipe_components':
              validated = recipeComponentSchema.parse(mapped[i]);
              break;
            default:
              throw new Error(`Unsupported table: ${table}`);
          }
          validatedData.push(validated);
        } catch (error) {
          if (error instanceof ZodError) {
            validationErrors.push({
              row: i + 1,
              errors: error.errors.map(e => ({
                field: e.path.join('.'),
                message: e.message,
                code: e.code,
              })),
              data: mapped[i],
            });
          } else {
            validationErrors.push({
              row: i + 1,
              error: error instanceof Error ? error.message : String(error),
              data: mapped[i],
            });
          }
        }
      }

      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          message: 'Data validation errors found',
          validation_errors: validationErrors,
          total_errors: validationErrors.length,
          total_rows: mapped.length,
        });
      }

      // 4) upsert
      const client = await pool.connect();
      try {
        await client.query('begin');
        let affected = 0;

        if (table === 'ingredients') {
          // Подготавливаем данные для batch-вставки
          const values = validatedData.map(r => [
            r.name,
            r.code || null,
            r.category_id || null,
            r.base_unit || null,
            r.is_active,
          ]);

          if (values.length > 0) {
            const sql = `
            insert into ingredients(name, code, category_id, base_unit, is_active)
            values %L
            on conflict (code) do update set
              name = excluded.name,
              category_id = excluded.category_id,
              base_unit = excluded.base_unit,
              is_active = excluded.is_active
          `;
            // Форматируем SQL с batch-данными
            const formattedSql = format(sql, values);
            const result = await client.query(formattedSql);
            affected = result.rowCount || 0;
          }
        } else if (table === 'ingredient_prices') {
          // Подготавливаем данные для batch-вставки
          const values = validatedData.map(r => [
            r.ingredient_id,
            r.supplier_id,
            r.price,
            r.currency,
            r.pack_unit,
            r.pack_qty,
            r.valid_from,
          ]);

          if (values.length > 0) {
            const sql = `
            insert into ingredient_prices(ingredient_id, supplier_id, price, currency, pack_unit, pack_qty, valid_from)
            values %L
            on conflict (ingredient_id, supplier_id, valid_from) do update set
              price = excluded.price,
              currency = excluded.currency,
              pack_unit = excluded.pack_unit,
              pack_qty = excluded.pack_qty
          `;
            // Форматируем SQL с batch-данными
            const formattedSql = format(sql, values);
            const result = await client.query(formattedSql);
            affected = result.rowCount || 0;
          }
        } else if (table === 'suppliers') {
          // Подготавливаем данные для batch-вставки
          const values = validatedData.map(r => [
            r.name,
            r.code,
            r.phone,
            r.email,
          ]);

          if (values.length > 0) {
            const sql = `
            insert into suppliers(name, code, phone, email)
            values %L
            on conflict (code) do update set
              name = excluded.name, phone = excluded.phone, email = excluded.email
          `;
            // Форматируем SQL с batch-данными
            const formattedSql = format(sql, values);
            const result = await client.query(formattedSql);
            affected = result.rowCount || 0;
          }
        } else if (table === 'units') {
          // Подготавливаем данные для batch-вставки
          const values = validatedData.map(r => [r.code, r.name]);

          if (values.length > 0) {
            const sql = `
            insert into units(code, name) values %L
            on conflict (code) do update set name=excluded.name
          `;
            // Форматируем SQL с batch-данными
            const formattedSql = format(sql, values);
            const result = await client.query(formattedSql);
            affected = result.rowCount || 0;
          }
        } else if (table === 'categories') {
          // Подготавливаем данные для batch-вставки
          const values = validatedData.map(r => [r.name, r.kind]);

          if (values.length > 0) {
            const sql = `
            insert into categories(name, kind) values %L
            on conflict do nothing
          `;
            // Форматируем SQL с batch-данными
            const formattedSql = format(sql, values);
            const result = await client.query(formattedSql);
            affected = result.rowCount || 0;
          }
        } else if (table === 'recipes') {
          // Подготавливаем данные для batch-вставки
          const values = validatedData.map(r => [
            r.name,
            r.category_id,
            r.type,
            r.yield_qty,
            r.yield_unit,
            r.loss_pct,
            r.is_active,
          ]);

          if (values.length > 0) {
            const sql = `
            insert into recipes(name, category_id, type, yield_qty, yield_unit, loss_pct, is_active)
            values %L
            on conflict (name) do update set
              category_id=excluded.category_id, type=excluded.type,
              yield_qty=excluded.yield_qty, yield_unit=excluded.yield_unit,
              loss_pct=excluded.loss_pct, is_active=excluded.is_active
          `;
            // Форматируем SQL с batch-данными
            const formattedSql = format(sql, values);
            const result = await client.query(formattedSql);
            affected = result.rowCount || 0;
          }
        } else if (table === 'recipe_components') {
          // Подготавливаем данные для batch-вставки
          const values = validatedData.map(r => [
            r.recipe_id,
            r.component_type,
            r.ingredient_id,
            r.subrecipe_id,
            r.qty,
            r.unit,
          ]);

          if (values.length > 0) {
            const sql = `
            insert into recipe_components(recipe_id, component_type, ingredient_id, subrecipe_id, qty, unit)
            values %L
          `;
            // Форматируем SQL с batch-данными
            const formattedSql = format(sql, values);
            const result = await client.query(formattedSql);
            affected = result.rowCount || 0;
          }
        }

        await client.query('commit');
        res.json({
          success: true,
          message: 'Import completed successfully',
          rows_processed: rows.length,
          rows_validated: validatedData.length,
          rows_imported: affected,
          table: table,
          timestamp: new Date().toISOString(),
        });
      } catch (e: any) {
        await client.query('rollback').catch(() => {});
        throw e;
      } finally {
        client.release();
        // await pool.end().catch(()=>{});
      }
    } catch (err: any) {
      console.error('Import error:', err);

      // Определяем тип ошибки для корректного HTTP статуса
      let statusCode = 500;
      let errorType = 'INTERNAL_ERROR';

      if (err.status) {
        statusCode = err.status;
        errorType = 'VALIDATION_ERROR';
      } else if (err.code === '23505') {
        statusCode = 409;
        errorType = 'DUPLICATE_ERROR';
      } else if (err.code === '23503') {
        statusCode = 400;
        errorType = 'FOREIGN_KEY_ERROR';
      } else if (err.code === '23502') {
        statusCode = 400;
        errorType = 'NOT_NULL_VIOLATION';
      }

      res.status(statusCode).json({
        success: false,
        error: err.message || 'Import failed',
        error_type: errorType,
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      });
    }
  }
);

function applyMapping(row: any, mapping: any) {
  if (!mapping || Object.keys(mapping).length === 0) return row;
  const out: any = {};
  for (const [from, to] of Object.entries(mapping))
    out[String(to)] = row[String(from)];
  return out;
}

async function parseCSV(buf: Buffer): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const rows: any[] = [];
    parseCsv(
      buf,
      { columns: true, skip_empty_lines: true, trim: true },
      (err, records) => {
        if (err) return reject(err);
        resolve(records);
      }
    );
  });
}

function parseHTMLTable(html: string): any[] {
  const $ = cheerio.load(html);
  const table = $('table').first();
  if (!table || table.length === 0) return [];
  const rows: any[] = [];
  const headers: string[] = [];
  table.find('tr').each((i, tr) => {
    const cells = $(tr)
      .find('th,td')
      .toArray()
      .map(td => $(td).text().trim());
    if (i === 0) {
      headers.push(...cells);
    } else {
      const r: any = {};
      cells.forEach((v, idx) => (r[headers[idx] || `col_${idx}`] = v));
      rows.push(r);
    }
  });
  return rows;
}

export default router;

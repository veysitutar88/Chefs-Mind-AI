import { Router, Request, Response } from 'express';
import { requireWriteConfirm } from '../middleware/safeMode.js';
import { jwtAuthMiddleware } from '../middleware/jwtAuth.js';
import { requireAuth, requireRole } from '../middleware/rbac.js';
import pg from 'pg';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { promisify } from 'util';
import { exec } from 'child_process';
const { Pool } = pg;

const execAsync = promisify(exec);

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

// POST /api/db/backup - Ручное создание бэкапа
router.post(
  '/backup',
  jwtAuthMiddleware,
  requireAuth,
  requireRole(['admin']),
  requireWriteConfirm,
  async (req: Request, res: Response) => {
    try {
      console.log('📦 Starting manual database backup...');

      // Generate timestamp for backup filename
      const now = new Date();
      const timestamp = now
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}Z/, '')
        .replace('T', '_');
      const filename = `manual_backup_${timestamp}.sql.gz`;
      const backupsPath = path.join(process.cwd(), 'out', 'backups');
      const backupPath = path.join(backupsPath, filename);

      // Ensure backups directory exists
      await fs.mkdir(backupsPath, { recursive: true });

      // Use pg_dump with environment variables from DATABASE_URL or PG* vars
      const pgHost = process.env.PGHOST || 'localhost';
      const pgPort = process.env.PGPORT || '5432';
      const pgDatabase = process.env.PGDATABASE || 'postgres';
      const pgUser = process.env.PGUSER || 'postgres';
      const pgPassword = process.env.PGPASSWORD || '';

      // Build pg_dump command with compression
      const dumpCommand = `PGPASSWORD="${pgPassword}" pg_dump -h ${pgHost} -p ${pgPort} -U ${pgUser} ${pgDatabase} | gzip > "${backupPath}"`;

      console.log(`📦 Running pg_dump to ${backupPath}...`);
      const { stdout, stderr } = await execAsync(dumpCommand);

      if (stderr && !stderr.includes('pg_dump:')) {
        console.warn('pg_dump stderr:', stderr);
      }

      // Calculate SHA256 checksum
      const fileBuffer = await fs.readFile(backupPath);
      const hash = crypto.createHash('sha256');
      hash.update(fileBuffer);
      const sha256 = hash.digest('hex');

      // Write checksum to checksums.txt
      const checksumsPath = path.join(backupsPath, 'checksums.txt');
      const checksumEntry = `${filename} ${sha256}\n`;
      await fs.appendFile(checksumsPath, checksumEntry);

      console.log('✅ Manual database backup created successfully');
      console.log(`📋 SHA256: ${sha256}`);

      res.json({
        success: true,
        message: 'Manual backup created successfully',
        backup: {
          filename,
          path: backupPath,
          sha256,
          size: fileBuffer.length,
          created_at: now.toISOString(),
        },
      });
    } catch (error: any) {
      console.error('❌ Manual database backup failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create manual backup',
        details: error.message,
      });
    }
  }
);

// GET /api/db/backups - Получение списка бэкапов
router.get(
  '/backups',
  jwtAuthMiddleware,
  requireAuth,
  requireRole(['admin']),
  async (req: Request, res: Response) => {
    try {
      const backupsPath = path.join(process.cwd(), 'out', 'backups');
      const checksumsPath = path.join(backupsPath, 'checksums.txt');

      // Read backups directory
      let files: string[] = [];
      try {
        files = await fs.readdir(backupsPath);
      } catch (error) {
        console.warn('Could not read backups directory:', error);
        return res.json({
          success: true,
          backups: [],
          message: 'No backups directory found',
        });
      }

      // Read checksums file
      let checksums: { [key: string]: string } = {};
      try {
        const checksumsContent = await fs.readFile(checksumsPath, 'utf8');
        const lines = checksumsContent.split('\n');
        for (const line of lines) {
          if (line.trim()) {
            const [filename, checksum] = line.split(' ');
            if (filename && checksum) {
              checksums[filename] = checksum;
            }
          }
        }
      } catch (error) {
        console.warn('Could not read checksums file:', error);
      }

      // Filter backup files and get their stats
      const backupFiles = files
        .filter(
          file =>
            (file.startsWith('backup_') || file.startsWith('manual_backup_')) &&
            file.endsWith('.sql.gz')
        )
        .map(async filename => {
          const filePath = path.join(backupsPath, filename);
          try {
            const stats = await fs.stat(filePath);
            return {
              filename,
              path: filePath,
              size: stats.size,
              created_at: stats.mtime.toISOString(),
              sha256: checksums[filename] || null,
              type: filename.startsWith('manual_backup_')
                ? 'manual'
                : 'scheduled',
            };
          } catch (error) {
            console.warn(`Could not stat file ${filename}:`, error);
            return null;
          }
        });

      // Resolve all file stats
      const resolvedBackups = (await Promise.all(backupFiles)).filter(Boolean);

      // Sort by creation date (newest first)
      resolvedBackups.sort((a, b) => {
        if (!a || !b) return 0;
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });

      res.json({
        success: true,
        backups: resolvedBackups,
        total_count: resolvedBackups.length,
      });
    } catch (error: any) {
      console.error('❌ Failed to list backups:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to list backups',
        details: error.message,
      });
    }
  }
);

// POST /api/db/restore - Восстановление из бэкапа с проверкой sha256
router.post(
  '/restore',
  jwtAuthMiddleware,
  requireAuth,
  requireRole(['admin']),
  requireWriteConfirm,
  async (req: Request, res: Response) => {
    try {
      const { filename, sha256: providedSha256 } = req.body;

      if (!filename) {
        return res.status(400).json({
          success: false,
          error: 'Filename is required',
        });
      }

      if (!providedSha256) {
        return res.status(400).json({
          success: false,
          error: 'SHA256 checksum is required for security verification',
        });
      }

      const backupsPath = path.join(process.cwd(), 'out', 'backups');
      const backupPath = path.join(backupsPath, filename);
      const checksumsPath = path.join(backupsPath, 'checksums.txt');

      // Check if backup file exists
      try {
        await fs.access(backupPath);
      } catch (error) {
        return res.status(404).json({
          success: false,
          error: 'Backup file not found',
          filename,
        });
      }

      // Read checksums and verify SHA256
      let expectedSha256: string | null = null;
      try {
        const checksumsContent = await fs.readFile(checksumsPath, 'utf8');
        const lines = checksumsContent.split('\n');
        for (const line of lines) {
          if (line.trim()) {
            const [backupFilename, checksum] = line.split(' ');
            if (backupFilename === filename && checksum) {
              expectedSha256 = checksum;
              break;
            }
          }
        }
      } catch (error) {
        console.warn('Could not read checksums file:', error);
      }

      if (!expectedSha256) {
        return res.status(400).json({
          success: false,
          error: 'Backup checksum not found in registry',
          filename,
        });
      }

      // Verify SHA256 checksum
      const fileBuffer = await fs.readFile(backupPath);
      const hash = crypto.createHash('sha256');
      hash.update(fileBuffer);
      const actualSha256 = hash.digest('hex');

      if (actualSha256 !== providedSha256) {
        return res.status(400).json({
          success: false,
          error: 'SHA256 checksum mismatch',
          details: {
            provided: providedSha256,
            actual: actualSha256,
            expected: expectedSha256,
          },
        });
      }

      if (actualSha256 !== expectedSha256) {
        return res.status(400).json({
          success: false,
          error: 'File integrity check failed',
          details: {
            actual: actualSha256,
            expected: expectedSha256,
          },
        });
      }

      // Perform restore
      console.log(`🔄 Starting database restore from ${filename}...`);

      const pgHost = process.env.PGHOST || 'localhost';
      const pgPort = process.env.PGPORT || '5432';
      const pgDatabase = process.env.PGDATABASE || 'postgres';
      const pgUser = process.env.PGUSER || 'postgres';
      const pgPassword = process.env.PGPASSWORD || '';

      // Build restore command
      const restoreCommand = `gunzip -c "${backupPath}" | PGPASSWORD="${pgPassword}" psql -h ${pgHost} -p ${pgPort} -U ${pgUser} -d ${pgDatabase}`;

      console.log(`🔄 Running restore command...`);
      const { stdout, stderr } = await execAsync(restoreCommand);

      if (stderr && !stderr.includes('NOTICE') && !stderr.includes('INFO')) {
        console.warn('psql stderr:', stderr);
        return res.status(500).json({
          success: false,
          error: 'Database restore failed',
          details: stderr,
        });
      }

      console.log('✅ Database restore completed successfully');

      res.json({
        success: true,
        message: 'Database restored successfully',
        restore: {
          filename,
          sha256: actualSha256,
          restored_at: new Date().toISOString(),
          size: fileBuffer.length,
        },
      });
    } catch (error: any) {
      console.error('❌ Database restore failed:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to restore database',
        details: error.message,
      });
    }
  }
);

// DEPRECATED: Runtime DDL is disabled. Use Drizzle migrations instead.
// Run 'npx drizzle-kit generate:pg' to create migrations from schema changes.
/*
router.post("/apply-ddl", jwtAuthMiddleware, requireAuth, requireRole(['admin']), requireWriteConfirm, async (req: Request, res: Response) => {
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
*/

export default router;

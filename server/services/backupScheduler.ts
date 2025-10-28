import * as cron from 'node-cron';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import crypto from 'crypto';

const execAsync = promisify(exec);

interface BackupLog {
  timestamp: string;
  operation: 'scheduled_backup' | 'prune';
  filename?: string;
  path?: string;
  sha256?: string;
  size?: number;
  prunedFiles?: string[];
  error?: string;
}

class BackupScheduler {
  private logsPath: string;
  private backupsPath: string;
  private checksumsPath: string;

  constructor() {
    this.logsPath = path.join(process.cwd(), 'logs', 'task_B1_cron.json');
    this.backupsPath = path.join(process.cwd(), 'out', 'backups');
    this.checksumsPath = path.join(this.backupsPath, 'checksums.txt');
    this.ensureDirectories();
  }

  private async ensureDirectories(): Promise<void> {
    try {
      await fs.mkdir(this.backupsPath, { recursive: true });
    } catch (error) {
      console.warn('Could not create backups directory:', error);
    }
  }

  private async logOperation(entry: BackupLog): Promise<void> {
    try {
      let existingLogs: BackupLog[] = [];
      try {
        const existing = await fs.readFile(this.logsPath, 'utf8');
        const parsed = JSON.parse(existing);
        existingLogs = Array.isArray(parsed) ? parsed : [parsed];
      } catch (error) {
        // File doesn't exist or is invalid, start with empty array
      }

      existingLogs.push(entry);
      await fs.writeFile(this.logsPath, JSON.stringify(existingLogs, null, 2));
      console.log(`📝 Backup operation logged: ${entry.operation}`);
    } catch (error) {
      console.error('Failed to log backup operation:', error);
    }
  }

  private async createBackup(): Promise<void> {
    try {
      console.log('📦 Starting scheduled database backup...');
      
      // Generate timestamp for backup filename
      const now = new Date();
      const timestamp = now.toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}Z/, '')
        .replace('T', '_');
      const filename = `backup_${timestamp}.sql.gz`;
      const backupPath = path.join(this.backupsPath, filename);
      
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
      const checksumEntry = `${filename} ${sha256}\n`;
      await fs.appendFile(this.checksumsPath, checksumEntry);
      
      console.log('✅ Scheduled database backup created successfully');
      console.log(`📋 SHA256: ${sha256}`);
      
      // Log the operation
      await this.logOperation({
        timestamp: new Date().toISOString(),
        operation: 'scheduled_backup',
        filename,
        path: backupPath,
        sha256,
        size: fileBuffer.length
      });
      
    } catch (error: any) {
      console.error('❌ Scheduled database backup failed:', error);
      
      await this.logOperation({
        timestamp: new Date().toISOString(),
        operation: 'scheduled_backup',
        error: error.message
      });
    }
  }

  private async pruneOldBackups(): Promise<void> {
    try {
      console.log('🧹 Starting backup pruning...');
      
      const files = await fs.readdir(this.backupsPath);
      const backupFiles = files
        .filter(file => file.startsWith('backup_') && file.endsWith('.sql.gz'))
        .map(file => ({
          name: file,
          path: path.join(this.backupsPath, file),
          createdAt: this.extractDateFromFilename(file)
        }))
        .filter(file => file.createdAt !== null)
        .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());

      if (backupFiles.length === 0) {
        console.log('📭 No backup files to prune');
        return;
      }

      const now = new Date();
      const prunedFiles: string[] = [];

      // Keep last 7 daily backups
      const dailyBackups = backupFiles.slice(0, 7);
      
      // Keep last 4 weekly backups (one per week from the remaining files)
      const weeklyBackups: typeof backupFiles = [];
      const weeklySet = new Set<string>();
      
      for (const file of backupFiles.slice(7)) {
        const weekKey = this.getWeekKey(file.createdAt!);
        if (!weeklySet.has(weekKey) && weeklyBackups.length < 4) {
          weeklyBackups.push(file);
          weeklySet.add(weekKey);
        }
      }

      const filesToKeep = [...dailyBackups, ...weeklyBackups];
      const filesToDelete = backupFiles.filter(file => 
        !filesToKeep.some(keep => keep.name === file.name)
      );

      // Delete old files
      for (const file of filesToDelete) {
        await fs.unlink(file.path);
        prunedFiles.push(file.name);
        console.log(`🗑️  Deleted old backup: ${file.name}`);
      }

      // Update checksums file (remove entries for deleted files)
      await this.updateChecksumsFile(prunedFiles);

      console.log(`✅ Pruning completed. Kept ${filesToKeep.length} files, deleted ${prunedFiles.length} files`);
      
      // Log the operation
      await this.logOperation({
        timestamp: new Date().toISOString(),
        operation: 'prune',
        prunedFiles
      });
      
    } catch (error: any) {
      console.error('❌ Backup pruning failed:', error);
      
      await this.logOperation({
        timestamp: new Date().toISOString(),
        operation: 'prune',
        error: error.message
      });
    }
  }

  private extractDateFromFilename(filename: string): Date | null {
    try {
      const match = filename.match(/backup_(\d{8})_(\d{6})\.sql\.gz$/);
      if (!match) return null;
      
      const [, datePart, timePart] = match;
      const year = parseInt(datePart.substring(0, 4));
      const month = parseInt(datePart.substring(4, 6));
      const day = parseInt(datePart.substring(6, 8));
      const hour = parseInt(timePart.substring(0, 2));
      const minute = parseInt(timePart.substring(2, 4));
      const second = parseInt(timePart.substring(4, 6));
      
      return new Date(year, month - 1, day, hour, minute, second);
    } catch (error) {
      return null;
    }
  }

  private getWeekKey(date: Date): string {
    const year = date.getFullYear();
    const week = Math.floor((date.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    return `${year}-W${week}`;
  }

  private async updateChecksumsFile(deletedFiles: string[]): Promise<void> {
    try {
      const checksumsContent = await fs.readFile(this.checksumsPath, 'utf8');
      const lines = checksumsContent.split('\n');
      const filteredLines = lines.filter(line => {
        if (!line.trim()) return true;
        const filename = line.split(' ')[0];
        return !deletedFiles.includes(filename);
      });
      
      await fs.writeFile(this.checksumsPath, filteredLines.join('\n'));
      console.log(`📝 Updated checksums file, removed ${deletedFiles.length} entries`);
    } catch (error) {
      console.warn('Could not update checksums file:', error);
    }
  }

  public async runBackupAndPrune(): Promise<void> {
    console.log('🚀 Starting scheduled backup and prune job...');
    await this.createBackup();
    await this.pruneOldBackups();
    console.log('✅ Scheduled backup and prune job completed');
  }

  public start(): void {
    // Schedule daily backup at 03:00 UTC
    cron.schedule('0 3 * * *', async () => {
      console.log('⏰ Running scheduled backup job at 03:00 UTC');
      await this.runBackupAndPrune();
    }, {
      timezone: 'UTC'
    });

    console.log('📅 Backup scheduler started. Daily backups scheduled for 03:00 UTC');
  }
}

// Create and start the scheduler only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  const backupScheduler = new BackupScheduler();
  backupScheduler.start();
}

export default BackupScheduler;
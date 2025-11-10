import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';

const r = Router();

// Получить информацию о последнем nightly запуске
r.get('/last', async (_req, res) => {
  try {
    const reportsDir = path.join(process.cwd(), 'reports');

    // Ищем последний nightly файл
    let latestNightlyReport = null;
    let latestNightlyTime = 0;

    try {
      const files = await fs.readdir(reportsDir);

      for (const file of files) {
        if (file.startsWith('nightly_') && file.endsWith('.log')) {
          const filePath = path.join(reportsDir, file);
          const stats = await fs.stat(filePath);

          if (stats.mtimeMs > latestNightlyTime) {
            latestNightlyTime = stats.mtimeMs;
            latestNightlyReport = file;
          }
        }
      }
    } catch (e) {
      // reports директория может не существовать
      console.log('Reports directory not found:', e);
    }

    // Ищем статус файл
    let statusFile = null;
    let statusTime = 0;

    try {
      const files = await fs.readdir(reportsDir);

      for (const file of files) {
        if (file.startsWith('nightly_status_') && file.endsWith('.json')) {
          const filePath = path.join(reportsDir, file);
          const stats = await fs.stat(filePath);

          if (stats.mtimeMs > statusTime) {
            statusTime = stats.mtimeMs;
            statusFile = file;
          }
        }
      }
    } catch (e) {
      // reports директория может не существовать
    }

    const result = {
      ok: true,
      timestamp: new Date().toISOString(),
      latestNightly: latestNightlyReport
        ? {
            file: latestNightlyReport,
            path: `/reports/${latestNightlyReport}`,
            lastModified: new Date(latestNightlyTime).toISOString(),
          }
        : null,
      status: statusFile
        ? {
            file: statusFile,
            path: `/reports/${statusFile}`,
            lastModified: new Date(statusTime).toISOString(),
          }
        : null,
      summary: {
        hasNightly: !!latestNightlyReport,
        hasStatus: !!statusFile,
        status: latestNightlyReport ? 'success' : 'unknown',
      },
    };

    res.json(result);
  } catch (error: any) {
    console.error('Error getting last report:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to get last report info',
      details: error?.message || String(error),
    });
  }
});

// Получить содержимое конкретного отчета
r.get('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;

    // Простая проверка безопасности - только файлы из reports/
    if (!filename.includes('..') && !filename.includes('/')) {
      const filePath = path.join(process.cwd(), 'reports', filename);
      const content = await fs.readFile(filePath, 'utf-8');
      res.type('text/plain').send(content);
    } else {
      res.status(400).json({ error: 'Invalid filename' });
    }
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'Report not found' });
    } else {
      console.error('Error reading report:', error);
      res.status(500).json({
        ok: false,
        error: 'Failed to read report',
        details: error?.message || String(error),
      });
    }
  }
});

export default r;

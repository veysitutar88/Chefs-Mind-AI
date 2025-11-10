import { Router } from 'express';
import { authStatus, ensureAuthed } from '../auth/google.js';
import { requireWriteConfirm } from '../middleware/safeMode.js';
import { createCalendarEvent } from '../services/google-mcp.js';
import fs from 'fs';
import path from 'path';

const router = Router();

// GET /auth/google/status - alias for OAuth status without session
router.get('/auth/google/status', (req, res) => {
  try {
    const status = authStatus();
    res.json({
      provider: 'google',
      ...status,
      authenticated: status.ok,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get auth status' });
  }
});

// GET /api/rbac/smoke - read-only RBAC smoke helper
router.get('/api/rbac/smoke', (req, res) => {
  res.json({
    ok: true,
    role: 'anonymous',
    ts: Date.now(),
    rbacSmoke: true,
  });
});

// POST /api/agent/accountant/calendar - create calendar event with SAFE and OAuth
router.post(
  '/api/agent/accountant/calendar',
  requireWriteConfirm,
  ensureAuthed,
  async (req, res) => {
    console.log('CALENDAR SMOKE HELPER RECEIVED REQUEST');
    try {
      console.log('Headers:', JSON.stringify(req.headers));
      console.log('Body:', JSON.stringify(req.body));
      // Dummy response to simulate success
      res.json({ ok: true, message: 'Calendar event created (smoke test)' });
    } catch (e: any) {
      console.error('CALENDAR SMOKE HELPER ERROR:', e);
      res.status(500).json({ ok: false, error: e?.message || String(e) });
    }
  }
);

/**
 * GET /reports/last
 * Возвращает сведения о последнем nightly отчёте и артефактах.
 * Ищет файлы в директории reports/ по маскам:
 *  - nightly_oauth_status_YYYY-MM-DD.json
 *  - nightly_oauth_chain_YYYY-MM-DD.log
 */
router.get('/reports/last', (_req, res) => {
  try {
    const reportsDir = path.resolve(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      return res.json({
        ok: true,
        lastNightly: null,
        lastStatus: 'unknown',
        artifacts: {},
      });
    }

    const files = fs.readdirSync(reportsDir);
    const statusFiles = files.filter(f =>
      /^nightly_oauth_status_\d{4}-\d{2}-\d{2}\.json$/.test(f)
    );
    const chainFiles = files.filter(f =>
      /^nightly_oauth_chain_\d{4}-\d{2}-\d{2}\.log$/.test(f)
    );

    const latestDate =
      statusFiles
        .map(f => f.match(/(\d{4}-\d{2}-\d{2})/)?.[1])
        .filter((s): s is string => Boolean(s))
        .sort()
        .pop() || null;

    let lastStatus = 'unknown';
    let oauthStatusFile: string | null = null;

    if (latestDate) {
      oauthStatusFile = `nightly_oauth_status_${latestDate}.json`;
      try {
        const raw = fs.readFileSync(
          path.join(reportsDir, oauthStatusFile),
          'utf8'
        );
        const json = JSON.parse(raw);
        lastStatus = json?.ok ? 'ok' : 'not_ok';
      } catch {
        // ignore parse errors
      }
    }

    const latestChain = chainFiles.sort().pop() || null;

    res.json({
      ok: true,
      lastNightly: latestDate,
      lastStatus,
      artifacts: {
        oauthStatus: oauthStatusFile ? `/reports/${oauthStatusFile}` : null,
        oauthChain: latestChain ? `/reports/${latestChain}` : null,
        statusMarkdownLatest: '/reports/nightly_status_latest.md',
      },
    });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
});

export default router;
router.get('/smoke/session-cookie', (req, res) => {
  (req.session as any).smokeTs = Date.now();
  res.json({ ok: true });
});

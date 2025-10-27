import { Router } from "express";
import session from "express-session";
import { getAuthUrl, handleCallback, authStatus, logout, ensureAuthed } from "../auth/google.js";
import { listCalendars, createDoc, createSheet, listSpreadsheets, createEvent } from "../services/google-mcp.js";

const r = Router();

// session middleware теперь подключается глобально в auth.ts

// старт авторизации (для совместимости с smoke)
r.get("/login", (_req, res) => {
  const url = getAuthUrl();
  res.redirect(url);
});

// старт авторизации
r.get("/start", (_req, res) => {
  const url = getAuthUrl();
  res.redirect(url);
});

// коллбек от Google
r.get("/callback", async (req, res) => {
  try {
    await handleCallback(req, res);
    res.send(`<html><body>Google OAuth: OK. Можно закрыть вкладку. <a href="/auth/google/status" target="_blank">Status</a></body></html>`);
  } catch(e:any){
    res.status(500).send(`OAuth error: ${e?.message||e}`);
  }
});

// статус/логаут с расширенной информацией
r.get("/status", (_req, res) => {
  const status = authStatus();
  const scopes = (process.env.GOOGLE_SCOPES||"").split(/\s+/).filter(Boolean);
  
  res.json({
    provider: "google",
    ...status,
    scopes: scopes,
    scopes_count: scopes.length,
    configured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REDIRECT_URI)
  });
});

r.post("/logout", (_req, res) => { logout(); res.json({ ok:true }); });

// тест создания события в календаре
r.post("/test-event", ensureAuthed, async (req, res) => {
  try {
    const { summary = "Test Event", startTime, description = "Test event created via smoke test" } = req.body;
    
    if (!startTime) {
      return res.status(400).json({
        ok: false,
        error: "startTime is required"
      });
    }
    
    const startDate = new Date(startTime);
    if (isNaN(startDate.getTime())) {
      return res.status(400).json({
        ok: false,
        error: "Invalid startTime format"
      });
    }
    
    const eventId = await createEvent({
      summary,
      startTime: startDate,
      description
    });
    
    res.json({
      ok: true,
      eventId,
      message: "Test event created successfully",
      test_summary: summary,
      test_start: startDate.toISOString()
    });
  } catch (error: any) {
    console.error("Error creating test event:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to create test event",
      details: error?.message || String(error)
    });
  }
});

// smoke-инструменты (работают только после авторизации)
r.get("/calendars", ensureAuthed, async (_req, res) => {
  try { res.json({ ok:true, items: await listCalendars() }); } 
  catch(e:any){ res.status(500).json({ ok:false, error: e?.message||String(e) }); }
});
r.post("/docs", ensureAuthed, async (req, res) => {
  try { res.json({ ok:true, doc: await createDoc(req.body?.title || "Chef's Mind — Doc") }); } 
  catch(e:any){ res.status(500).json({ ok:false, error: e?.message||String(e) }); }
});
r.post("/sheets", ensureAuthed, async (req, res) => {
  try { res.json({ ok:true, sheet: await createSheet(req.body?.title || "Chef's Mind — Sheet") }); } 
  catch(e:any){ res.status(500).json({ ok:false, error: e?.message||String(e) }); }
});
r.get("/spreadsheets", ensureAuthed, async (_req, res) => {
  try { res.json({ ok:true, items: await listSpreadsheets() }); } 
  catch(e:any){ res.status(500).json({ ok:false, error: e?.message||String(e) }); }
});

export default r;

import { Router } from "express";
import session from "express-session";
import { getAuthUrl, handleCallback, authStatus, logout, ensureAuthed } from "../auth/google";
import { listCalendars, createDoc, createSheet, listSpreadsheets } from "../services/google-mcp";

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

// статус/логаут
r.get("/status", (_req, res) => res.json({ provider:"google", ...authStatus() }));
r.post("/logout", (_req, res) => { logout(); res.json({ ok:true }); });

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

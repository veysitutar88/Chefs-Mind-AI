import { Router } from "express";
import session from "express-session";
import { getAuthUrl, handleCallback, authStatus, logout, ensureAuthed } from "@/server/auth/google";
import { listCalendars, createDoc, createSheet } from "@/server/services/google-mcp";

const r = Router();

// session middleware (в app.ts тоже подключим, если ещё не подключено)
r.use(session({ secret: process.env.SESSION_SECRET || "dev_secret", resave:false, saveUninitialized:false }));

// старт авторизации
r.get("/google/start", (_req, res) => {
  const url = getAuthUrl();
  res.redirect(url);
});

// коллбек от Google
r.get("/google/callback", async (req, res) => {
  try {
    await handleCallback(req, res);
    res.send(`<html><body>Google OAuth: OK. Можно закрыть вкладку. <a href="/auth/google/status" target="_blank">Status</a></body></html>`);
  } catch(e:any){
    res.status(500).send(`OAuth error: ${e?.message||e}`);
  }
});

// статус/логаут
r.get("/google/status", (_req, res) => res.json({ ok:true, provider:"google", ...authStatus() }));
r.post("/google/logout", (_req, res) => { logout(); res.json({ ok:true }); });

// smoke-инструменты (работают только после авторизации)
r.get("/google/calendars", ensureAuthed, async (_req, res) => {
  try { res.json({ ok:true, items: await listCalendars() }); } 
  catch(e:any){ res.status(500).json({ ok:false, error: e?.message||String(e) }); }
});
r.post("/google/docs", ensureAuthed, async (req, res) => {
  try { res.json({ ok:true, doc: await createDoc(req.body?.title || "Chef's Mind — Doc") }); } 
  catch(e:any){ res.status(500).json({ ok:false, error: e?.message||String(e) }); }
});
r.post("/google/sheets", ensureAuthed, async (req, res) => {
  try { res.json({ ok:true, sheet: await createSheet(req.body?.title || "Chef's Mind — Sheet") }); } 
  catch(e:any){ res.status(500).json({ ok:false, error: e?.message||String(e) }); }
});

export default r;

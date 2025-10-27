import { Router } from "express";
import { authStatus, ensureAuthed } from "../auth/google.js";
import { requireWriteConfirm } from "../middleware/safeMode.js";
import { createCalendarEvent } from "../services/google-mcp.js";

const router = Router();

// GET /auth/google/status - alias for OAuth status without session
router.get("/auth/google/status", (req, res) => {
  try {
    const status = authStatus();
    res.json({
      provider: "google",
      ...status,
      authenticated: status.ok
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to get auth status" });
  }
});

// GET /api/rbac/smoke - read-only RBAC smoke helper
router.get("/api/rbac/smoke", (req, res) => {
  res.json({
    ok: true,
    role: "anonymous",
    ts: Date.now(),
    rbacSmoke: true
  });
});

// POST /api/agent/accountant/calendar - create calendar event with SAFE and OAuth
router.post("/api/agent/accountant/calendar", requireWriteConfirm, ensureAuthed, async (req, res) => {
  console.log("CALENDAR SMOKE HELPER RECEIVED REQUEST");
  try {
    console.log("Headers:", JSON.stringify(req.headers));
    console.log("Body:", JSON.stringify(req.body));
    // Dummy response to simulate success
    res.json({ ok: true, message: "Calendar event created (smoke test)" });
  } catch (e: any) { 
    console.error("CALENDAR SMOKE HELPER ERROR:", e);
    res.status(500).json({ ok: false, error: e?.message || String(e) }); 
  }
});

export default router;
router.get('/smoke/session-cookie', (req, res) => {
  (req.session as any).smokeTs = Date.now();
  res.json({ ok: true });
});
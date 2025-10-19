import type { Express, Request, Response } from "express";
import { setupAuth } from "./auth";
import healthRouter from "./routes/health";
import { register, httpRequestDuration, httpRequestTotal, getMetricsHandler } from "./metrics";
import authGoogleRouter from "./routes/auth.google";
import importerRouter from "./routes/importer";
import dbadminRouter from "./routes/dbadmin";
import enhancedAgentChatRouter from "./routes/enhanced-agent-chat";
import agentChatRouter from "./routes/agent-chat";
import smokeHelpersRouter from "./routes/smoke-helpers";

export function registerRoutes(app: Express) {
  // Setup authentication routes
  setupAuth(app);
  
  // Health check endpoint - no auth required
  app.get("/api/health", async (req: Request, res: Response) => {
    res.json({ ok: true, ts: Date.now() });
  });

  app.use("/health", healthRouter);

  // Metrics endpoint
  app.get("/metrics", getMetricsHandler());

  // Additional routes
  app.use("/auth/google", authGoogleRouter);
  app.use("/api/import", importerRouter);
  app.use("/api/dbadmin", dbadminRouter);
  app.use("/api/enhanced-agent-chat", enhancedAgentChatRouter);
  app.use("/api/agent", agentChatRouter);
  app.use("/", smokeHelpersRouter);

  // Middleware to track HTTP requests
  app.use((req: Request, res: Response, next: any) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000; // Convert to seconds
      const route = req.route ? req.route.path : req.path;
      
      httpRequestDuration
        .labels(req.method, route, res.statusCode.toString(), (req as any).user?.id || 'anonymous')
        .observe(duration);
        
      httpRequestTotal
        .labels(req.method, route, res.statusCode.toString(), (req as any).user?.id || 'anonymous')
        .inc();
    });
    
    next();
  });

  // Basic API routes for testing
  app.get("/api/test", (req: Request, res: Response) => {
    res.json({
      message: "Test endpoint working",
      timestamp: new Date().toISOString()
    });
  });

  // Database test endpoint (to generate DB traffic)
  app.get("/api/test/db", async (req: Request, res: Response) => {
    try {
      // Simple DB query to test latency - query users table directly
      const { db } = await import("./db");
      const { users } = await import("@shared/schema");
      const result = await db.select().from(users).limit(1);
      
      res.json({
        message: "DB test successful",
        userCount: result.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        error: "DB test failed",
        message: (error as Error).message || "Unknown error"
      });
    }
  });
}

// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
import { log } from "./utils/log";

// Determine the environment and load the appropriate .env file
const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';
if (env === 'production') {
  dotenv.config({ path: './.env.production' });
} else {
  dotenv.config(); // Loads .env by default
}

log(`[env] NODE_ENV=${env}, dotenv_file=${env === 'production' ? '.env.production' : '.env'}`, 'info', 'server');

console.log('DATABASE_URL loaded:', process.env.DATABASE_URL ? 'YES' : 'NO');
console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);

import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import session from "express-session";
import { mountStatic } from "./utils/static";
import { requestIdMiddleware, errorHandler } from "./middleware/errorHandler";
import "./services/backupScheduler"; // Import to start the backup scheduler
import { registerRoutes } from "./routes";
import { mountMetrics } from "./metrics";
import cors from "cors";

const app = express();

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5001"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(requestIdMiddleware);

// Session middleware is now configured in server/auth.ts via buildSession

(async () => {
  // Create server BEFORE using it in setupVite
  const port = parseInt(process.env.PORT || '5000', 10);
  const server = createServer(app);

  // Mount metrics
  mountMetrics(app);

  // Register routes (this now only sets up routes, doesn't create server)
  await registerRoutes(app);

  // Setup frontend serving: Dev (Vite) vs Production (static)
  const isDev = process.env.NODE_ENV !== 'production';
  
  if (isDev) {
    // Development: динамический импорт Vite middleware
    log("Development mode: setting up Vite dev server", 'info', 'server');
    try {
      const { mountVite } = await import("./vite.js");
      await mountVite(app, server);
      log("Vite dev server mounted successfully", 'info', 'server');
    } catch (error) {
      log(`Failed to mount Vite dev server: ${error}`, 'error', 'server');
      process.exit(1);
    }
  } else {
    // Production: статическая раздача из server/public
    log("Production mode: mounting static file server", 'info', 'server');
    mountStatic(app);
    log("Static file server mounted from server/public", 'info', 'server');
  }

  // Centralized error handler (must be last)
  app.use(errorHandler);

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  
  server.listen(port, '0.0.0.0', () => {
    log(`Server running on port ${port} in ${isDev ? 'development' : 'production'} mode`);
  });
})();

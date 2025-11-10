import { envSchema } from './config/env.schema.js';
import type { Env } from './config/env.schema.js';
import express from 'express';
import morgan from 'morgan';
import { registerRoutes } from './routes.js';
import { metricsMiddleware } from './middleware/metrics.js';
import cors from 'cors';
import helmet from 'helmet';
import { Server } from 'socket.io';
import { createServer } from 'http';
import 'dotenv/config';

// --- Environment Validation ---
const envResult = envSchema.safeParse(process.env);
if (!envResult.success) {
  console.error('[ENV Validation Error]', envResult.error.flatten());
  throw new Error('Invalid environment variables');
}
export const env: Env = envResult.data;
const PORT = env.PORT;
// --- End Validation ---

const app = express();

// CORS configuration
const whitelist = (env.CORS_ORIGIN || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || whitelist.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Helmet with CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: [
          "'self'",
          'http://localhost:5003',
          'http://localhost:3000',
          'http://localhost:3001',
          ...(process.env.CORS_ORIGIN?.split(',').map(s => s.trim()) || []),
        ],
      },
    },
  })
);

app.use(express.json());

// Wire up morgan logger, skipping health and metrics
app.use(
  morgan('combined', {
    skip: (req: any, res: any) =>
      req.url === '/health' || req.url === '/metrics',
  })
);

// Wire up metrics middleware
app.use(metricsMiddleware);

registerRoutes(app);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        ...(process.env.CORS_ORIGIN?.split(',').map(s => s.trim()) || []),
      ];
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST'],
  },
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

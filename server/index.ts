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
import swaggerUi from 'swagger-ui-express';

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

// CORS configuration - добавлен localhost:3001 для фронтенда
const allowedOrigins = [
  'http://localhost:3001',
  'http://localhost:3000',
  ...(env.CORS_ORIGIN || '')
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Разрешаем запросы без origin (например, мобильные приложения)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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
          ...(process.env.CORS_ORIGIN?.split(',').map((s: string) => s.trim()) || []),
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

// Swagger UI documentation - статические файлы из директории docs
app.use('/docs', express.static('docs'));

// Swagger UI настройка - загрузка спецификации с /docs/openapi.json
const swaggerOptions = {
  swaggerUrl: '/docs/openapi.json',
  explorer: true,
  customSiteTitle: "Chef's Mind API Docs"
};
app.use('/docs/api', swaggerUi.serve, swaggerUi.setup(undefined, swaggerOptions));

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        ...(process.env.CORS_ORIGIN?.split(',').map((s: string) => s.trim()) || []),
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

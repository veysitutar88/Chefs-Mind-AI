#!/bin/bash

# 1) HEALTH ENDPOINT
# создаём server/routes/health.ts
mkdir -p server/routes
cat > server/routes/health.ts <<'EOR'
import { Router, Request, Response } from "express";
const router = Router();

router.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "Chef's Mind AI",
    timestamp: new Date().toISOString()
  });
});

export default router;
EOR

# 2) RATE LIMIT + MORGAN
npm install express-rate-limit morgan --save

# 3) ERROR HANDLER + подключение health
# патчим server/index.ts (добавим в конец)
cat >> server/index.ts <<'EOR'

// --- PATCH Sprint A ---
import healthRouter from "./routes/health";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

// логирование запросов
app.use(morgan("dev"));

// rate-limit для /auth/login
app.use("/auth/login", rateLimit({
  windowMs: 1 * 60 * 1000, // 1 минута
  max: 5,
  message: { error: "Too many login attempts, try again later" }
}));

// health-check
app.use(healthRouter);

// централизованный error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Error handler:", err);
  res.status(err.status || 500).json({ error: err.message || "Internal error" });
});
EOR

# 4) УБРАТЬ PASSWORD/HASH из /api/user
# патчим server/routes/user.ts (если есть)
if [ -f server/routes/user.ts ]; then
  sed -i 's/password[^,}]*/REMOVED/g' server/routes/user.ts
fi

echo "✅ Patch Sprint A applied. Теперь перезапусти проект."

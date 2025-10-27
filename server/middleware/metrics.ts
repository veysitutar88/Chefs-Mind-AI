import { httpRequestsTotal, httpLatency } from "../metrics.js";
import { Request, Response, NextFunction } from "express";

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const route = req.route ? req.route.path : "unknown_route";
    httpRequestsTotal.labels(req.method, res.statusCode.toString()).inc();
    httpLatency.labels(req.method, route, res.statusCode.toString()).observe(duration);
  });
  next();
}
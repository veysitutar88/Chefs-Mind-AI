import { Request, Response, NextFunction } from "express";
import { nanoid } from "nanoid";

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  req.requestId = nanoid(10);
  res.setHeader("X-Request-ID", req.requestId);
  next();
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const status = err.status || err.statusCode || 500;
  const errorMessage = err.message || "Internal Server Error";
  
  const errorResponse = {
    success: false,
    error: errorMessage,
    requestId: req.requestId || nanoid(10),
    ...(process.env.NODE_ENV === "development" && err.stack ? { stack: err.stack } : {})
  };

  res.status(status).json(errorResponse);
}

export function notFoundHandler(req: Request, res: Response) {
  if (req.path.startsWith("/api/") || req.path.startsWith("/auth/")) {
    res.status(404).json({
      success: false,
      error: "Not Found",
      path: req.path,
      requestId: req.requestId || nanoid(10)
    });
  } else {
    res.status(404).send("Not Found");
  }
}

import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { storage } from "../storage";

export async function jwtAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    return next();
  }

  try {
    const user = await storage.getUser(payload.userId);
    if (user) {
      req.user = user;
    }
  } catch (error) {
    console.error("JWT auth error:", error);
  }

  next();
}

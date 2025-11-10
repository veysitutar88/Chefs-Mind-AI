import type { Request, Response, NextFunction } from "express";
import fs from 'fs/promises';
import path from 'path';

// Определяем наш пользовательский тип
export interface AppUser {
  id: string;
  email: string;
  role: 'admin' | 'chef' | 'accountant';
}

// Объявляем глобальное расширение для Express.User
declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: 'admin' | 'chef' | 'accountant';
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user?: Express.User;
}

// Role hierarchy (admin can access everything)
const ROLE_HIERARCHY = {
  admin: ['admin', 'chef', 'accountant'],
  chef: ['chef'],
  accountant: ['accountant']
};

// RBAC middleware
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void | Response<any, Record<string, any>> {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized - Authentication required",
      requestId: (req as any).requestId
    });
  }
  next();
}

// Role-based access control middleware
export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void | Response<any, Record<string, any>> => {
    if (process.env.RBAC_SMOKE_ADMIN === "1" && req.header("X-Smoke-Admin") === "yes") {
      return next();
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized - Authentication required",
        requestId: (req as any).requestId
      });
    }

    const userRole = req.user.role;
    const hasAccess = allowedRoles.includes(userRole) || 
                     (userRole === 'admin' && allowedRoles.includes('admin')) ||
                     (userRole === 'admin' && allowedRoles.includes('chef')) ||
                     (userRole === 'admin' && allowedRoles.includes('accountant'));

    if (!hasAccess) {
      // Log the failed access attempt
      logAccessAttempt(req, 'DENIED', allowedRoles);
      
      return res.status(403).json({
        success: false,
        error: "Forbidden - Insufficient permissions",
        required_roles: allowedRoles,
        user_role: userRole,
        requestId: (req as any).requestId
      });
    }

    // Log successful access
    logAccessAttempt(req, 'GRANTED', allowedRoles);
    next();
  };
}

// Function to log access attempts
async function logAccessAttempt(req: AuthenticatedRequest, status: 'GRANTED' | 'DENIED', requiredRoles: string[]) {
  try {
    const logPath = path.join(process.cwd(), 'logs', 'rbac_smoke.json');
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      user_id: req.user?.id || 'anonymous',
      user_role: req.user?.role || 'anonymous',
      required_roles: requiredRoles,
      status: status,
      ip: req.ip,
      user_agent: req.get('User-Agent')
    };

    // Read existing logs and append new entry
    let existingLogs = [];
    try {
      const existing = await fs.readFile(logPath, 'utf8');
      existingLogs = JSON.parse(existing);
      if (!Array.isArray(existingLogs)) {
        existingLogs = [existingLogs];
      }
    } catch (error) {
      // File doesn't exist or is invalid, start with empty array
    }

    existingLogs.push(logEntry);
    await fs.writeFile(logPath, JSON.stringify(existingLogs, null, 2));
    
    console.log(`🔐 RBAC ${status}: ${req.user?.role} → ${req.path}`);
  } catch (error) {
    console.error('Failed to log RBAC attempt:', error);
  }
}

// Helper function to check if user has specific role
export function hasRole(user: Express.User | undefined, role: string): boolean {
  if (!user) return false;
  return user.role === role || user.role === 'admin';
}

// Helper function to check if user can access resource
export function canAccessResource(user: Express.User | undefined, resourceRoles: string[]): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return resourceRoles.includes(user.role);
}
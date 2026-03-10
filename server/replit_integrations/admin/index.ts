import { Request, Response, NextFunction } from "express";

// Simple admin credentials - in production, use environment variables or database
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin";

export interface AdminSession {
  adminId: string;
  username: string;
  loginTime: number;
}

// Extend Express Request to include admin session
declare global {
  namespace Express {
    interface Request {
      adminSession?: AdminSession;
    }
  }
}

export function initializeAdminAuth(app: any) {
  // Middleware to check admin session from URL query or cookie
  app.use((req: Request, res: Response, next: NextFunction) => {
    const adminToken = req.query.adminToken as string || req.cookies?.adminToken;
    if (adminToken) {
      // Simple validation - in production use proper jwt or encrypted sessions
      try {
        const decoded = Buffer.from(adminToken, 'base64').toString('utf-8');
        const [username, timestamp] = decoded.split(':');
        if (username === ADMIN_USERNAME) {
          req.adminSession = {
            adminId: 'admin',
            username: username,
            loginTime: parseInt(timestamp),
          };
        }
      } catch (e) {
        // Invalid token, continue
      }
    }
    next();
  });
}

export function isAdminAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.adminSession) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export function validateAdminLogin(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export function generateAdminToken(username: string): string {
  // Simple token generation - in production use proper jwt
  const timestamp = Date.now().toString();
  const token = `${username}:${timestamp}`;
  return Buffer.from(token).toString('base64');
}

import type { Express } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";
import { db } from "../../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

// Helper to exclude sensitive fields from user data
function sanitizeUser(user: any) {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

// Register auth-specific routes
export function registerAuthRoutes(app: Express): void {
  // User sign-up endpoint
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Validation
      if (!email || !password || !firstName) {
        return res.status(400).json({ message: "Email, password, and first name are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      // Check if user already exists
      const [existingUser] = await db.select().from(users).where(eq(users.email, email));
      if (existingUser) {
        return res.status(409).json({ message: "Email already registered" });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create new user
      const [newUser] = await db
        .insert(users)
        .values({
          id: randomUUID(),
          email,
          passwordHash,
          firstName,
          lastName: lastName || null,
        })
        .returning();

      // Set user in session
      (req as any).user = {
        claims: {
          sub: newUser.id,
          email: newUser.email,
        },
      };

      // Regenerate session for security
      req.session.regenerate((err) => {
        if (err) {
          return res.status(500).json({ message: "Session error" });
        }

        (req.session as any).passport = {
          user: newUser.id,
        };

        res.status(201).json({ success: true, user: sanitizeUser(newUser) });
      });
    } catch (error) {
      console.error("Sign-up error:", error);
      res.status(500).json({ message: "Sign-up failed" });
    }
  });

  // User login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      // Find user by email
      const [user] = await db.select().from(users).where(eq(users.email, email));

      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Check if user has a password hash (password-based account)
      if (!user.passwordHash) {
        return res.status(401).json({ message: "This account uses OAuth authentication" });
      }

      // Validate password
      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Set user in session
      (req as any).user = {
        claims: {
          sub: user.id,
          email: user.email,
        },
      };

      // Regenerate session for security
      req.session.regenerate((err) => {
        if (err) {
          return res.status(500).json({ message: "Session error" });
        }

        (req.session as any).passport = {
          user: user.id,
        };

        res.json({ success: true, user: sanitizeUser(user) });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // User logout endpoint (POST)
  app.post("/api/auth/logout", isAuthenticated, (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ success: true, message: "Logged out" });
    });
  });

  // User logout endpoint (GET - for redirect)
  app.get("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
      }
      res.redirect("/");
    });
  });

  // Get current authenticated user
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await authStorage.getUser(userId);
      res.json(sanitizeUser(user));
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}

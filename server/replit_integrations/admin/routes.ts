import { Express } from "express";
import { z } from "zod";
import { db } from "../../db";
import { sections, articles } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { isAdminAuthenticated, validateAdminLogin, generateAdminToken } from "./index";

export async function registerAdminRoutes(app: Express) {
  // Admin login endpoint
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }
      
      if (validateAdminLogin(username, password)) {
        const token = generateAdminToken(username);
        res.json({ success: true, token });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Admin logout endpoint
  app.post("/api/admin/logout", isAdminAuthenticated, (req, res) => {
    res.json({ success: true, message: "Logged out" });
  });

  // Get all sections (admin)
  app.get("/api/admin/sections", isAdminAuthenticated, async (req, res) => {
    try {
      const data = await db.select().from(sections);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sections" });
    }
  });

  // Create section (admin)
  app.post("/api/admin/sections", isAdminAuthenticated, async (req, res) => {
    try {
      const schema = z.object({
        slug: z.string().min(1),
        titleEn: z.string().min(1),
        titleUz: z.string().min(1),
        titleRu: z.string().min(1),
        icon: z.string().min(1),
      });
      
      const data = schema.parse(req.body);
      const [section] = await db.insert(sections).values(data).returning();
      res.status(201).json(section);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create section" });
    }
  });

  // Update section (admin)
  app.put("/api/admin/sections/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const schema = z.object({
        slug: z.string().min(1).optional(),
        titleEn: z.string().min(1).optional(),
        titleUz: z.string().min(1).optional(),
        titleRu: z.string().min(1).optional(),
        icon: z.string().min(1).optional(),
      });
      
      const data = schema.parse(req.body);
      const [section] = await db.update(sections).set(data).where(eq(sections.id, id)).returning();
      
      if (!section) {
        return res.status(404).json({ message: "Section not found" });
      }
      
      res.json(section);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to update section" });
    }
  });

  // Delete section (admin)
  app.delete("/api/admin/sections/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await db.delete(sections).where(eq(sections.id, id));
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete section" });
    }
  });

  // Get all articles (admin)
  app.get("/api/admin/articles", isAdminAuthenticated, async (req, res) => {
    try {
      const data = await db.select().from(articles);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  // Create article (admin)
  app.post("/api/admin/articles", isAdminAuthenticated, async (req, res) => {
    try {
      const schema = z.object({
        sectionId: z.number(),
        titleEn: z.string().min(1),
        titleUz: z.string().min(1),
        titleRu: z.string().min(1),
        bodyEn: z.string().min(1),
        bodyUz: z.string().min(1),
        bodyRu: z.string().min(1),
        tags: z.array(z.string()).optional(),
      });
      
      const data = schema.parse(req.body);
      const [article] = await db.insert(articles).values(data).returning();
      res.status(201).json(article);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create article" });
    }
  });

  // Update article (admin)
  app.put("/api/admin/articles/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const schema = z.object({
        sectionId: z.number().optional(),
        titleEn: z.string().min(1).optional(),
        titleUz: z.string().min(1).optional(),
        titleRu: z.string().min(1).optional(),
        bodyEn: z.string().min(1).optional(),
        bodyUz: z.string().min(1).optional(),
        bodyRu: z.string().min(1).optional(),
        tags: z.array(z.string()).optional(),
      });
      
      const data = schema.parse(req.body);
      const [article] = await db.update(articles).set(data).where(eq(articles.id, id)).returning();
      
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      res.json(article);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to update article" });
    }
  });

  // Delete article (admin)
  app.delete("/api/admin/articles/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await db.delete(articles).where(eq(articles.id, id));
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete article" });
    }
  });

  // Get admin status
  app.get("/api/admin/status", isAdminAuthenticated, (req, res) => {
    res.json({ authenticated: true, username: req.adminSession?.username });
  });
}

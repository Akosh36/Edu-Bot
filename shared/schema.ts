import { pgTable, text, serial, integer, varchar, timestamp, unique, jsonb } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth and chat models
export * from "./models/auth";
export * from "./models/chat";

import { users } from "./models/auth";

// Sections
export const sections = pgTable("sections", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  titleEn: varchar("title_en", { length: 255 }).notNull(),
  titleUz: varchar("title_uz", { length: 255 }).notNull(),
  titleRu: varchar("title_ru", { length: 255 }).notNull(),
  icon: varchar("icon", { length: 50 }).notNull(),
});

// Articles
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  sectionId: integer("section_id").references(() => sections.id).notNull(),
  titleEn: text("title_en").notNull(),
  titleUz: text("title_uz").notNull(),
  titleRu: text("title_ru").notNull(),
  bodyEn: text("body_en").notNull(),
  bodyUz: text("body_uz").notNull(),
  bodyRu: text("body_ru").notNull(),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bookmarks
export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  articleId: integer("article_id").references(() => articles.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [
  unique("unique_user_article").on(t.userId, t.articleId)
]);

export const insertSectionSchema = createInsertSchema(sections).omit({ id: true });
export const insertArticleSchema = createInsertSchema(articles).omit({ id: true, createdAt: true });
export const insertBookmarkSchema = createInsertSchema(bookmarks).omit({ id: true, createdAt: true });

export type Section = typeof sections.$inferSelect;
export type Article = typeof articles.$inferSelect;
export type Bookmark = typeof bookmarks.$inferSelect;
export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;

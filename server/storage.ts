import { db } from "./db";
import { sections, articles, bookmarks, users } from "@shared/schema";
import { eq, and, ilike, or } from "drizzle-orm";

export interface IStorage {
  getSections(): Promise<typeof sections.$inferSelect[]>;
  getArticles(sectionId?: number, search?: string): Promise<typeof articles.$inferSelect[]>;
  getArticle(id: number): Promise<typeof articles.$inferSelect | undefined>;
  getBookmarks(userId: string): Promise<any[]>;
  createBookmark(userId: string, articleId: number): Promise<typeof bookmarks.$inferSelect>;
  deleteBookmark(id: number, userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getSections() {
    return await db.select().from(sections);
  }

  async getArticles(sectionId?: number, search?: string) {
    let query = db.select().from(articles).$dynamic();
    
    if (sectionId) {
      query = query.where(eq(articles.sectionId, sectionId));
    } else if (search) {
      query = query.where(
        or(
          ilike(articles.titleEn, `%${search}%`),
          ilike(articles.titleUz, `%${search}%`),
          ilike(articles.titleRu, `%${search}%`)
        )
      );
    }
    
    return await query;
  }

  async getArticle(id: number) {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article;
  }

  async getBookmarks(userId: string) {
    const userBookmarks = await db.select({
      id: bookmarks.id,
      article: articles
    })
    .from(bookmarks)
    .innerJoin(articles, eq(bookmarks.articleId, articles.id))
    .where(eq(bookmarks.userId, userId));
    return userBookmarks;
  }

  async createBookmark(userId: string, articleId: number) {
    const [bookmark] = await db.insert(bookmarks).values({ userId, articleId }).returning();
    return bookmark;
  }

  async deleteBookmark(id: number, userId: string) {
    await db.delete(bookmarks).where(and(eq(bookmarks.id, id), eq(bookmarks.userId, userId)));
  }
}

export const storage = new DatabaseStorage();

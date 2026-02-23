import { z } from 'zod';
import { insertBookmarkSchema, articles, sections, bookmarks } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
};

export const api = {
  sections: {
    list: {
      method: 'GET' as const,
      path: '/api/content/sections' as const,
      responses: {
        200: z.array(z.custom<typeof sections.$inferSelect>()),
      },
    },
  },
  articles: {
    list: {
      method: 'GET' as const,
      path: '/api/content/articles' as const,
      input: z.object({ sectionId: z.coerce.number().optional(), search: z.string().optional() }).optional(),
      responses: {
        200: z.array(z.custom<typeof articles.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/content/articles/:id' as const,
      responses: {
        200: z.custom<typeof articles.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  chat: {
    send: {
      method: 'POST' as const,
      path: '/api/chat' as const,
      input: z.object({
        message: z.string(),
        language: z.enum(['en', 'uz', 'ru']),
        section: z.string().optional(),
      }),
      responses: {
        200: z.any(),
      },
    },
  },
  bookmarks: {
    list: {
      method: 'GET' as const,
      path: '/api/bookmarks' as const,
      responses: {
        200: z.array(z.object({
          id: z.number(),
          article: z.custom<typeof articles.$inferSelect>()
        })),
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/bookmarks' as const,
      input: z.object({ articleId: z.number() }),
      responses: {
        201: z.custom<typeof bookmarks.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/bookmarks/:id' as const,
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

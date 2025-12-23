import { z } from 'zod';
import { insertWinSchema, wins } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  wins: {
    create: {
      method: 'POST' as const,
      path: '/api/wins',
      input: z.object({}), 
      responses: {
        201: z.custom<typeof wins.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    list: {
        method: 'GET' as const,
        path: '/api/wins',
        responses: {
            200: z.array(z.custom<typeof wins.$inferSelect>()),
        }
    }
  },
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
